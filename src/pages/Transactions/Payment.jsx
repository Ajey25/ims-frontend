import { useState, useEffect } from "react";
import PaymentEditModal from "../../components/PaymentEditModal";
import PaymentDetails from "../../components/PaymentDetailsModal";
import axios from "axios";
import { FaEye, FaTrash } from "react-icons/fa";
import GreenTick from "../../assets/yes.png";
import YellowTick from "../../assets/warning.png";
import { toast } from "react-toastify";
import Pagination from "../../components/Pagination";

const API_URL = "http://localhost:5001/api/payment";

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [customers, setCustomers] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(10); // Change this as needed
  useEffect(() => {
    const updateRowsPerPage = () => {
      if (window.innerWidth <= 768) {
        setRowsPerPage(10); // Increase rows for mobile
      } else {
        setRowsPerPage(10); // Default for larger screens
      }
    };

    // Initial check and event listener
    updateRowsPerPage();
    window.addEventListener("resize", updateRowsPerPage);

    return () => window.removeEventListener("resize", updateRowsPerPage);
  }, []);
  useEffect(() => {
    fetchPayments();
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/customerMaster"
      );
      const customerMap = {};
      response.data.forEach((customer) => {
        customerMap[customer.id] = customer.customerName; // 🔥 THIS IS WHAT YOU NEED
      });
      setCustomers(customerMap); // 👈 now this is a map of id => name
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Error fetching Customers");
    }
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPayments(response.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Error fetching payments:", error);
    }
  };

  const savePayment = async (payment) => {
    try {
      setPayments((prevPayments) => [...prevPayments, payment]);
      setShowForm(false);
      toast.success("Payment saved successfully!");
    } catch (error) {
      console.error("Error saving payment:", error);
      toast.error("Error saving payment");
    }
  };

  const filteredPayments = payments.filter((p) => {
    console.log("p", p);
    const searchLower = search.toLowerCase();
    const customerName = p.customerName || "";
    const createdBy = p.createdBy || "";
    // Check customer name and allocated returns
    if (
      customerName.toLowerCase().includes(searchLower) ||
      createdBy.toLowerCase().includes(searchLower) ||
      (p.allocatedReturns &&
        p.allocatedReturns.some((ret) =>
          ret.returnNumber.toString().includes(searchLower)
        ))
    ) {
      return true;
    }

    // Enhanced date searching
    if (p.createdAt) {
      // Create a date object
      const date = new Date(p.createdAt);

      // Get date components
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear().toString();

      // Create multiple date formats for searching
      const mmddyyyy = `${month}-${day}-${year}`; // MM-DD-YYYY
      const ddmmyyyy = `${day}/${month}/${year}`; // DD/MM/YYYY (original en-GB format)
      const yyyymmdd = `${year}-${month}-${day}`; // YYYY-MM-DD (ISO format)

      // Check if search matches any date component or format
      if (
        mmddyyyy.includes(searchLower) ||
        ddmmyyyy.includes(searchLower) ||
        yyyymmdd.includes(searchLower) ||
        day.includes(searchLower) ||
        month.includes(searchLower) ||
        year.includes(searchLower)
      ) {
        return true;
      }
    }

    return false;
  });
  const totalPages = Math.ceil(filteredPayments.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedPayments = [...filteredPayments] // clone it to avoid mutating state
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // sort newest first
    .slice(startIndex, endIndex);

  return (
    <div className="container px-lg-0 px-1">
      {showForm ? (
        <PaymentEditModal
          payment={selectedPayment}
          onSave={savePayment}
          onClose={() => setShowForm(false)}
        />
      ) : showDetails ? (
        <PaymentDetails
          payment={selectedPayment}
          onClose={() => setShowDetails(false)}
        />
      ) : (
        <>
          <div className="d-flex justify-content-between mb-2">
            <h4>Payment Transactions</h4>
            <button
              className="btn animated-btn"
              onClick={() => {
                setSelectedPayment(null);
                setShowForm(true);
              }}
            >
              <span> + Add Payment</span>
            </button>
          </div>
          <div className="d-flex justify-content-end mb-3">
            <input
              type="text"
              className="form-control"
              style={{ width: "250px" }}
              placeholder="Search Payments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-responsive" style={{ minHeight: "395px" }}>
            <table className="table table-sm table-bordered table-striped text-center">
              <thead className="table-dark">
                <tr>
                  <th>Sr No.</th>
                  <th>Date</th>
                  <th>Customer Name</th>
                  <th>Paid Amount</th>
                  <th>Payment Type</th>
                  <th>Returns</th>
                  <th>Created By</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.length > 0 ? (
                  paginatedPayments.map((payment, index) => (
                    <tr key={payment.id}>
                      <td>{index + 1}</td>

                      <td>
                        {new Date(payment.createdAt).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>

                      <td>{customers[payment.customerId] || "N/A"}</td>
                      <td>₹{payment.paidAmount.toFixed(2)}</td>
                      <td>{payment.paymentType}</td>
                      <td>
                        {payment.allocatedReturns &&
                          payment.allocatedReturns.map((ret) => (
                            <div
                              key={ret.id}
                              className="d-flex align-items-center mb-1"
                            >
                              <span className="badge me-1">
                                {ret.isReturnCompleted ? (
                                  <img
                                    src={GreenTick}
                                    alt="Completed"
                                    style={{ width: "16px", height: "16px" }}
                                  />
                                ) : (
                                  <img
                                    src={YellowTick}
                                    alt="Pending"
                                    style={{ width: "16px", height: "16px" }}
                                  />
                                )}
                              </span>
                              #{ret.returnNumber} - ₹
                              {ret.allocatedAmount.toFixed(2)}
                            </div>
                          ))}
                      </td>
                      <td>{payment.createdBy}</td>
                      <td>
                        {new Date(payment.createdAt).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>

                      <td>
                        <button
                          className="btn btn-info btn-sm me-2"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowDetails(true);
                          }}
                        >
                          <FaEye />
                        </button>
                        {/* <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deletePayment(payment._id)}
                        >
                          <FaTrash />
                        </button> */}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default Payment;
