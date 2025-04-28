import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearAdminLoginStatus } from "../utils/localStorageUtils";
import { FaBars, FaPowerOff } from "react-icons/fa";
import { FaRegLightbulb, FaLightbulb } from "react-icons/fa"; // Importing icons from React Icons
import { motion } from "framer-motion"; // If you want to animate it

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
  const user = JSON.parse(localStorage.getItem("user"));

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

  // Logout function
  const handleLogout = () => {
    // Clear login status in localStorage
    clearAdminLoginStatus();

    // Redirect to login page
    navigate("/");
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
              {user?.firstName?.charAt(0).toUpperCase()}
              {user?.lastName?.charAt(0).toUpperCase()}
            </strong>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              className="position-absolute d-flex flex-column align-items-center shadow-lg  "
              style={{ top: "50px", right: "-20px", width: "250px" }}
            >
              <div
                className="text-black  shadow-lg rounded p-3 d-flex flex-column align-items-center position-relative animate-dropdown"
                style={{
                  width: "100%",
                  border: "1px solid #ccc",
                  backgroundColor: "#fff", // <-- darker than bg-light
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-10px",
                    left: "80%",
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
                <div
                  className="bg-light shadow-lg rounded w-100 p-2 border d-flex align-items-center justify-content-center mt-2"
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={toggleTheme}
                  title="Toggle Theme"
                >
                  <motion.div
                    animate={{ scale: theme === "light" ? 1.2 : 1 }} // Scale animation when theme changes
                    transition={{
                      duration: 0.3,
                      type: "spring",
                      stiffness: 300,
                    }}
                    className="d-flex align-items-center"
                  >
                    {/* Bulb icon changes based on the theme */}
                    {theme === "light" ? (
                      <FaLightbulb
                        className="text-warning" // Orange color for "light" theme
                        size={24}
                      />
                    ) : (
                      <FaRegLightbulb
                        className="text-muted" // Gray color for "dark" theme
                        size={24}
                      />
                    )}

                    <span className="fw-semibold ms-2">
                      {theme === "light" ? "Turn Off Lights" : "Turn On Lights"}
                    </span>
                  </motion.div>
                </div>

                <div
                  className="bg-light shadow-lg rounded w-100 p-2 border d-flex align-items-center justify-content-center"
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={handleLogout}
                  title="Logout"
                >
                  <FaPowerOff className="text-danger me-2" size={20} />
                  <span className="text-danger fw-semibold">Logout</span>
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
        `}
      </style>
    </nav>
  );
};

export default Navbar;
