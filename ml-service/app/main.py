import logging
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np

from app.config import settings
from app.models.model_loader import model_loader
from app.utils.preprocessing import preprocessor
from app.schemas.prediction import PredictionResponse, ErrorResponse

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app (like Express app)
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Brain tumor classification ML service for NeuroGenAI",
)

# Add CORS (allow Node.js backend to call this service)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,  # Who can call this API?
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# ============================================
# STARTUP EVENT - Runs once when server starts
# ============================================

@app.on_event("startup")
async def startup_event():
    """
    Load ML model on application startup
    
    This runs ONCE when you start the server
    Similar to: app.listen() callback in Express
    """
    try:
        logger.info("Starting NeuroGenAI ML Service...")
        
        # Load the model into memory
        model_loader.load_model()
        
        logger.info("ML Service ready to receive requests")
    except Exception as e:
        logger.error(f"Failed to start ML Service: {str(e)}")
        raise

# ============================================
# ENDPOINTS
# ============================================

@app.get("/")
async def root():
    """
    Health check endpoint
    Like: app.get("/", (req, res) => res.json({...}))
    """
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy",
        "model_loaded": model_loader.model is not None,
    }

@app.get("/health")
async def health_check():
    """
    Detailed health check
    Returns model configuration
    """
    return {
        "status": "healthy",
        "model_loaded": model_loader.model is not None,
        "input_size": settings.INPUT_SIZE,
        "num_classes": settings.NUM_CLASSES,
        "class_labels": settings.CLASS_LABELS,
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Predict brain tumor type from MRI image
    
    FLOW:
    1. Receive uploaded image file
    2. Validate it's actually an image
    3. Preprocess image (resize, normalize)
    4. Run AI prediction
    5. Return results
    
    Args:
        file: Uploaded image file (like req.file in Express with Multer)
        
    Returns:
        JSON with predicted class and probabilities
    """
    try:
        # Step 1: Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "error": "Invalid file type",
                    "details": "File must be an image (PNG, JPG, JPEG)",
                }
            )
        
        # Step 2: Read image bytes
        image_bytes = await file.read()
        
        # Step 3: Validate image
        if not preprocessor.validate_image(image_bytes):
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "error": "Invalid image",
                    "details": "Could not process the uploaded image",
                }
            )
        
        logger.info(f"Processing image: {file.filename}")
        
        # Step 4: Preprocess image
        preprocessed_image = preprocessor.preprocess(image_bytes)
        # Now: (1, 128, 128, 3) array ready for AI
        
        # Step 5: Run AI prediction
        predictions = model_loader.predict(preprocessed_image)
        # Returns: [[0.92, 0.05, 0.02, 0.01]]
        
        # Step 6: Extract results
        # Find which class has highest probability
        predicted_class_idx = int(np.argmax(predictions[0]))
        # argmax([0.92, 0.05, 0.02, 0.01]) = 0 (first index)
        
        confidence = float(predictions[0][predicted_class_idx])
        # confidence = 0.92
        
        predicted_class = settings.CLASS_LABELS[predicted_class_idx]
        # predicted_class = "GLIOMA" (from CLASS_LABELS[0])
        
        # Step 7: Build probabilities dictionary
        probabilities = {
            settings.CLASS_LABELS[i]: float(predictions[0][i])
            for i in range(settings.NUM_CLASSES)
        }
        # Result:
        # {
        #   "GLIOMA": 0.92,
        #   "MENINGIOMA": 0.05,
        #   "NO_TUMOR": 0.02,
        #   "PITUITARY": 0.01
        # }
        
        logger.info(f"Prediction: {predicted_class} (confidence: {confidence:.2f})")
        
        # Step 8: Return response
        return {
            "success": True,
            "predictedClass": predicted_class,
            "confidence": confidence,
            "probabilities": probabilities,
        }
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except ValueError as e:
        # Preprocessing errors
        logger.error(f"Preprocessing error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "Image preprocessing failed",
                "details": str(e),
            }
        )
    except Exception as e:
        # Unexpected errors
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Internal server error",
                "details": str(e),
            }
        )

# ============================================
# RUN SERVER (for local development)
# ============================================

if __name__ == "__main__":
    import uvicorn
    # Run server like: node index.js
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,  # Auto-reload on code changes
    )