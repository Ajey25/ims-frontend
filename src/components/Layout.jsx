import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Offline from "../components/Offline";
import {
  getAdminLoginStatus,
  SESSION_DURATION,
  clearAdminLoginStatus,
} from "../utils/localStorageUtils";
import { toast } from "react-toastify";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDimmed, setIsDimmed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [theme, setTheme] = useState("light");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [forceOfflinePage, setForceOfflinePage] = useState(false);

  const previousPath = useRef(window.location.pathname);
  const location = useLocation();
  const navigate = useNavigate();

  // Session timeout handling
  useEffect(() => {
    if (!getAdminLoginStatus()) {
      localStorage.clear();
      navigate("/");
    }

    const timeoutId = setTimeout(() => {
      clearAdminLoginStatus();
      navigate("/", { replace: true });
      toast.error("Session expired! Please log in again.");
    }, SESSION_DURATION);

    return () => clearTimeout(timeoutId);
  }, [navigate]);

  // Online/Offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setForceOfflinePage(false);
      toast.dismiss();
      toast.success("You are back online!");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Oops! You're offline. Check your connection!");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Force Offline Page only on route change while offline
  useEffect(() => {
    if (!isOnline && location.pathname !== previousPath.current) {
      setForceOfflinePage(true);
    } else {
      previousPath.current = location.pathname;
    }
  }, [location.pathname, isOnline]);

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    setIsDimmed((prev) => !prev);
    document.documentElement.style.setProperty(
      "--background-color",
      newTheme === "light" ? "#e5e5e5" : "#ccc"
    );
  };

  // Responsive layout listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) setIsSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Show Offline component if forced
  if (forceOfflinePage) {
    return <Offline />;
  }

  return (
    <div
      className="d-flex vh-100 position-relative"
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
        {/* Navbar */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`navbar-${location.pathname}`}
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: [0.2, 0.0, 0.1, 1] }}
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

        {/* Page Content */}
        <div className="flex-grow-1 overflow-auto">
          <div className="container-fluid p-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.3, ease: [0.3, 0.0, 0.2, 1] }}
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
