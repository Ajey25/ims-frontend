import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearAdminLoginStatus } from "../utils/localStorageUtils";
import { FaBars, FaPowerOff } from "react-icons/fa";

const Navbar = ({ isSidebarOpen, toggleSidebar, isMobile }) => {
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
              className="position-absolute bg-white text-black shadow rounded p-2"
              style={{
                top: "50px",
                right: "-5px",
                width: "150px",
                border: "1px solid #ccc",
              }}
            >
              <div className="text-center mb-2">
                <strong>
                  {user?.firstName} {user?.lastName}
                </strong>
              </div>
              <button
                className="btn btn-link p-1 text-danger w-100"
                onClick={handleLogout}
                title="Logout"
              >
                <FaPowerOff size={22} /> Logout
              </button>
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
