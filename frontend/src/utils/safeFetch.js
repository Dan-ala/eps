// In utils/safeFetch.js

export const safeFetch = async (url, options = {}) => {
  // 1. Get the token (assuming your login saves it here)
  const token = localStorage.getItem("token"); 

  // 2. Build the headers
  const headers = {
    "Content-Type": "application/json",
    // 3. Conditionally add the correct Authorization header format: "Bearer [TOKEN]"
    ...(token && { "Authorization": `Bearer ${token}` }), 
    ...options.headers, 
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    // 4. Throw a detailed error if the status is bad (like 401)
    if (!response.ok) {
        throw new Error(`HTTP error! ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Fetch failed:", error);
    throw error;
  }
};