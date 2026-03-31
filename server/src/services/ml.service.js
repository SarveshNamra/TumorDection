import FormData from 'from-data';
import fetch from 'node-fetch';
import fs from 'fs';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

export const mlService = {

  // Predict tumor type from an image
  // imagePath: path to the image file to be analyzed
  // Returns: promise result
  async predictTumor(imagePath) {
    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(imagePath));

      const response = await fetch(`${ML_SERVICE_URL}/predict`, {
        method: 'POST',
        body: form,
        headers: form.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "ML prediction failed");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("ML Service Error:", error);
      throw new Error(`ML prediction failed: ${error.message}`);
    }
  },

  async healthCheck() {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/health`, {
        method: 'GET',
        timeout: 5000, // 5 seconds timeout
      });

      if (!response.ok) {
        return { status: 'unhealthy' };
      }

      return await response.json();
    } catch (error) {
      console.error("ML Service Health Check Error:", error);
      return { status: 'unhealthy' , error: error.message};
    }
  },
};
