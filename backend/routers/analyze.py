from fastapi import APIRouter, HTTPException
from typing import List
import os
import asyncio

from models.schemas import AnalyzeRequest, AnalyzeResponse, AnalysisResult
from services.preprocessing import preprocess_image
from services.modal_client import get_analyzer

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")


async def analyze_single_image(
    file_id: str,
    filename: str,
    mode: str,
    modality: str = "general",
    context: dict | None = None,
    generate_heatmap: bool = False,
) -> AnalysisResult:
    """Analyze a single image"""
    # Find the image file
    image_path = None
    for ext in [".png", ".jpg", ".jpeg"]:
        path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")
        if os.path.exists(path):
            image_path = path
            break

    if not image_path:
        return AnalysisResult(
            file_id=file_id,
            filename=filename,
            error="Image file not found"
        )

    try:
        # Read and preprocess image
        with open(image_path, "rb") as f:
            image_bytes = f.read()

        processed_bytes, _ = preprocess_image(image_bytes, filename)

        # Get analyzer function (real or mock)
        analyzer = get_analyzer()

        # Call analysis service
        result = await analyzer(
            processed_bytes,
            mode=mode,
            modality=modality,
            context=context,
            generate_heatmap=generate_heatmap,
        )

        if "error" in result:
            return AnalysisResult(
                file_id=file_id,
                filename=filename,
                error=result["error"]
            )

        return AnalysisResult(
            file_id=file_id,
            filename=filename,
            technical=result.get("technical"),
            simple=result.get("simple") or result.get("eli5"),
            eli5=result.get("eli5") or result.get("simple"),
        )

    except Exception as e:
        return AnalysisResult(
            file_id=file_id,
            filename=filename,
            error=str(e)
        )


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_images(request: AnalyzeRequest):
    """
    Analyze uploaded medical images

    Args:
        file_ids: List of file IDs to analyze
        mode: "technical", "simple", or "both"
    """
    if not request.file_ids:
        raise HTTPException(status_code=400, detail="No file IDs provided")

    mode = "simple" if request.mode == "eli5" else request.mode

    if mode not in ["technical", "simple", "both"]:
        raise HTTPException(
            status_code=400,
            detail="Mode must be 'technical', 'simple', or 'both'"
        )

    # Process images (could parallelize for multiple images)
    results = []
    for file_id in request.file_ids:
        # For now, we use file_id as filename placeholder
        # In a real app, we'd store filenames in a database
        result = await analyze_single_image(
            file_id,
            file_id,
            mode,
            modality=request.modality,
            context=request.context,
            generate_heatmap=request.generate_heatmap,
        )
        results.append(result)

    # Check if any succeeded
    successful = [r for r in results if r.error is None]
    failed = [r for r in results if r.error is not None]

    if not successful and failed:
        return AnalyzeResponse(
            success=False,
            results=results,
            message=f"Analysis failed for all {len(failed)} image(s)"
        )

    message = f"Successfully analyzed {len(successful)} image(s)"
    if failed:
        message += f", {len(failed)} failed"

    return AnalyzeResponse(
        success=True,
        results=results,
        message=message
    )


@router.post("/analyze/quick")
async def quick_analyze(file_id: str, mode: str = "both"):
    """
    Quick analysis endpoint for single image
    """
    normalized_mode = "simple" if mode == "eli5" else mode

    if normalized_mode not in ["technical", "simple", "both"]:
        raise HTTPException(
            status_code=400,
            detail="Mode must be 'technical', 'simple', or 'both'"
        )

    result = await analyze_single_image(file_id, file_id, normalized_mode)

    if result.error:
        raise HTTPException(status_code=500, detail=result.error)

    return {
        "file_id": result.file_id,
        "technical": result.technical,
        "simple": result.simple,
        "eli5": result.eli5,
    }
