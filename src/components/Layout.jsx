import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import {
  getAdminLoginStatus,
  SESSION_DURATION,
} from "../utils/localStorageUtils";
import { toast } from "react-toastify"; // Import toast from react-toastify

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDimmed, setIsDimmed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [theme, setTheme] = useState("light");
  const [isOnline, setIsOnline] = useState(navigator.onLine); // Track network status
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check session validity on mount
    if (!getAdminLoginStatus()) {
      localStorage.clear();
      navigate("/");
    }

    // Set a timer to log out after 1 minute (60 seconds)
    const timeoutId = setTimeout(() => {
      clearAdminLoginStatus();
      navigate("/", { replace: true });
      toast.error("Session expired. Please log in again.");
    }, SESSION_DURATION);

    // Clean up the timeout when the component is unmounted or session is valid
    return () => clearTimeout(timeoutId);
  }, [navigate]);

  useEffect(() => {
    // Listen to online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      toast.dismiss(); // Dismiss the "Disconnected" message when back online
      toast.success("You are back online!"); // Show the online message
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Oops! You’re offline. Check your connection!"); // Show the disconnected message
    };

    // Add event listeners for online/offline
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup event listeners
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    setIsDimmed((prev) => !prev);
    document.documentElement.style.setProperty(
      "--background-color",
      theme === "light" ? "#ccc" : "#e5e5e5" // Switch based on current theme
    );
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle Sidebar
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div
      className="d-flex vh-100 position-relative "
      style={{
        backgroundColor: theme === "light" ? "#e5e5e5" : "#ccc",
      }}
    >
      {/* Sidebar */}
      <div
        className={`sidebar-wrapper ${isMobile ? "mobile" : ""} ${
          isSidebarOpen ? "open" : ""
        }`}
        style={{
          position: isMobile ? "fixed" : "relative",
          zIndex: 1050,
          height: "100vh",
        }}
      >
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />
      </div>

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="position-fixed vh-100 vw-100"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1040 }}
          onClick={toggleSidebar}
        />
      )}

      {/* Dimming Overlay */}
      {isDimmed && <div className="dim-overlay"></div>}

      {/* Main Content */}
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{ height: "100vh", overflow: "hidden", width: "100%" }}
      >
        {/* Animated Navbar */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`navbar-${location.pathname}`}
            initial={{ opacity: 0, x: -100 }} // Enter from left
            animate={{ opacity: 1, x: 0 }} // Centered
            exit={{ opacity: 0, x: 100 }} // Exit to right
            transition={{
              duration: 0.3,
              ease: [0.2, 0.0, 0.1, 1], // Smooth cubic easing
            }}
            className="sticky-top"
          >
            <Navbar
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              isMobile={isMobile}
              theme={theme}
              setTheme={setTheme}
              toggleTheme={toggleTheme}
            />
          </motion.div>
        </AnimatePresence>

        {/* Animated Page Content */}
        <div className="flex-grow-1 overflow-auto">
          <div className="container-fluid p-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: -100 }} // Always from left
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }} // Always to right
                transition={{
                  duration: 0.3,
                  ease: [0.3, 0.0, 0.2, 1], // Smooth cubic easing
                }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
