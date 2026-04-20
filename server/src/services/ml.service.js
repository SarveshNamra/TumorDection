import FormData from 'form-data';
import fetch from 'node-fetch';
import { AbortController } from 'node-abort-controller';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_TIMEOUT = 60000;

export const mlService = {

  // Predict tumor type from an image
  // imagePath: path to the image file to be analyzed
  // Returns: promise result
  async predictTumor(imageBuffer, filename = 'scan.jpg', mimetype = 'image/jpeg') {
    // Set up an abort controller to handle timeouts
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, ML_TIMEOUT);
    
    try {
      const form = new FormData();
      form.append('file', imageBuffer, {
        filename: filename,
        contentType: mimetype,
      });

      const response = await fetch(`${ML_SERVICE_URL}/predict`, {
        method: 'POST',
        body: form,
        headers: form.getHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.detail?.error ||
          errorData?.message ||
          "ML prediction failed"
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      clearTimeout(timeout);

      if (error.name === "AbortError") {
        throw new Error("ML service timeout - request took too long");
      }

      console.error("ML Service Error:", error);
      throw new Error(`ML prediction failed: ${error.message}`);
    }
  },

  async healthCheck() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${ML_SERVICE_URL}/health`, {
        method: 'GET',
        signal: controller.signal, // 5 seconds timeout
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return { status: 'unhealthy' };
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeout);
      console.error("ML Service Health Check Error:", error);
      return { status: 'unhealthy' , error: error.message};
    }
  },
};
