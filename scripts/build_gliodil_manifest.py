#!/usr/bin/env python3

from __future__ import annotations

import csv
import math
from pathlib import Path
from statistics import median

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import nibabel as nib
import numpy as np
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
DATASET_DIR = ROOT / "datasets" / "GliODIL"
RAW_DIR = DATASET_DIR / "data_GliODIL_essential"
SHOWCASE_DIR = DATASET_DIR / "showcase"
MANIFEST_CSV = DATASET_DIR / "longitudinal_manifest.csv"
MANIFEST_MD = DATASET_DIR / "longitudinal_manifest.md"


def load_binary_image(path: Path) -> tuple[nib.Nifti1Image, np.ndarray]:
    image = nib.load(str(path))
    data = np.asarray(image.dataobj) > 0
    return image, data


def compute_case_stats(case_dir: Path) -> dict[str, object]:
    seg_image, baseline_mask = load_binary_image(case_dir / "segm.nii.gz")
    _, followup_mask = load_binary_image(case_dir / "segm_rec.nii.gz")

    if baseline_mask.shape != followup_mask.shape:
        raise ValueError(f"Mask shape mismatch in {case_dir.name}")

    overlap_mask = baseline_mask & followup_mask
    baseline_only = baseline_mask & ~followup_mask
    followup_only = followup_mask & ~baseline_mask
    slice_scores = (baseline_mask.astype(np.uint8) + (2 * followup_mask.astype(np.uint8))).sum(axis=(0, 1))
    best_axial_slice = int(slice_scores.argmax())

    zooms = tuple(float(value) for value in seg_image.header.get_zooms()[:3])
    voxel_volume_mm3 = float(np.prod(zooms))
    baseline_voxels = int(baseline_mask.sum())
    followup_voxels = int(followup_mask.sum())
    overlap_voxels = int(overlap_mask.sum())
    baseline_only_voxels = int(baseline_only.sum())
    followup_only_voxels = int(followup_only.sum())

    baseline_volume_ml = baseline_voxels * voxel_volume_mm3 / 1000.0
    followup_volume_ml = followup_voxels * voxel_volume_mm3 / 1000.0
    delta_volume_ml = followup_volume_ml - baseline_volume_ml
    followup_to_baseline_ratio = followup_voxels / baseline_voxels if baseline_voxels else math.inf

    if followup_to_baseline_ratio >= 1.2:
        trend_label = "growth"
    elif followup_to_baseline_ratio <= 0.8:
        trend_label = "response"
    else:
        trend_label = "stable_like"

    case_id = case_dir.name.replace("data_", "")

    return {
        "case_id": case_id,
        "case_dir": case_dir.name,
        "has_fet": (case_dir / "FET.nii.gz").exists(),
        "shape": "x".join(str(size) for size in baseline_mask.shape),
        "voxel_spacing_mm": "x".join(f"{value:.3f}" for value in zooms),
        "voxel_volume_mm3": round(voxel_volume_mm3, 4),
        "baseline_voxels": baseline_voxels,
        "followup_voxels": followup_voxels,
        "overlap_voxels": overlap_voxels,
        "baseline_only_voxels": baseline_only_voxels,
        "followup_only_voxels": followup_only_voxels,
        "baseline_volume_ml": round(baseline_volume_ml, 3),
        "followup_volume_ml": round(followup_volume_ml, 3),
        "delta_volume_ml": round(delta_volume_ml, 3),
        "followup_to_baseline_ratio": round(followup_to_baseline_ratio, 3),
        "best_axial_slice": best_axial_slice,
        "slice_baseline_voxels": int(baseline_mask[:, :, best_axial_slice].sum()),
        "slice_followup_voxels": int(followup_mask[:, :, best_axial_slice].sum()),
        "trend_label": trend_label,
        "baseline_mask_path": str((case_dir / "segm.nii.gz").relative_to(ROOT)),
        "followup_mask_path": str((case_dir / "segm_rec.nii.gz").relative_to(ROOT)),
        "fet_path": str((case_dir / "FET.nii.gz").relative_to(ROOT)) if (case_dir / "FET.nii.gz").exists() else "",
    }


