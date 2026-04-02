import os
import logging
from pathlib import Path
import tensorflow as tf
from tensorflow import keras
from app.config import settings

# Setup logging (like console.log in Node)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelLoader:
    """Handles loading and managing the ML model"""
    
    def __init__(self, model_path: str = settings.MODEL_PATH):
        """
        Initialize model loader
        
        Args:
            model_path: Path to the .h5 model file
        """
        self.model_path = model_path  # models/brain_tumor_model.h5
        self.model = None  # Will store the loaded model
        self._validate_model_path()  # Check if file exists
    
    def _validate_model_path(self):
        """Validate that model file exists"""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"Model file not found at: {self.model_path}\n"
                f"Please place your trained model at this location."
            )
    
    def load_model(self):
        """
        Load the Keras model from .h5 file
        
        What happens:
        1. Reads your .h5 file (contains trained AI weights)
        2. Reconstructs the neural network
        3. Stores in memory for fast predictions
        
        Returns:
            Loaded Keras model
            
        Raises:
            RuntimeError: If model loading fails
        """
        if self.model is not None:
            logger.warning("Model already loaded. Skipping reload.")
            return self.model
        
        try:
            logger.info(f"Loading model from: {self.model_path}")
            
            # Load the model
            # compile=False: We don't need training, only prediction
            self.model = keras.models.load_model(
                self.model_path,
                compile=False
            )
            
            logger.info("Model loaded successfully")
            logger.info(f"Model input shape: {self.model.input_shape}")
            logger.info(f"Model output shape: {self.model.output_shape}")
            
            # Expected output:
            # Model input shape: (None, 128, 128, 3)
            # Model output shape: (None, 4)
            
            return self.model
            
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise RuntimeError(f"Model loading failed: {str(e)}")
    
    def predict(self, preprocessed_image: tf.Tensor):
        """
        Run inference on preprocessed image
        
        What happens:
        1. Takes your preprocessed image array
        2. Feeds it through the neural network
        3. Returns probabilities for each class
        
        Args:
            preprocessed_image: Preprocessed image tensor (1, 128, 128, 3)
            
        Returns:
            Model predictions: array like [0.92, 0.05, 0.02, 0.01]
            
        Raises:
            RuntimeError: If model is not loaded or prediction fails
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        try:
            # Run the prediction
            # verbose=0: Don't print progress bar
            predictions = self.model.predict(preprocessed_image, verbose=0)
            
            # Example output:
            # [[0.92, 0.05, 0.02, 0.01]]
            # This means:
            # - 92% chance of class 0 (GLIOMA)
            # - 5% chance of class 1 (MENINGIOMA)
            # - 2% chance of class 2 (NO_TUMOR)
            # - 1% chance of class 3 (PITUITARY)
            
            return predictions
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise RuntimeError(f"Prediction failed: {str(e)}")
        
    def reload_model(self):
        """Reload the model (useful for model updates)"""
        logger.info("Reloading model...")
        
        # Clear old model
        if self.model is not None:
            del self.model
            tf.keras.backend.clear_session()  # Clear TensorFlow session
        
        self.model = None
        return self.load_model()

# Create a global model loader instance (loaded once at startup)
model_loader = ModelLoader()