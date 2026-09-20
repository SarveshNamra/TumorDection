/*
    Maps an Axios error to a user-friendly message.
    Prefers the backend's own message (matches { success, message, data }
    contract) and falls back to a generic message per status code.
    401 is intentionally not special-cased here — the global interceptor
    in api.js already clears AuthContext and ProtectedRoute redirects.
 */
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  const status = error.response?.status;
  const backendMessage = error.response?.data?.message;

  if (backendMessage) return backendMessage;

  switch (status) {
    case 400:
      return "Invalid request. Please check the form and try again.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 500:
      return "Server error. Please try again later.";
    default:
      return fallback;
  }
};