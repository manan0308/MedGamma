import pydicom
from PIL import Image
import numpy as np
import io
from typing import Tuple, Optional, Dict, Any


def process_dicom(dicom_bytes: bytes) -> Tuple[bytes, Image.Image, Dict[str, Any]]:
    """
    Process DICOM file and extract image with metadata

    Args:
        dicom_bytes: Raw DICOM file bytes

    Returns:
        Tuple of (PNG image bytes, PIL Image, metadata dict)
    """
    # Load DICOM
    dicom = pydicom.dcmread(io.BytesIO(dicom_bytes))

    # Extract pixel array
    pixel_array = dicom.pixel_array

    # Apply rescale if present
    if hasattr(dicom, 'RescaleSlope') and hasattr(dicom, 'RescaleIntercept'):
        pixel_array = pixel_array * dicom.RescaleSlope + dicom.RescaleIntercept

    # Apply windowing for CT images
    if hasattr(dicom, 'WindowCenter') and hasattr(dicom, 'WindowWidth'):
        window_center = float(dicom.WindowCenter) if not isinstance(dicom.WindowCenter, pydicom.multival.MultiValue) else float(dicom.WindowCenter[0])
        window_width = float(dicom.WindowWidth) if not isinstance(dicom.WindowWidth, pydicom.multival.MultiValue) else float(dicom.WindowWidth[0])
        pixel_array = apply_window(pixel_array, window_center, window_width)
    else:
        # Normalize to 0-255
        pixel_array = normalize_array(pixel_array)

    # Convert to PIL Image
    image = Image.fromarray(pixel_array.astype(np.uint8))

    # Convert grayscale to RGB
    if image.mode == "L":
        image = image.convert("RGB")

    # Extract metadata
    metadata = extract_dicom_metadata(dicom)

    # Convert to PNG bytes
    output = io.BytesIO()
    image.save(output, format="PNG")
    png_bytes = output.getvalue()

    return png_bytes, image, metadata


def apply_window(pixel_array: np.ndarray, window_center: float, window_width: float) -> np.ndarray:
    """Apply CT windowing to pixel array"""
    lower = window_center - window_width / 2
    upper = window_center + window_width / 2

    windowed = np.clip(pixel_array, lower, upper)
    windowed = ((windowed - lower) / (upper - lower) * 255)

    return windowed


def normalize_array(pixel_array: np.ndarray) -> np.ndarray:
    """Normalize pixel array to 0-255 range"""
    min_val = pixel_array.min()
    max_val = pixel_array.max()

    if max_val == min_val:
        return np.zeros_like(pixel_array)

    normalized = ((pixel_array - min_val) / (max_val - min_val) * 255)
    return normalized


def extract_dicom_metadata(dicom: pydicom.Dataset) -> Dict[str, Any]:
    """Extract relevant metadata from DICOM"""
    metadata = {}

    # Patient info (anonymized)
    metadata["patient_id"] = str(getattr(dicom, "PatientID", "Unknown"))
    metadata["patient_age"] = str(getattr(dicom, "PatientAge", "Unknown"))
    metadata["patient_sex"] = str(getattr(dicom, "PatientSex", "Unknown"))

    # Study info
    metadata["study_date"] = str(getattr(dicom, "StudyDate", "Unknown"))
    metadata["study_description"] = str(getattr(dicom, "StudyDescription", "Unknown"))

    # Series info
    metadata["series_description"] = str(getattr(dicom, "SeriesDescription", "Unknown"))
    metadata["modality"] = str(getattr(dicom, "Modality", "Unknown"))

    # Image info
    metadata["rows"] = int(getattr(dicom, "Rows", 0))
    metadata["columns"] = int(getattr(dicom, "Columns", 0))
    metadata["pixel_spacing"] = list(getattr(dicom, "PixelSpacing", [0, 0])) if hasattr(dicom, "PixelSpacing") else None
    metadata["slice_thickness"] = float(getattr(dicom, "SliceThickness", 0)) if hasattr(dicom, "SliceThickness") else None

    # Institution
    metadata["institution"] = str(getattr(dicom, "InstitutionName", "Unknown"))
    metadata["manufacturer"] = str(getattr(dicom, "Manufacturer", "Unknown"))

    return metadata


def is_dicom_file(file_bytes: bytes) -> bool:
    """Check if file is a valid DICOM file"""
    try:
        # DICOM files have "DICM" at byte 128
        if len(file_bytes) >= 132:
            return file_bytes[128:132] == b"DICM"
        return False
    except Exception:
        return False


def get_dicom_preview_slice(dicom_bytes: bytes, slice_index: Optional[int] = None) -> Tuple[bytes, Image.Image]:
    """
    Get a specific slice from a DICOM file
    For single-slice DICOMs, returns the only slice
    For multi-slice, returns the middle slice by default
    """
    dicom = pydicom.dcmread(io.BytesIO(dicom_bytes))
    pixel_array = dicom.pixel_array

    # Handle multi-frame DICOM
    if len(pixel_array.shape) == 3:
        num_slices = pixel_array.shape[0]
        if slice_index is None:
            slice_index = num_slices // 2
        slice_index = max(0, min(slice_index, num_slices - 1))
        pixel_array = pixel_array[slice_index]

    # Apply windowing if available
    if hasattr(dicom, 'WindowCenter') and hasattr(dicom, 'WindowWidth'):
        window_center = float(dicom.WindowCenter) if not isinstance(dicom.WindowCenter, pydicom.multival.MultiValue) else float(dicom.WindowCenter[0])
        window_width = float(dicom.WindowWidth) if not isinstance(dicom.WindowWidth, pydicom.multival.MultiValue) else float(dicom.WindowWidth[0])
        pixel_array = apply_window(pixel_array, window_center, window_width)
    else:
        pixel_array = normalize_array(pixel_array)

    image = Image.fromarray(pixel_array.astype(np.uint8))
    if image.mode == "L":
        image = image.convert("RGB")

    output = io.BytesIO()
    image.save(output, format="PNG")

    return output.getvalue(), image
