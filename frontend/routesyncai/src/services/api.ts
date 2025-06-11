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
  timeout: 15000, // Add a timeout to prevent hanging requests
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

export const findPaths = async (data: any) => {
  try {
    // Convert form values to match backend expectations
    const formattedData = {
      ...data,
      // Convert 'avoid' to 'avoid' and 'allow' to 'ignore' for backend compatibility
      prohibited_flag: data.prohibited_flag === "allow" ? "ignore" : "avoid",
      restricted_flag: data.restricted_flag === "allow" ? "ignore" : data.restricted_flag,
    };

    console.log("Sending data to API:", formattedData);

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
      });

      if (error.response?.status === 422) {
        // Extract and log the validation error details
        console.error("Validation Error:", error.response.data.detail);
        throw new Error(`Validation Error: ${error.response.data.detail[0].msg}`);
      } else if (error.code === "ERR_NETWORK") {
        console.error("Network Error - Check if the server is running");
        throw new Error("Cannot connect to server. Please make sure the backend is running.");
      } else if (error.code === "ECONNABORTED") {
        console.error("Request timed out");
        throw new Error("Request timed out. The server might be overloaded.");
      }
    }

    console.error("Axios Error:", error);
    throw error;
  }
};