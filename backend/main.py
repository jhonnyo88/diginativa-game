from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(
    title="DigiNativa API",
    description="Backend API for DigiNativa municipal training platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "DigiNativa API is running", "status": "healthy"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "diginativa-api"}

@app.get("/api/features")
async def get_features():
    return {
        "features": [
            {
                "id": "digital-onboarding",
                "title": "Digital Onboarding för Nya Kommunanställda",
                "status": "completed",
                "description": "Interaktiv introduktion för nya medarbetare"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
