from PIL import Image
import numpy as np
import io
from typing import Tuple

# MedGemma expects 896x896 images
TARGET_SIZE = (896, 896)


def preprocess_image(image_bytes: bytes, filename: str) -> Tuple[bytes, Image.Image]:
    """
    Preprocess image for MedGemma model

    Args:
        image_bytes: Raw image bytes
        filename: Original filename (to detect format)

    Returns:
        Tuple of (processed image bytes, PIL Image for preview)
    """
    # Load image
    image = Image.open(io.BytesIO(image_bytes))

    # Convert to RGB if necessary
    if image.mode != "RGB":
        # Handle RGBA, L (grayscale), etc.
        if image.mode == "L":
            # Grayscale to RGB
            image = image.convert("RGB")
        elif image.mode == "RGBA":
            # Remove alpha channel
            background = Image.new("RGB", image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[3])
            image = background
        else:
            image = image.convert("RGB")

    # Resize to target size (MedGemma expects 896x896)
    original_size = image.size
    if original_size != TARGET_SIZE:
        # Maintain aspect ratio by padding
        image = resize_with_padding(image, TARGET_SIZE)

    # Convert back to bytes
    output = io.BytesIO()
    image.save(output, format="PNG")
    processed_bytes = output.getvalue()

    return processed_bytes, image


def resize_with_padding(image: Image.Image, target_size: Tuple[int, int]) -> Image.Image:
    """
    Resize image to target size while maintaining aspect ratio.
    Pads with black if necessary.
    """
    target_w, target_h = target_size
    original_w, original_h = image.size

    # Calculate scale factor
    scale = min(target_w / original_w, target_h / original_h)

    # Calculate new size
    new_w = int(original_w * scale)
    new_h = int(original_h * scale)

    # Resize image
    resized = image.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Create padded image
    padded = Image.new("RGB", target_size, (0, 0, 0))

    # Calculate position to paste
    paste_x = (target_w - new_w) // 2
    paste_y = (target_h - new_h) // 2

    padded.paste(resized, (paste_x, paste_y))

    return padded


def normalize_pixel_values(image: Image.Image) -> np.ndarray:
    """
    Normalize pixel values to [0, 1] range
    """
    arr = np.array(image, dtype=np.float32)
    arr = arr / 255.0
    return arr


def apply_windowing(image_array: np.ndarray, window_center: float, window_width: float) -> np.ndarray:
    """
    Apply CT windowing (contrast adjustment)

    Args:
        image_array: Pixel array
        window_center: Center of the window
        window_width: Width of the window

    Returns:
        Windowed array normalized to [0, 255]
    """
    lower = window_center - window_width / 2
    upper = window_center + window_width / 2

    windowed = np.clip(image_array, lower, upper)
    windowed = ((windowed - lower) / (upper - lower) * 255).astype(np.uint8)

    return windowed
