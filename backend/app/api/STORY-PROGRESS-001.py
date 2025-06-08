# STORY-PROGRESS-001.py

from datetime import datetime
from enum import Enum
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

# FastAPI app instance
app = FastAPI(title="User Progress Dashboard API")

# OAuth2 scheme for authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Enums
class TimePeriod(str, Enum):
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    YEAR = "year"
    ALL = "all"

class Category(str, Enum):
    COURSES = "courses"
    ASSIGNMENTS = "assignments"
    QUIZZES = "quizzes"
    PROJECTS = "projects"
    ALL = "all"

# Pydantic Models
class ProgressDetail(BaseModel):
    category: Category
    completed_count: int = Field(ge=0)
    total_count: int = Field(ge=0)
    completion_percentage: float = Field(ge=0, le=100)
    last_completed_at: Optional[datetime]

    class Config:
        schema_extra = {
            "example": {
                "category": "courses",
                "completed_count": 5,
                "total_count": 10,
                "completion_percentage": 50.0,
                "last_completed_at": "2024-02-20T10:30:00Z"
            }
        }

class ProgressSummary(BaseModel):
    total_completed: int = Field(ge=0)
    total_in_progress: int = Field(ge=0)
    completion_rate: float = Field(ge=0, le=100)
    last_activity: Optional[datetime]

    class Config:
        schema_extra = {
            "example": {
                "total_completed": 25,
                "total_in_progress": 10,
                "completion_rate": 71.4,
                "last_activity": "2024-02-20T15:45:00Z"
            }
        }

class ProgressDetailResponse(BaseModel):
    items: List[ProgressDetail]

# Database dependency
async def get_db() -> AsyncSession:
    # Implementation would depend on your database setup
    # This is a placeholder
    pass

# Endpoints
@app.get(
    "/api/v1/dashboard/progress",
    response_model=ProgressSummary,
    summary="Get overall user progress summary",
    responses={
        401: {"description": "Unauthorized"},
        500: {"description": "Internal server error"}
    }
)
async def get_progress_summary(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> ProgressSummary:
    try:
        # Here you would:
        # 1. Validate the token and get user_id
        # 2. Query the database for user's progress data
        # 3. Calculate summary statistics

        # This is example data - replace with actual database queries
        return ProgressSummary(
            total_completed=25,
            total_in_progress=10,
            completion_rate=71.4,
            last_activity=datetime.utcnow()
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve progress summary"
        )

@app.get(
    "/api/v1/dashboard/progress/details",
    response_model=ProgressDetailResponse,
    summary="Get detailed progress breakdown by category",
    responses={
        400: {"description": "Invalid request parameters"},
        401: {"description": "Unauthorized"},
        500: {"description": "Internal server error"}
    }
)
async def get_progress_details(
    time_period: TimePeriod = Query(..., description="Time period for progress details"),
    category: Category = Query(Category.ALL, description="Category filter"),
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> ProgressDetailResponse:
    try:
        # Here you would:
        # 1. Validate the token and get user_id
        # 2. Query the database for detailed progress data
        # 3. Filter by time_period and category
        # 4. Calculate statistics for each category

        # This is example data - replace with actual database queries
        details = [
            ProgressDetail(
                category=Category.COURSES,
                completed_count=5,
                total_count=10,
                completion_percentage=50.0,
                last_completed_at=datetime.utcnow()
            )
        ]

        return ProgressDetailResponse(items=details)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve progress details"
        )

# Error handling middleware
@app.middleware("http")
async def add_error_handling(request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred"
        )

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