def choose_showcase_cases(rows: list[dict[str, object]]) -> list[dict[str, object]]:
    ranked_groups = [
        (
            "largest_followup_burden",
            "Largest follow-up tumor burden",
            sorted(rows, key=lambda row: (row["followup_voxels"], row["followup_only_voxels"]), reverse=True),
        ),
        (
            "largest_baseline_burden",
            "Largest baseline tumor burden",
            sorted(rows, key=lambda row: (row["baseline_voxels"], row["overlap_voxels"]), reverse=True),
        ),
        (
            "strongest_growth",
            "Largest increase from baseline to follow-up",
            sorted(rows, key=lambda row: (row["delta_volume_ml"], row["followup_voxels"]), reverse=True),
        ),
        (
            "strongest_response",
            "Largest decrease from baseline to follow-up",
            sorted(rows, key=lambda row: (row["delta_volume_ml"], -row["baseline_voxels"])),
        ),
        (
            "largest_overlap",
            "Largest shared tumor footprint across both timepoints",
            sorted(rows, key=lambda row: (row["overlap_voxels"], row["baseline_voxels"]), reverse=True),
        ),
        (
            "fet_example",
            "High-burden case with FET-PET available",
            sorted(rows, key=lambda row: (int(row["has_fet"]), row["followup_voxels"], row["baseline_voxels"]), reverse=True),
        ),
    ]

    chosen: list[dict[str, object]] = []
    used_case_dirs: set[str] = set()

    for slot, reason, ranked_rows in ranked_groups:
        for row in ranked_rows:
            case_dir = str(row["case_dir"])
            if case_dir in used_case_dirs:
                continue
            chosen.append({"slot": slot, "reason": reason, "row": row})
            used_case_dirs.add(case_dir)
            break

    fallback_rows = sorted(rows, key=lambda row: abs(row["delta_volume_ml"]), reverse=True)
    for row in fallback_rows:
        if len(chosen) >= 6:
            break
        case_dir = str(row["case_dir"])
        if case_dir in used_case_dirs:
            continue
        chosen.append({"slot": "high_delta_fill", "reason": "High absolute tumor burden change", "row": row})
        used_case_dirs.add(case_dir)

    return chosen


def normalize_background(background: np.ndarray) -> np.ndarray:
    background = np.asarray(background, dtype=np.float32)
    min_value = float(np.nanmin(background))
    max_value = float(np.nanmax(background))
    if max_value > min_value:
        background = (background - min_value) / (max_value - min_value)
    else:
        background = np.zeros_like(background, dtype=np.float32)
    return np.sqrt(np.clip(background, 0.0, 1.0))


def overlay_mask(background: np.ndarray, mask: np.ndarray, color: tuple[float, float, float]) -> np.ndarray:
    rgb = np.repeat(background[..., None], 3, axis=-1)
    alpha = 0.72
    rgb[mask] = (1.0 - alpha) * rgb[mask] + alpha * np.array(color, dtype=np.float32)
    return np.clip(rgb, 0.0, 1.0)


