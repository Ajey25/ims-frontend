import { useState, useEffect } from "react";
import OnRentReturnEditModal from "../../components/OnRentReturnEditModal";
import OnRentReturnDetailsModal from "../../components/OnRentReturnDetailsModal";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import Pagination from "../../components/Pagination";
import { useSearchParams } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/onrentreturn`;

const OnRentReturn = () => {
  const [searchParams] = useSearchParams();
  const returnNumber = searchParams.get("returnNumber");
  const [orr, setOrr] = useState([]);
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedOrr, setSelectedOrr] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    if (returnNumber) {
      // Find the specific Return item by returnNumber
      const foundReturn = orr.find(
        (item) => item.onRentReturnNo === parseInt(returnNumber)
      );
      if (foundReturn) {
        setSelectedOrr(foundReturn);
        setShowDetails(true);
      }
    }
  }, [returnNumber, orr]); // Depend on returnNumber and returns

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
    fetchOrr();
  }, []);

  const fetchOrr = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrr(response.data);
    } catch (error) {
      console.error("Error fetching orrs:", error);
    }
  };

  const saveOrr = async (orr) => {
    setIsSaving(true);

    try {
      const orrData = {
        onRentReturnDate: orr.onRentReturnDate,
        customerName: orr.customerName,
        items: orr.items.map((item) => ({
          onRentNo: item.onRentNo,
          itemId: item.itemId,
          itemName: item.itemName,
          uom: item.uom,
          qtyOrWeight: item.qtyOrWeight,
          qtyReturn: Number(item.qtyReturn),
          perDayRate: item.perDayRate,
        })),
        vehicleDetails: {
          vehicleName: orr.vehicleDetails.vehicleName,
          vehicleNo: orr.vehicleDetails.vehicleNo,
          driverName: orr.vehicleDetails.driverName,
          mobileNo: orr.vehicleDetails.mobileNo,
        },
      };

      let response;
      if (selectedOrr) {
        const token = localStorage.getItem("token");

        response = await axios.put(
          `${API_URL}/${selectedOrr.onRentReturnNo}`,
          orrData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("On rent return updated successfully");
      } else {
        const token = localStorage.getItem("token");

        response = await axios.post(`${API_URL}`, orrData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("On rent return added successfully");
      }

      fetchOrr();
      setShowEditForm(false);
    } catch (error) {
      console.error("Error saving orr:", error);
      const errorMessage = error.response?.data?.message || error.message;
      // alert(`Failed to save on rent return: ${errorMessage}`);\
      toast.error(`Failed to save on rent return: ${errorMessage}`);
    } finally {
      setIsSaving(false);
      console.log("Saving state reset");
      // this ALWAYS runs, rain or shine
    }
  };

  const filteredOrrs = orr
    .filter((o) => {
      // For number and customer name searching (case insensitive)
      const customerName = o.customers?.customerName || o.customerName || "";
      const searchLower = search.toLowerCase();

      if (
        (o.onRentReturnNo && o.onRentReturnNo.toString().includes(search)) ||
        customerName.toLowerCase().includes(searchLower) ||
        o.createdBy.toLowerCase().includes(searchLower)
      ) {
        return true;
      }

      // For date searching
      if (o.onRentReturnDate) {
        // Create a date object
        const date = new Date(o.onRentReturnDate);

        // Original YYYY-MM-DD format
        const formattedDate = date.toISOString().split("T")[0];

        // Format as DD/MM/YYYY for user-friendly searching
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear().toString();
        const ddmmyyyyFormat = `${day}/${month}/${year}`;

        // Check if search query matches any date component
        if (
          formattedDate.includes(search) ||
          ddmmyyyyFormat.includes(search) ||
          day.includes(search) ||
          month.includes(search) ||
          year.includes(search)
        ) {
          return true;
        }
      }

      return false;
    })
    .sort((a, b) => {
      // Priority Sorting: Pending (0) → Partially Paid (1) → Completed (2)
      const aPriority = a.isReturnCompleted ? 2 : a.paidAmount === 0 ? 0 : 1;
      const bPriority = b.isReturnCompleted ? 2 : b.paidAmount === 0 ? 0 : 1;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Secondary Sorting: Latest entries first (by createdAt date)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  const totalPages = Math.ceil(filteredOrrs.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedOrrs = filteredOrrs.slice(startIndex, endIndex);

  return (
    <div className="container px-lg-0 px-1">
      {showEditForm ? (
        <OnRentReturnEditModal
          orr={selectedOrr}
          onSave={saveOrr}
          onClose={() => setShowEditForm(false)}
          isSaving={isSaving}
        />
      ) : showDetails ? (
        <OnRentReturnDetailsModal
          orr={selectedOrr}
          onClose={() => setShowDetails(false)}
        />
      ) : (
        <>
          <div className="d-flex justify-content-between mb-2">
            <h4>On Rent Return Transactions</h4>
            <button
              className="btn animated-btn"
              onClick={() => {
                setSelectedOrr(null);
                setShowEditForm(true);
              }}
            >
              <span> +Add On Rent Return </span>
            </button>
          </div>
          <div className="d-flex justify-content-end mb-3">
            <input
              type="text"
              className="form-control shadow-sm"
              style={{ width: "250px" }}
              placeholder="Search On Rent Return ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-responsive" style={{ minHeight: "395px" }}>
            <table className="table table-sm table-bordered shadow-sm text-center">
              <thead className="table-light">
                <tr>
                  <th>Sr No.</th>
                  <th>Return No.</th>
                  <th>Return Date</th>
                  <th>Customer Name</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Balance Amount</th>
                  <th>Created By</th>
                  <th>Created At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrrs.length > 0 ? (
                  paginatedOrrs.map((orr, index) => (
                    <tr key={orr.onRentReturnNo}>
                      <td>{index + 1}</td>
                      <td>{orr.onRentReturnNo}</td>
                      <td>
                        {new Date(orr.onRentReturnDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>
                      <td>{orr.customers.customerName || "N/A"}</td>
                      <td>₹{(orr.totalAmount || 0).toFixed(2)}</td>
                      <td>₹{(orr.paidAmount || 0).toFixed(2)}</td>
                      <td>₹{(orr.balanceAmount || 0).toFixed(2)}</td>
                      <td>{orr.createdBy}</td>
                      <td>
                        {new Date(orr.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            orr.isReturnCompleted
                              ? "bg-success" // Fully completed
                              : orr.paidAmount > 0 && orr.balanceAmount > 0
                              ? "bg-primary" // Partial Completion (New Condition)
                              : "bg-warning text-dark" // Pending
                          }`}
                        >
                          {orr.isReturnCompleted
                            ? "Completed"
                            : orr.paidAmount > 0 && orr.balanceAmount > 0
                            ? "Partially Paid"
                            : "Pending"}
                        </span>
                      </td>

                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          {/* View Button - Always Visible */}
                          <button
                            className="btn btn-outline-info btn-sm"
                            onClick={() => {
                              setSelectedOrr(orr);
                              setShowDetails(true);
                            }}
                          >
                            <FaEye />
                          </button>

                          {/* Edit Button - Only Visible if paidAmount === 0 */}
                          {orr.paidAmount === 0 &&
                            orr.items.every(
                              (item) =>
                                item.qtyOrWeight !== item.qtyReturn &&
                                item.qtyReturn > 0
                            ) && (
                              <button
                                className="btn btn-outline-warning btn-sm"
                                onClick={() => {
                                  setSelectedOrr(orr);
                                  setShowEditForm(true);
                                }}
                              >
                                <FaEdit />
                              </button>
                            )}

                          {/* Delete Button (Currently Commented Out) */}
                          {/* <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => deleteOrr(orr._id)}
            >
              <FaTrash />
            </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center">
                      No returns found
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

export default OnRentReturn;
