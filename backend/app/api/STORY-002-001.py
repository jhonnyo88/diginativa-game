"""
STORY-002-001.py
Feature Management API Implementation
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4
from fastapi import FastAPI, HTTPException, Query, Path
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from enum import Enum
import asyncio

# Initialize FastAPI app
app = FastAPI(title="Feature Management API", version="1.0.0")

# Enums
class FeatureStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEPRECATED = "deprecated"

# Pydantic Models
class FeatureBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    status: FeatureStatus

class FeatureCreate(FeatureBase):
    pass

class Feature(FeatureBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class FeatureList(BaseModel):
    features: List[Feature]
    total_count: int
    page: int
    page_size: int

# Mock database (replace with actual database in production)
features_db: List[Feature] = []

# Helper Functions
async def get_feature_by_id(feature_id: str) -> Optional[Feature]:
    """Helper function to retrieve a feature by ID"""
    try:
        return next((f for f in features_db if f.id == feature_id), None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# API Endpoints
@app.get("/api/v1/features", response_model=FeatureList, status_code=200)
async def list_features(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)
) -> FeatureList:
    """
    Retrieve a paginated list of features
    """
    try:
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        features_page = features_db[start_idx:end_idx]
        total_count = len(features_db)

        return FeatureList(
            features=features_page,
            total_count=total_count,
            page=page,
            page_size=page_size
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error retrieving features: {str(e)}")

@app.get("/api/v1/features/{feature_id}", response_model=Feature, status_code=200)
async def get_feature(
    feature_id: str = Path(..., title="The ID of the feature to retrieve")
) -> Feature:
    """
    Retrieve detailed information about a specific feature
    """
    feature = await get_feature_by_id(feature_id)
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    return feature

@app.post("/api/v1/features", response_model=Feature, status_code=201)
async def create_feature(feature: FeatureCreate) -> Feature:
    """
    Create a new feature
    """
    try:
        # Create new feature instance
        new_feature = Feature(
            id=str(uuid4()),
            name=feature.name,
            description=feature.description,
            status=feature.status,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        # Add to database (mock implementation)
        features_db.append(new_feature)

        return new_feature
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating feature: {str(e)}")

# Error Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Startup Event
@app.on_event("startup")
async def startup_event():
    """Initialize any necessary resources on startup"""
    pass

# Shutdown Event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup any resources on shutdown"""
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