def render_case(case_dir: Path, row: dict[str, object], slot: str) -> Path:
    SHOWCASE_DIR.mkdir(parents=True, exist_ok=True)

    wm = np.asarray(nib.load(str(case_dir / "t1_wm.nii.gz")).dataobj, dtype=np.float32)
    gm = np.asarray(nib.load(str(case_dir / "t1_gm.nii.gz")).dataobj, dtype=np.float32)
    csf = np.asarray(nib.load(str(case_dir / "t1_csf.nii.gz")).dataobj, dtype=np.float32)
    baseline_mask = np.asarray(nib.load(str(case_dir / "segm.nii.gz")).dataobj) > 0
    followup_mask = np.asarray(nib.load(str(case_dir / "segm_rec.nii.gz")).dataobj) > 0

    axial_slice = int(row["best_axial_slice"])
    background = normalize_background((0.55 * wm[:, :, axial_slice]) + (0.30 * gm[:, :, axial_slice]) + (0.15 * csf[:, :, axial_slice]))
    baseline_slice = baseline_mask[:, :, axial_slice]
    followup_slice = followup_mask[:, :, axial_slice]
    overlap_slice = baseline_slice & followup_slice

    display_background = np.rot90(background)
    display_baseline = np.rot90(baseline_slice)
    display_followup = np.rot90(followup_slice)
    display_overlap = np.rot90(overlap_slice)

    baseline_view = overlay_mask(display_background, display_baseline, (0.05, 0.78, 1.0))
    followup_view = overlay_mask(display_background, display_followup, (1.0, 0.47, 0.10))
    overlay_view = overlay_mask(display_background, display_baseline, (0.05, 0.78, 1.0))
    overlay_view = overlay_mask(overlay_view.mean(axis=-1), display_followup, (1.0, 0.47, 0.10))
    overlay_view[display_overlap] = np.array((1.0, 0.88, 0.15), dtype=np.float32)

    figure, axes = plt.subplots(1, 3, figsize=(12, 4.1), dpi=160)
    titles = ["Baseline mask", "Follow-up mask", "Overlay"]
    panels = [baseline_view, followup_view, overlay_view]

    for axis, title, panel in zip(axes, titles, panels):
        axis.imshow(panel)
        axis.set_title(title, fontsize=11)
        axis.axis("off")

    ratio = row["followup_to_baseline_ratio"]
    ratio_text = "inf" if math.isinf(ratio) else f"{ratio:.2f}x"
    figure.suptitle(
        (
            f'GliODIL case {row["case_id"]} | {slot.replace("_", " ")} | '
            f'baseline {row["baseline_volume_ml"]:.1f} mL -> follow-up {row["followup_volume_ml"]:.1f} mL '
            f'({row["trend_label"]}, {ratio_text})'
        ),
        fontsize=12,
        y=0.98,
    )
    figure.text(
        0.5,
        0.02,
        (
            "Derived view: baseline `segm` and follow-up `segm_rec` masks over shared tissue maps "
            "`t1_wm`, `t1_gm`, `t1_csf`."
        ),
        ha="center",
        fontsize=9,
    )

    output_path = SHOWCASE_DIR / f'{slot}_{row["case_id"]}.png'
    figure.tight_layout(rect=(0, 0.05, 1, 0.93))
    figure.savefig(output_path, bbox_inches="tight")
    plt.close(figure)
    return output_path


def build_contact_sheet(image_paths: list[Path]) -> Path:
    images = [Image.open(path).convert("RGB") for path in image_paths]
    thumb_size = (960, 360)
    gap = 24
    columns = 2
    rows = math.ceil(len(images) / columns)

    prepared = [ImageOps.contain(image, thumb_size) for image in images]
    cell_width = thumb_size[0]
    cell_height = thumb_size[1]
    canvas = Image.new(
        "RGB",
        (columns * cell_width + (columns + 1) * gap, rows * cell_height + (rows + 1) * gap),
        color=(12, 14, 20),
    )

    for index, image in enumerate(prepared):
        row_index = index // columns
        col_index = index % columns
        offset_x = gap + col_index * (cell_width + gap) + (cell_width - image.width) // 2
        offset_y = gap + row_index * (cell_height + gap) + (cell_height - image.height) // 2
        canvas.paste(image, (offset_x, offset_y))

    output_path = SHOWCASE_DIR / "contact_sheet.png"
    canvas.save(output_path)
    return output_path


def write_manifest_csv(rows: list[dict[str, object]]) -> None:
    fieldnames = [
        "case_id",
        "case_dir",
        "has_fet",
        "shape",
        "voxel_spacing_mm",
        "voxel_volume_mm3",
        "baseline_voxels",
        "followup_voxels",
        "overlap_voxels",
        "baseline_only_voxels",
        "followup_only_voxels",
        "baseline_volume_ml",
        "followup_volume_ml",
        "delta_volume_ml",
        "followup_to_baseline_ratio",
        "best_axial_slice",
        "slice_baseline_voxels",
        "slice_followup_voxels",
        "trend_label",
        "baseline_mask_path",
        "followup_mask_path",
        "fet_path",
    ]

    with MANIFEST_CSV.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in sorted(rows, key=lambda item: item["case_id"]):
            writer.writerow(row)


