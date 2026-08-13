import os
import secrets
import logging
from datetime import datetime, timedelta
from bson import ObjectId

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List
import json

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection, get_db, get_gridfs
from app.utils import normalize_and_crop_image
from app.generator import generate_pfp_frame, generate_builder_card
from app.models import GenerationResponse

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="HH Goa 2026 Frame Generator API",
    description="Backend service for generating HH Goa 2026 frames and builder ID cards.",
    version="1.0.0"
)

# CORS Setup - Open origins for public frontend client access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup & Shutdown Events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Endpoint: API Health check
@app.get("/health")
def health_check():
    return {
        "status": "ONLINE",
        "event": "Hacker House Goa 2026",
        "timestamp": datetime.utcnow().isoformat()
    }

# Endpoint: Root Welcome / Health Check
@app.get("/")
def welcome_root():
    return {
        "status": "ONLINE",
        "message": "HH Goa 2026 API is running."
    }

# Endpoint: File Upload (Accepts image file, uploads to GridFS)
@app.post("/api/upload")
async def upload_photo(file: UploadFile = File(...)):
    # Validate MIME type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="That photo format isn't supported yet. Try JPG, PNG, or HEIC."
        )

    # Validate file size
    file_bytes = await file.read()
    file_size_mb = len(file_bytes) / (1024 * 1024)
    if file_size_mb > settings.MAX_UPLOAD_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"That photo is a little too heavy. Try an image under {settings.MAX_UPLOAD_SIZE_MB} MB."
        )

    db = get_db()
    fs = get_gridfs()

    if db is None or fs is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is unavailable."
        )

    # Write original image to GridFS
    try:
        grid_in = fs.open_upload_stream(
            file.filename,
            metadata={"mime_type": file.content_type, "size_bytes": len(file_bytes)}
        )
        await grid_in.write(file_bytes)
        await grid_in.close()
        original_image_id = grid_in._id
        
        logger.info(f"Successfully uploaded original photo: ID={original_image_id}, Name={file.filename}")
        return {"original_image_id": str(original_image_id)}
    except Exception as e:
        logger.error(f"Error uploading photo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save image upload."
        )

# Schema for generator request body
class GenerationRequest(BaseModel):
    original_image_id: str
    format: str # 'pfp' or 'builder_card'
    name: Optional[str] = None
    role: Optional[str] = None
    team_name: Optional[str] = None
    age: Optional[int] = None
    team_members: Optional[List[str]] = []

# Endpoint: Generate Frame or Builder Card
@app.post("/api/generate", response_model=GenerationResponse)
async def generate_graphic(req: GenerationRequest):
    db = get_db()
    fs = get_gridfs()

    if db is None or fs is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is unavailable."
        )

    # 1. Fetch original image from GridFS
    try:
        obj_id = ObjectId(req.original_image_id)
        grid_out = await fs.open_download_stream(obj_id)
        original_bytes = await grid_out.read()
    except Exception as e:
        logger.error(f"Failed to fetch original image {req.original_image_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Original uploaded photo not found."
        )

    # 2. Process image (smart crop to 1080x1080 PNG)
    try:
        cropped_bytes = normalize_and_crop_image(original_bytes, 1080, 1080)
    except Exception as e:
        logger.error(f"Image cropping pipeline failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process photo cropping."
        )

    # 3. Generate final composited PNG graphic
    try:
        if req.format == "pfp":
            generated_bytes = generate_pfp_frame(cropped_bytes)
        elif req.format == "builder_card":
            meta = {
                "name": req.name,
                "role": req.role,
                "team_name": req.team_name,
                "age": req.age,
                "team_members": req.team_members
            }
            generated_bytes = generate_builder_card(cropped_bytes, meta)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported graphic format specified."
            )
    except Exception as e:
        logger.error(f"Pillow image composition failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The frame missed the first shot. Try again."
        )

    # 4. Save generated image to GridFS
    try:
        generated_grid = fs.open_upload_stream(
            f"generated_{req.format}.png",
            metadata={"mime_type": "image/png"}
        )
        await generated_grid.write(generated_bytes)
        await generated_grid.close()
        generated_image_id = generated_grid._id
    except Exception as e:
        logger.error(f"Failed to save generated image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store final generated graphic."
        )

    # 5. Generate secure random public ID & expiration timestamps
    public_result_id = secrets.token_urlsafe(8)
    expires_at = datetime.utcnow() + timedelta(days=settings.IMAGE_RETENTION_DAYS)

    # Save to generations index
    generation_doc = {
        "public_result_id": public_result_id,
        "format": req.format,
        "metadata": {
            "name": req.name,
            "role": req.role,
            "team_name": req.team_name,
            "age": req.age,
            "team_members": req.team_members
        },
        "original_image_id": req.original_image_id,
        "generated_image_id": str(generated_image_id),
        "created_at": datetime.utcnow(),
        "expires_at": expires_at
    }

    try:
        await db.generations.insert_one(generation_doc)
        
        # Build paths
        image_url = f"/api/results/{public_result_id}/image"
        download_url = f"/api/results/{public_result_id}/download"
        share_url = f"/share/{public_result_id}"

        return {
            "success": True,
            "result_id": public_result_id,
            "format": req.format,
            "image_url": image_url,
            "download_url": download_url,
            "share_url": share_url
        }
    except Exception as e:
        logger.error(f"Failed to write metadata: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to finalize registration indexing."
        )

# Endpoint: Fetch Generation Details
@app.get("/api/results/{public_id}")
async def get_result_details(public_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable.")
        
    doc = await db.generations.find_one({"public_result_id": public_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Result graphic not found or expired.")
        
    return {
        "result_id": doc["public_result_id"],
        "format": doc["format"],
        "metadata": doc["metadata"],
        "created_at": doc["created_at"].isoformat()
    }

# Endpoint: Stream Rendered Image Inline
@app.get("/api/results/{public_id}/image")
async def get_result_image(public_id: str):
    db = get_db()
    fs = get_gridfs()
    if db is None or fs is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable.")

    doc = await db.generations.find_one({"public_result_id": public_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Image not found or expired.")

    try:
        gen_img_id = ObjectId(doc["generated_image_id"])
        grid_out = await fs.open_download_stream(gen_img_id)
        image_bytes = await grid_out.read()
        return Response(content=image_bytes, media_type="image/png")
    except Exception as e:
        logger.error(f"Failed to serve image {public_id}: {e}")
        raise HTTPException(status_code=404, detail="Failed to retrieve generated graphic file.")

# Endpoint: Download Image Attachment
@app.get("/api/results/{public_id}/download")
async def download_result_image(public_id: str):
    db = get_db()
    fs = get_gridfs()
    if db is None or fs is None:
        raise HTTPException(status_code=503, detail="Database connection unavailable.")

    doc = await db.generations.find_one({"public_result_id": public_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Image not found or expired.")

    try:
        gen_img_id = ObjectId(doc["generated_image_id"])
        grid_out = await fs.open_download_stream(gen_img_id)
        image_bytes = await grid_out.read()
        
        filename = f"hh-goa-2026-{doc['format']}-{public_id}.png"
        return Response(
            content=image_bytes,
            media_type="image/png",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        logger.error(f"Failed to download image {public_id}: {e}")
        raise HTTPException(status_code=404, detail="Failed to retrieve download file.")
