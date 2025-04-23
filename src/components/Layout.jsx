import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

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
    <div className="d-flex vh-100 position-relative">
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
            />
          </motion.div>
        </AnimatePresence>

        {/* Animated Page Content */}
        <div
          className="flex-grow-1 overflow-auto"
          style={{ backgroundColor: "#ddd" }}
        >
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