def write_manifest_markdown(
    rows: list[dict[str, object]],
    showcase_rows: list[dict[str, object]],
    showcase_paths: dict[str, Path],
    contact_sheet_path: Path,
) -> None:
    baseline_volumes = [float(row["baseline_volume_ml"]) for row in rows]
    followup_volumes = [float(row["followup_volume_ml"]) for row in rows]
    fet_count = sum(1 for row in rows if row["has_fet"])
    top_followup = sorted(rows, key=lambda row: row["followup_voxels"], reverse=True)[:10]

    lines = [
        "# GliODIL Longitudinal Manifest",
        "",
        "- Source dataset: `m1balcerak/GliODIL`",
        "- Cases scanned: 152",
        f"- Cases with FET-PET: {fet_count}",
        "- Dataset README states the cohort covers two timepoints: pre-surgery and post-treatment follow-up.",
        "- This manifest maps `segm.nii.gz` to the baseline lesion mask and `segm_rec.nii.gz` to the follow-up/recurrence mask based on the file naming in the essential release.",
        "- The exported PNGs are derived visualizations, not raw MRI slices. They use the shared `t1_wm`, `t1_gm`, and `t1_csf` tissue maps as a grayscale anatomical background.",
        "",
        "## Summary",
        "",
        f"- Median baseline burden: {median(baseline_volumes):.2f} mL",
        f"- Median follow-up burden: {median(followup_volumes):.2f} mL",
        f"- Largest baseline burden: case {max(rows, key=lambda row: row['baseline_voxels'])['case_id']}",
        f"- Largest follow-up burden: case {max(rows, key=lambda row: row['followup_voxels'])['case_id']}",
        "",
        f"![GliODIL showcase contact sheet](showcase/{contact_sheet_path.name})",
        "",
        "## Showcase Picks",
        "",
        "| Slot | Case | Reason | FET | Baseline (mL) | Follow-up (mL) | Ratio | Preview |",
        "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ]

    for item in showcase_rows:
        row = item["row"]
        preview_path = showcase_paths[str(row["case_dir"])].name
        ratio = row["followup_to_baseline_ratio"]
        ratio_text = "inf" if math.isinf(ratio) else f"{ratio:.2f}x"
        lines.append(
            f'| `{item["slot"]}` | `{row["case_id"]}` | {item["reason"]} | '
            f'{"yes" if row["has_fet"] else "no"} | {row["baseline_volume_ml"]:.2f} | '
            f'{row["followup_volume_ml"]:.2f} | {ratio_text} | [view](showcase/{preview_path}) |'
        )

    lines.extend(
        [
            "",
            "## Top Follow-up Cases",
            "",
            "| Case | FET | Baseline (mL) | Follow-up (mL) | Delta (mL) | Ratio | Trend |",
            "| --- | --- | --- | --- | --- | --- | --- |",
        ]
    )

    for row in top_followup:
        ratio = row["followup_to_baseline_ratio"]
        ratio_text = "inf" if math.isinf(ratio) else f"{ratio:.2f}x"
        lines.append(
            f'| `{row["case_id"]}` | {"yes" if row["has_fet"] else "no"} | '
            f'{row["baseline_volume_ml"]:.2f} | {row["followup_volume_ml"]:.2f} | '
            f'{row["delta_volume_ml"]:.2f} | {ratio_text} | `{row["trend_label"]}` |'
        )

    MANIFEST_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    if not RAW_DIR.exists():
        raise SystemExit(f"Dataset folder not found: {RAW_DIR}")

    case_dirs = sorted(path for path in RAW_DIR.iterdir() if path.is_dir())
    rows = [compute_case_stats(case_dir) for case_dir in case_dirs]
    write_manifest_csv(rows)

    showcase_rows = choose_showcase_cases(rows)
    showcase_paths: dict[str, Path] = {}
    for item in showcase_rows:
        row = item["row"]
        case_dir = RAW_DIR / str(row["case_dir"])
        showcase_paths[str(row["case_dir"])] = render_case(case_dir, row, str(item["slot"]))

    contact_sheet_path = build_contact_sheet(list(showcase_paths.values()))
    write_manifest_markdown(rows, showcase_rows, showcase_paths, contact_sheet_path)

    print(f"Wrote {MANIFEST_CSV.relative_to(ROOT)}")
    print(f"Wrote {MANIFEST_MD.relative_to(ROOT)}")
    print(f"Rendered {len(showcase_paths)} showcase images to {SHOWCASE_DIR.relative_to(ROOT)}")
    print(f"Wrote {contact_sheet_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
