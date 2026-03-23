"""
Image preprocessing utilities
"""
import numpy as np
from PIL import Image  # Pillow library
from io import BytesIO
from typing import Tuple
from app.config import settings

class ImagePreprocessor:
    """Handles image preprocessing for model inference"""
    
    def __init__(self, target_size: Tuple[int, int] = settings.INPUT_SIZE):
        """
        Initialize preprocessor
        
        Args:
            target_size: Target image size (height, width)
                        Default: (128, 128) from settings
        """
        self.target_size = target_size
    
    def preprocess(self, image_bytes: bytes) -> np.ndarray:
        """
        Preprocess image for model inference
        
        STEP-BY-STEP:
        1. Load image from bytes (uploaded file data)
        2. Convert to RGB (remove transparency, handle grayscale)
        3. Resize to 128x128 pixels
        4. Convert to numbers (numpy array)
        5. Normalize: pixels from 0-255 → 0-1
        6. Add batch dimension (TensorFlow requirement)
        
        Args:
            image_bytes: Raw image bytes from uploaded file
            
        Returns:
            Preprocessed numpy array: shape (1, 128, 128, 3)
            
        Raises:
            ValueError: If image processing fails
        """
        try:
            # Step 1: Load image from bytes
            image = Image.open(BytesIO(image_bytes))
            
            # Step 2: Convert to RGB
            # Why? Some images are grayscale or have transparency
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Step 3: Resize to target size (128x128)
            # LANCZOS = high-quality resizing algorithm
            image = image.resize(self.target_size, Image.Resampling.LANCZOS)
            
            # Step 4: Convert to numpy array
            # Now it's a 3D array of numbers: (128, 128, 3)
            image_array = np.array(image, dtype=np.float32)
            
            # Step 5: Normalize to [0, 1]
            # Original: 0-255 (pixel values)
            # After: 0-1 (what AI expects)
            image_array = image_array / 255.0
            
            # Step 6: Add batch dimension
            # Original shape: (128, 128, 3)
            # After: (1, 128, 128, 3)
            # Why? TensorFlow expects batches, even if batch size = 1
            image_array = np.expand_dims(image_array, axis=0)
            
            return image_array
            
        except Exception as e:
            raise ValueError(f"Image preprocessing failed: {str(e)}")
    
    def validate_image(self, image_bytes: bytes) -> bool:
        """
        Validate if bytes represent a valid image
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            True if valid image, False otherwise
        """
        try:
            image = Image.open(BytesIO(image_bytes))
            image.verify()  # Check if it's actually an image
            return True
        except Exception:
            return False

# Create a global preprocessor instance (reused for all requests)
preprocessor = ImagePreprocessor()