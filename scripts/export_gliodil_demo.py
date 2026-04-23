#!/usr/bin/env python3

from __future__ import annotations

from pathlib import Path

import nibabel as nib
import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
CASE_ID = "539"
CASE_DIR = ROOT / "datasets" / "GliODIL" / "data_GliODIL_essential" / f"data_{CASE_ID}"
OUTPUT_DIR = ROOT / "frontend" / "public" / "demo" / "gliodil" / f"case-{CASE_ID}-progression"


def normalize_background(background: np.ndarray) -> np.ndarray:
    background = np.asarray(background, dtype=np.float32)
    min_value = float(np.nanmin(background))
    max_value = float(np.nanmax(background))
    if max_value > min_value:
        background = (background - min_value) / (max_value - min_value)
    else:
        background = np.zeros_like(background, dtype=np.float32)
    return np.sqrt(np.clip(background, 0.0, 1.0))


def tint_mask(background: np.ndarray, mask: np.ndarray, color: tuple[float, float, float]) -> np.ndarray:
    rgb = np.repeat(background[..., None], 3, axis=-1)
    rgb = np.clip(rgb * 0.9 + 0.04, 0.0, 1.0)
    alpha = 0.78
    rgb[mask] = (1.0 - alpha) * rgb[mask] + alpha * np.array(color, dtype=np.float32)
    return np.clip(rgb, 0.0, 1.0)


def save_panel(path: Path, image: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    array = np.clip(image * 255.0, 0, 255).astype(np.uint8)
    Image.fromarray(array, mode="RGB").save(path)


def main() -> None:
    if not CASE_DIR.exists():
        raise SystemExit(f"Case folder not found: {CASE_DIR}")

    wm = np.asarray(nib.load(str(CASE_DIR / "t1_wm.nii.gz")).dataobj, dtype=np.float32)
    gm = np.asarray(nib.load(str(CASE_DIR / "t1_gm.nii.gz")).dataobj, dtype=np.float32)
    csf = np.asarray(nib.load(str(CASE_DIR / "t1_csf.nii.gz")).dataobj, dtype=np.float32)
    baseline_mask = np.asarray(nib.load(str(CASE_DIR / "segm.nii.gz")).dataobj) > 0
    followup_mask = np.asarray(nib.load(str(CASE_DIR / "segm_rec.nii.gz")).dataobj) > 0

    slice_scores = (
        baseline_mask.astype(np.uint8) + (2 * followup_mask.astype(np.uint8))
    ).sum(axis=(0, 1))
    axial_slice = int(slice_scores.argmax())

    background = normalize_background(
        (0.55 * wm[:, :, axial_slice])
        + (0.30 * gm[:, :, axial_slice])
        + (0.15 * csf[:, :, axial_slice])
    )
    prior = np.rot90(tint_mask(background, baseline_mask[:, :, axial_slice], (0.05, 0.78, 1.0)))
    current = np.rot90(tint_mask(background, followup_mask[:, :, axial_slice], (1.0, 0.47, 0.10)))

    overlap = baseline_mask[:, :, axial_slice] & followup_mask[:, :, axial_slice]
    overlay = tint_mask(background, baseline_mask[:, :, axial_slice], (0.05, 0.78, 1.0))
    overlay = tint_mask(overlay.mean(axis=-1), followup_mask[:, :, axial_slice], (1.0, 0.47, 0.10))
    overlay = np.rot90(overlay)
    overlay[np.rot90(overlap)] = np.array((1.0, 0.88, 0.15), dtype=np.float32)

    save_panel(OUTPUT_DIR / "prior.png", prior)
    save_panel(OUTPUT_DIR / "current.png", current)
    save_panel(OUTPUT_DIR / "overlay.png", overlay)

    print(f"Exported demo assets to {OUTPUT_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
