import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaPowerOff, FaRegClock } from "react-icons/fa";
import { FaRegLightbulb, FaLightbulb } from "react-icons/fa";
import { motion } from "framer-motion";
import { useSession } from "./SessionProvider";
import { getSessionTimeRemaining } from "../utils/localStorageUtils";

const Navbar = ({
  isSidebarOpen,
  toggleSidebar,
  isMobile,
  theme,
  setTheme,
  toggleTheme,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [timeLeft, setTimeLeft] = useState(getSessionTimeRemaining());
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0"
    );
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const user = JSON.parse(
    localStorage.getItem("user") || '{"firstName":"", "lastName":""}'
  );

  // Get session functions from our SessionProvider
  const { logout, refreshSession } = useSession();

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".user-menu")) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [showDropdown]);

  // Dynamic page title based on current route
  useEffect(() => {
    const getPageTitle = () => {
      switch (location.pathname) {
        case "/app/masters/item-master":
          return "Item Master";
        case "/app/masters/customer-master":
          return "Customer Master";
        case "/app/masters/usermaster":
          return "User Master";
        case "/app/masters/stockmaster":
          return "Stock Master";
        case "/app/transactions/inward":
          return "Inward";
        case "/app/transactions/onrent":
          return "On Rent";
        case "/app/transactions/onrentreturn":
          return "On Rent Return";
        case "/app/transactions/payment":
          return "Payment";
        case "/app/reports/customerreports":
          return "Customer Reports";
        default:
          return "Dashboard";
      }
    };
    setPageTitle(getPageTitle());
  }, [location.pathname]);

  // Logout function - now using the session provider
  const handleLogout = () => {
    logout();
  };

  // Refresh session function - using the session provider
  const handleRefreshSession = () => {
    refreshSession();
    setShowDropdown(false);
  };

  return (
    <nav
      className="navbar navbar-dark bg-primary shadow-sm"
      style={{
        width: "100%",
        zIndex: 1000,
      }}
    >
      <div className="container-fluid px-2 px-sm-3">
        <div className="d-flex align-items-center" style={{ width: "40px" }}>
          {isMobile && (
            <button
              className="btn btn-link text-white p-1"
              onClick={toggleSidebar}
            >
              <FaBars size={24} />
            </button>
          )}
        </div>

        <h5 className="text-white mb-0 position-absolute start-50 translate-middle-x">
          {pageTitle}
        </h5>

        <div className="d-flex align-items-center justify-content-end position-relative user-menu">
          {/* Circle with first letter of first name and last name */}
          <div
            className="d-flex justify-content-center align-items-center bg-light text-primary rounded-circle "
            style={{
              width: "43px",
              height: "43px",
              fontSize: "20px",
              cursor: "pointer",
            }}
            onClick={toggleDropdown}
            title="User Menu"
          >
            <strong>
              {user?.firstName?.charAt(0).toUpperCase() || ""}
              {user?.lastName?.charAt(0).toUpperCase() || ""}
            </strong>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              className="position-absolute d-flex flex-column align-items-center shadow-lg"
              style={{ top: "50px", right: "-20px", width: "200px" }}
            >
              <div
                className="text-black shadow-lg rounded p-3 d-flex flex-column align-items-center position-relative animate-dropdown"
                style={{
                  width: "100%",
                  border: "1px solid #ccc",
                  backgroundColor: "#fff",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-10px",
                    left: "75%",
                    transform: "translateX(-0%)",
                    width: 0,
                    height: 0,
                    borderLeft: "10px solid transparent",
                    borderRight: "10px solid transparent",
                    borderBottom: "10px solid white",
                  }}
                ></div>

                <div className="mb-3 text-center fw-semibold">
                  {user?.firstName} {user?.lastName}
                </div>
                <div>
                  <FaRegClock
                    className="text-primary"
                    size={18}
                    style={{
                      marginRight: "8px",
                    }}
                  />{" "}
                  <small className="text-muted">
                    {formatTime(timeLeft)} remaining
                  </small>
                </div>

                {/* Refresh Session Button - New Addition */}
                <div
                  className="bg-light d-none shadow-sm rounded w-100 p-2 border d-flex align-items-center justify-content-center mt-2"
                  style={{
                    cursor: "pointer",
                    overflow: "hidden",
                    position: "relative",
                  }}
                  onClick={handleRefreshSession}
                  title="Refresh Session"
                >
                  {/* Background effect */}
                  <div
                    className="position-absolute"
                    style={{
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(108, 177, 255, 0.2)",
                      transition: "all 0.4s ease",
                    }}
                  />

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="d-flex align-items-center z-index-1 position-relative"
                  >
                    <FaRegClock
                      className="text-primary"
                      size={18}
                      style={{
                        marginRight: "8px",
                      }}
                    />
                    <span className="fw-semibold text-primary">
                      Refresh Session
                    </span>
                  </motion.div>
                </div>

                {/* Theme Toggle */}
                <div
                  className="bg-light d-none shadow-sm rounded w-100 p-2 border d-flex align-items-center justify-content-center mt-2"
                  style={{
                    cursor: "pointer",
                    overflow: "hidden",
                    position: "relative",
                  }}
                  onClick={toggleTheme}
                  title="Toggle Theme"
                >
                  {/* Background effect */}
                  <div
                    className="position-absolute"
                    style={{
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor:
                        theme === "light"
                          ? "rgba(255, 243, 205, 0.3)"
                          : "rgba(108, 117, 125, 0.2)",
                      transition: "all 0.4s ease",
                    }}
                  />

                  <motion.div
                    initial={{ y: 0 }}
                    animate={{
                      y: [0, -5, 0],
                      rotate: theme === "light" ? [0, 10, 0, -10, 0] : 0,
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: 0,
                      repeatType: "reverse",
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="d-flex align-items-center z-index-1 position-relative"
                  >
                    {theme === "light" ? (
                      <FaLightbulb
                        className="text-warning"
                        size={22}
                        style={{
                          filter: "drop-shadow(0 0 3px rgba(255, 193, 7, 0.5))",
                        }}
                      />
                    ) : (
                      <FaRegLightbulb className="text-secondary" size={22} />
                    )}

                    <span
                      className="fw-semibold ms-2"
                      style={{
                        transition: "color 0.3s ease",
                        color: theme === "light" ? "#6c757d" : "#6c757d",
                      }}
                    >
                      Lights {theme === "light" ? "On" : "Off"}
                    </span>
                  </motion.div>
                </div>

                {/* Logout Button */}
                <div
                  className="bg-light shadow-lg border-danger rounded w-100 p-2 border d-flex align-items-center justify-content-center mt-2"
                  style={{
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onClick={handleLogout}
                  title="Logout"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="d-flex align-items-center"
                  >
                    <FaPowerOff className="text-danger me-2" size={20} />
                    <span className="text-danger fw-semibold">Logout</span>
                  </motion.div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>
        {`
          @media (max-width: 768px) {
            .navbar {
              padding: 0.5rem 0 !important;
            }
            h5 {
              font-size: 1.2rem;
              margin: 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 60%;
            }
            .btn-link:hover {
              color: inherit;
              opacity: 0.8;
            }
            .btn-link:active {
              transform: scale(0.95);
            }
          }
          .table-responsive {
            scrollbar-width: thin;
            scrollbar-color: rgba(0,0,0,0.2) transparent;
          }
          .animate-dropdown {
            animation: fadeIn 0.2s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;
