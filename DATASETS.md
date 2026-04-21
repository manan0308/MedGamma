# Dataset Shortlist

This project can be showcased with a mix of lightweight open datasets and larger research-grade Hugging Face datasets.

## MRI

### Best large-scale MRI report dataset

- `Forithmus/MR-RATE`
  - Link: https://huggingface.co/datasets/Forithmus/MR-RATE
  - Brain and spine MRI volumes paired with radiology reports and metadata.
  - Strongest MRI fit for this app if we extend the pipeline for volumetric MRI.
  - Notes:
    - gated access
    - non-commercial academic/research license
    - very large

### Best MRI tumor showcase datasets

- `Simezu/brain-tumour-MRI-scan`
  - Link: https://huggingface.co/datasets/Simezu/brain-tumour-MRI-scan
  - 4-way brain MRI classification: glioma, meningioma, pituitary, no tumor.
  - Good lightweight showcase set.

- `AIOmarRehan/Brain_Tumor_MRI_Dataset`
  - Link: https://huggingface.co/datasets/AIOmarRehan/Brain_Tumor_MRI_Dataset
  - Open CC0-style derivative of the 7,023-image 4-class tumor MRI dataset.
  - Good for demo downloads and local previews.

- `UniqueData/brain-mri-dataset`
  - Link: https://huggingface.co/datasets/UniqueData/brain-mri-dataset
  - DICOM brain cancer MRI detection/segmentation style dataset with reports.
  - Good for richer tumor examples, but the public sample appears limited.

- `xenificity/TumorMRI`
  - Link: https://huggingface.co/datasets/xenificity/TumorMRI
  - BIDS-compliant pre-operative structural and resting-state MRI data from glioma, meningioma, and healthy control subjects.
  - Good small tumor-focused research dataset for a polished MRI showcase.

- `Ehsan-rmz/lgg-mri-segmentation-research`
  - Link: https://huggingface.co/datasets/Ehsan-rmz/lgg-mri-segmentation-research
  - Patient-centric lower-grade glioma MRI segmentation dataset.
  - Useful when we want real 3D patient-level tumor volumes rather than slice-only image classification.

- `yummy456/brain-mri-dataset`
  - Link: https://huggingface.co/datasets/yummy456/brain-mri-dataset
  - TCGA LGG-based MRI plus segmentation masks.
  - Good for tumor segmentation visuals.

## CT

### Best large-scale CT report dataset

- `ibrahimhamamci/CT-RATE`
  - Link: https://huggingface.co/datasets/ibrahimhamamci/CT-RATE
  - Large chest CT dataset with paired radiology reports and metadata.
  - Best CT choice if we want serious vision-language work.
  - Notes:
    - gated access
    - non-commercial academic/research license
    - extremely large

### Best CT companion dataset

- `RadGenome/RadGenome-ChestCT`
  - Link: https://huggingface.co/datasets/RadGenome/RadGenome-ChestCT
  - Grounded chest CT dataset for chest CT analysis.
  - Good complement to CT-RATE for structured supervision.

## X-ray

### Best chest X-ray report-generation datasets

- `Yamini-1628/MIMIC-CXR-RRG`
  - Link: https://huggingface.co/datasets/Yamini-1628/MIMIC-CXR-RRG
  - Filtered frontal-only chest X-ray report generation subsets focused on findings and impression.
  - Good evaluation set for radiology-style report generation.

- `itsanmolgupta/mimic-cxr-dataset`
  - Link: https://huggingface.co/datasets/itsanmolgupta/mimic-cxr-dataset
  - Broad image-text chest X-ray dataset mirror.
  - Useful for experimentation, but verify provenance and license terms.

### Best chest X-ray pathology benchmark

- `BahaaEldin0/NIH-Chest-Xray-14`
  - Link: https://huggingface.co/datasets/BahaaEldin0/NIH-Chest-Xray-14
  - Large pathology benchmark for chest X-ray classification.
  - Good for showcase metrics and disease examples.

## Same-patient / longitudinal MRI comparison

### Tumor-specific longitudinal picks

- `sbandred/mu-glioma-post-processed`
  - Link: https://huggingface.co/datasets/sbandred/mu-glioma-post-processed
  - Explicit longitudinal support with `manifests/longitudinal_index.csv`.
  - Includes multiple timepoints and processed glioma MRI volumes.
  - Great fit for current-vs-prior tumor progression showcase.

- `m1balcerak/GliODIL`
  - Link: https://huggingface.co/datasets/m1balcerak/GliODIL
  - 152 glioma patients with imaging at two timepoints: pre-surgery and follow-up post-treatment.
  - Strong option for same-patient before/after comparison.

### General longitudinal MRI pick

- `radiata-ai/brain-structure`
  - Link: https://huggingface.co/datasets/radiata-ai/brain-structure
  - Harmonized structural MRI dataset that includes OASIS-2 longitudinal sessions.
  - Not tumor-specific, but very useful if we want to demo same-patient MRI change over time.

## Practical recommendation

If the goal is a strong showcase without downloading multi-terabyte gated data first:

1. Start with `Simezu/brain-tumour-MRI-scan` or `AIOmarRehan/Brain_Tumor_MRI_Dataset` for tumor MRI screenshots and examples.
2. Add `Yamini-1628/MIMIC-CXR-RRG` and `BahaaEldin0/NIH-Chest-Xray-14` for chest X-ray demos.
3. Use `sbandred/mu-glioma-post-processed` and `m1balcerak/GliODIL` for same-patient MRI comparison demos.
4. Treat `MR-RATE` and `CT-RATE` as the “serious next step” datasets once the backend supports full volumetric ingestion and selective download workflows.

## Important caveat

The current frontend/backend stack is best aligned with single-image demos today.
The MRI and CT volumetric datasets above are the right long-term assets, but they will shine once the pipeline supports NIfTI/DICOM volumes instead of only image-like uploads.
