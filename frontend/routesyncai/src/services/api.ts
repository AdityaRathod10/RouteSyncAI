import axios from "axios";

// Use environment variable for API URL
const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://routesyncai.onrender.com" // Your actual Render URL
    : "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: false, // Must be false for CORS with allow_origins=["*"]
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // Increase timeout for Render cold starts
});

// Test function to verify CORS is working
export const testCors = async () => {
  try {
    const response = await api.get("/test-cors");
    console.log("CORS Test Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("CORS Test Error:", error);
    throw error;
  }
};

export const findPaths = async (data: Record<string, unknown>) => {
  try {
    // Convert form values to match backend expectations
    const formattedData = {
      ...data,
      // Convert 'avoid' to 'avoid' and 'allow' to 'ignore' for backend compatibility
      prohibited_flag: data.prohibited_flag === "allow" ? "ignore" : "avoid",
      restricted_flag: data.restricted_flag === "allow" ? "ignore" : data.restricted_flag,
    };

    console.log("Sending data to API:", formattedData);
    console.log("API URL:", API_URL);

    // Make the request with explicit headers
    const response = await api.post("/find_paths/", formattedData);

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Full error object:", error);

    if (axios.isAxiosError(error)) {
      // Log detailed information about the error
      console.error("Axios Error Details:", {
        message: error.message,
        code: error.code,
        response: error.response,
        request: error.request,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
        }
      });

      if (error.response?.status === 422) {
        // Extract and log the validation error details
        console.error("Validation Error:", error.response.data.detail);
        throw new Error(`Validation Error: ${error.response.data.detail[0].msg}`);
      } else if (error.code === "ERR_NETWORK") {
        console.error("Network Error - Check if the server is running");
        throw new Error("Cannot connect to server. Please check your internet connection and try again.");
      } else if (error.code === "ECONNABORTED") {
        console.error("Request timed out");
        throw new Error("Request timed out. The server might be overloaded.");
      } else if (error.response?.status === 404) {
        throw new Error("API endpoint not found. Please check the server configuration.");
      } else if (error.response && error.response.status >= 500) {
        throw new Error("Server error. Please try again later.");
      }
    }

    console.error("Axios Error:", error);
    throw new Error("An unexpected error occurred. Please try again.");
  }
};