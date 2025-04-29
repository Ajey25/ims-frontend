import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getAdminLoginStatus,
  isSessionValid,
  clearAdminLoginStatus,
  getSessionTimeRemaining,
} from "../utils/localStorageUtils";

// Create context
const SessionContext = createContext({
  isAuthenticated: false,
  logout: () => {},
  refreshSession: () => {},
});

/**
 * Session provider component that manages authentication state
 * and session timeout
 */
export const SessionProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(getAdminLoginStatus());
  const navigate = useNavigate();

  // Function to handle logout
  const logout = () => {
    clearAdminLoginStatus();
    setIsAuthenticated(false);
    navigate("/", { replace: true });
    // toast.info("You have been logged out.");
  };

  // Function to refresh the current session
  const refreshSession = () => {
    if (isAuthenticated) {
      localStorage.setItem("loginTime", Date.now().toString());
      setupSessionTimeout();
      toast.success("Session refreshed for another 3 hours.");
    }
  };
  const WARNING_BEFORE_EXPIRY = 5 * 60 * 1000;
  // Set up session timeout
  const setupSessionTimeout = () => {
    const timeRemaining = getSessionTimeRemaining();

    if (timeRemaining <= 0) {
      logout();
      return;
    }

    const timeoutId = setTimeout(() => {
      if (isAuthenticated && !isSessionValid()) {
        logout();
        toast.error("Your session has expired. Please log in again.");
      }
    }, timeRemaining);

    let warningTimeout;
    if (timeRemaining > WARNING_BEFORE_EXPIRY) {
      warningTimeout = setTimeout(() => {
        toast.warning(
          "Your session will expire in 5 minutes. Refresh your session?",
          {
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            closeButton: true,
            onClick: refreshSession,
          }
        );
      }, timeRemaining - WARNING_BEFORE_EXPIRY);
    }

    return () => {
      clearTimeout(timeoutId);
      if (warningTimeout) clearTimeout(warningTimeout);
    };
  };

  // Check authentication status on initial load and setup timeout
  useEffect(() => {
    const checkAuth = () => {
      const status = getAdminLoginStatus();
      setIsAuthenticated(status);

      if (!status && localStorage.getItem("token")) {
        // Session expired but tokens still exist
        clearAdminLoginStatus();
        navigate("/", { replace: true });
        toast.error("Your session has expired. Please log in again.");
      }
    };

    checkAuth();
    const cleanup = setupSessionTimeout();

    // Check auth status when window regains focus
    const handleFocus = () => {
      checkAuth();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      if (cleanup) cleanup();
      window.removeEventListener("focus", handleFocus);
    };
  }, [navigate, isAuthenticated]);

  return (
    <SessionContext.Provider
      value={{ isAuthenticated, logout, refreshSession }}
    >
      {children}
    </SessionContext.Provider>
  );
};

// Custom hook to use the session context
export const useSession = () => useContext(SessionContext);

export default SessionProvider;
