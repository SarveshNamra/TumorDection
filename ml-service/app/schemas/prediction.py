from pydantic import BaseModel, Field
from typing import Dict

# This defines what your successful response looks like
class PredictionResponse(BaseModel):
    """Response schema for prediction endpoint"""
    
    success: bool = Field(..., description="Whether prediction was successful")
    predictedClass: str = Field(..., description="Predicted tumor type")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score (0-1)")
    probabilities: Dict[str, float] = Field(..., description="Probabilities for all classes")
    
    # Example response (shows up in API docs)
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "predictedClass": "GLIOMA",
                "confidence": 0.92,
                "probabilities": {
                    "GLIOMA": 0.92,
                    "MENINGIOMA": 0.05,
                    "NO_TUMOR": 0.02,
                    "PITUITARY": 0.01
                }
            }
        }

class ErrorResponse(BaseModel):
    """Response schema for errors"""
    
    success: bool = False
    error: str = Field(..., description="Error message")
    details: str = Field(None, description="Additional error details")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": False,
                "error": "Invalid image format",
                "details": "Image must be in PNG, JPG, or JPEG format"
            }
        }