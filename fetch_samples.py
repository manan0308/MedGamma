#!/usr/bin/env python3
"""Fetch sample MRI images from HuggingFace dataset"""

import os
import requests
from pathlib import Path

# Create samples directory
samples_dir = Path(__file__).parent / "samples"
samples_dir.mkdir(exist_ok=True)

# Fetch a few sample brain MRI images from public sources
# Using publicly available medical image samples
sample_urls = [
    # Brain MRI samples from public domain
    ("brain_mri_1.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Structural_MRI_animation.ogv/220px--Structural_MRI_animation.ogv.jpg"),
    ("brain_mri_2.png", "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/FMRI_Brain_Scan.jpg/220px-FMRI_Brain_Scan.jpg"),
    ("chest_xray.png", "https://upload.wikimedia.org/wikipedia/commons/c/c8/Chest_Xray_PA_3-8-2010.png"),
]

print("Fetching sample medical images...")

for filename, url in sample_urls:
    filepath = samples_dir / filename
    try:
        print(f"  Downloading {filename}...")
        response = requests.get(url, headers={"User-Agent": "MedScan-Sample-Fetcher"}, timeout=30)
        response.raise_for_status()
        filepath.write_bytes(response.content)
        print(f"    ✓ Saved to {filepath}")
    except Exception as e:
        print(f"    ✗ Failed: {e}")

print(f"\nSamples saved to: {samples_dir}")
print("You can drag these into the MedScan AI app to test!")
