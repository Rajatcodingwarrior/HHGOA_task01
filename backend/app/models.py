from pydantic import BaseModel, Field
from typing import Optional, List

class BuilderCardCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    role: str = Field(..., min_length=2, max_length=50)
    team_name: Optional[str] = Field(None, max_length=50)
    age: Optional[int] = Field(None, ge=13, le=120)
    team_members: Optional[List[str]] = Field(default=[], max_items=3)

class GenerationResponse(BaseModel):
    success: bool
    result_id: str
    format: str
    image_url: str
    download_url: str
    share_url: str
