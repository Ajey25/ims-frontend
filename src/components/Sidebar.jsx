import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaBox,
  FaChevronDown,
  FaChartBar,
  FaClipboardCheck,
  FaClipboardList,
  FaFileContract,
  FaBookOpen,
  FaTasks,
  FaRegFileAlt,
  FaFileInvoice,
  FaTimes,
} from "react-icons/fa";

const Sidebar = ({ isSidebarOpen, toggleSidebar, isMobile }) => {
  const location = useLocation();
  const [isTransactionOpen, setIsTransactionOpen] = useState(true);
  const [isMasterOpen, setIsMasterOpen] = useState(true);
  const [isReportsOpen, setIsReportsOpen] = useState(true);

  return (
    <div
      className="bg-dark text-white d-flex flex-column shadow"
      style={{
        width: isSidebarOpen ? "250px" : isMobile ? "0" : "70px",
        transition: "width 0.3s ease-in-out",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
        <h5 className={isSidebarOpen ? "mb-0" : "d-none"}>Menu</h5>
        {(!isMobile || (isMobile && isSidebarOpen)) && (
          <button
            className="btn btn-outline-light btn-sm"
            onClick={toggleSidebar}
          >
            {isMobile ? <FaTimes /> : <FaBars />}
          </button>
        )}
      </div>

      {/* Scrollable Menu */}
      <div className="flex-grow-1 overflow-auto">
        <ul className="nav flex-column mt-3">
          {/* Masters */}
          <li className="nav-item ">
            <button
              className={`nav-link text-white d-flex align-items-center w-100 bg-transparent border-0 ${
                isMasterOpen ? "is-open" : ""
              }`}
              onClick={() => setIsMasterOpen(!isMasterOpen)}
            >
              <FaBox className="me-2" size={20} />
              {isSidebarOpen && (
                <span className="d-flex align-items-center flex-grow-1 justify-content-between">
                  Masters
                  <FaChevronDown
                    className="arrow"
                    style={{
                      transform: isMasterOpen ? "rotate(180deg)" : "none",
                      transition: "all 0.3s ease",
                    }}
                  />
                </span>
              )}
            </button>

            {isSidebarOpen && isMasterOpen && (
              <ul className="nav flex-column ms-3">
                <li>
                  <Link
                    to="/app/masters/item-master"
                    className={`nav-link text-white py-2 ${
                      location.pathname === "/app/masters/item-master"
                        ? "active"
                        : ""
                    }`}
                    onClick={isMobile ? toggleSidebar : undefined}
                  >
                    Item Master
                  </Link>
                </li>
                <li>
                  <Link
                    to="/app/masters/usermaster"
                    className={`nav-link text-white py-2 ${
                      location.pathname === "/app/masters/usermaster"
                        ? "active"
                        : ""
                    }`}
                    onClick={isMobile ? toggleSidebar : undefined}
                  >
                    User Master
                  </Link>
                </li>
                <li>
                  <Link
                    to="/app/masters/customer-master"
                    className={`nav-link text-white py-2 ${
                      location.pathname === "/app/masters/customer-master"
                        ? "active"
                        : ""
                    }`}
                    onClick={isMobile ? toggleSidebar : undefined}
                  >
                    Customer Master
                  </Link>
                </li>
                <li>
                  <Link
                    to="/app/masters/stockmaster"
                    className={`nav-link text-white py-2 ${
                      location.pathname === "/app/masters/stockmaster"
                        ? "active"
                        : ""
                    }`}
                    onClick={isMobile ? toggleSidebar : undefined}
                  >
                    Stock Master
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Transactions */}
          <li className="nav-item px-2 mt-2">
            <button
              className={`nav-link text-white d-flex align-items-center w-100 bg-transparent border-0 ${
                isTransactionOpen ? "is-open" : ""
              }`}
              onClick={() => setIsTransactionOpen(!isTransactionOpen)}
            >
              <FaFileInvoice className="me-2" size={20} />
              {isSidebarOpen && (
                <span className="d-flex align-items-center flex-grow-1 justify-content-between">
                  Transactions
                  <FaChevronDown
                    className="arrow"
                    style={{
                      transform: isTransactionOpen ? "rotate(180deg)" : "none",
                      transition: "all 0.3s ease",
                    }}
                  />
                </span>
              )}
            </button>

            {isSidebarOpen && isTransactionOpen && (
              <ul className="nav flex-column ms-3">
                <li>
                  <Link
                    to="/app/transactions/inward"
                    className={`nav-link text-white py-2 ${
                      location.pathname === "/app/transactions/inward"
                        ? "active"
                        : ""
                    }`}
                    onClick={isMobile ? toggleSidebar : undefined}
                  >
                    Inward
                  </Link>
                </li>
                <li>
                  <Link
                    to="/app/transactions/onrent"
                    className={`nav-link text-white py-2 ${
                      location.pathname === "/app/transactions/onrent"
                        ? "active"
                        : ""
                    }`}
                    onClick={isMobile ? toggleSidebar : undefined}
                  >
                    On Rent
                  </Link>
                </li>
                <li>
                  <Link
                    to="/app/transactions/onrentreturn"
                    className={`nav-link text-white py-2 ${
                      location.pathname === "/app/transactions/onrentreturn"
                        ? "active"
                        : ""
                    }`}
                    onClick={isMobile ? toggleSidebar : undefined}
                  >
                    On Rent Return
                  </Link>
                </li>
                <li>
                  <Link
                    to="/app/transactions/payment"
                    className={`nav-link text-white py-2 ${
                      location.pathname === "/app/transactions/payment"
                        ? "active"
                        : ""
                    }`}
                    onClick={isMobile ? toggleSidebar : undefined}
                  >
                    Payment
                  </Link>
                </li>
              </ul>
            )}
          </li>
          {/* Reports */}
          <li className="nav-item px-2 mt-2">
            <button
              className={`nav-link text-white d-flex align-items-center w-100 bg-transparent border-0 ${
                isReportsOpen ? "is-open" : ""
              }`}
              onClick={() => setIsReportsOpen(!isReportsOpen)}
            >
              <FaChartBar className="me-2" size={20} />

              {isSidebarOpen && (
                <span className="d-flex align-items-center flex-grow-1 justify-content-between">
                  Reports
                  <FaChevronDown
                    className="arrow"
                    style={{
                      transform: isReportsOpen ? "rotate(180deg)" : "none",
                      transition: "all 0.3s ease",
                    }}
                  />
                </span>
              )}
            </button>

            {isSidebarOpen && isReportsOpen && (
              <ul className="nav flex-column ms-3">
                <li>
                  <Link
                    to="/app/reports/customerreports"
                    className={`nav-link text-white py-2 ${
                      location.pathname === "/app/reports/customerreports"
                        ? "active"
                        : ""
                    }`}
                    onClick={isMobile ? toggleSidebar : undefined}
                  >
                    Customer Report
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>

      <style>
        {`
          @media (max-width: 768px) {
            .nav-link {
              padding: 0.75rem 1rem;
              font-size: 16px;
            }
            .nav-link.active {
              background-color: rgba(255,255,255,0.1);
              border-radius: 4px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Sidebar;
