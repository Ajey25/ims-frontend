import { useState, useEffect } from "react";
import InwardEditModal from "../../components/InwardEditModal";
import InwardDetailsModal from "../../components/InwardDetailsModal";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import Pagination from "../../components/Pagination";

const Inward = () => {
  const [inwardList, setInwardList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingInward, setEditingInward] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [itemMap, setItemMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const token = localStorage.getItem("token");
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
    fetchInwardData();
    fetchItemData();
  }, []);

  const fetchInwardData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/inward`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch inward data");
      }
      const data = await response.json();
      setInwardList(data);
    } catch (error) {
      console.error("Error fetching inward data:", error);
    }
  };

  const fetchItemData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/itemMaster`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch item data");
      }
      const data = await response.json();
      const itemMap = data.reduce((acc, item) => {
        acc[item.id] = item.itemName;
        return acc;
      }, {});
      setItemMap(itemMap);
    } catch (error) {
      console.error("Error fetching item data:", error);
    }
  };

  // const handleAddInward = async (newItem) => {
  //   try {
  //     const response = await fetch(
  //       `${import.meta.env.VITE_API_BASE_URL}/inward`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(newItem),
  //       }
  //     );
  //     if (!response.ok) {
  //       throw new Error("Failed to add item");
  //     }
  //     fetchInwardData(); // Refresh list after adding
  //     toast.success("Inward added successfully");
  //   } catch (error) {
  //     console.error("Error adding item:", error);
  //     // alert("failed to add inward ,maybe is already used ");
  //     toast.error("Failed to add inward");
  //   }
  // };

  const handleSave = async (newInward) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");

      let response;
      if (editingInward) {
        response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/inward/${editingInward.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newInward),
          }
        );
      } else {
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/inward`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newInward),
        });
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to save inward");
      }

      toast.success(
        editingInward
          ? "Inward updated successfully"
          : "Inward added successfully"
      );

      fetchInwardData(); // Refresh the data
      setShowPopup(false);
    } catch (error) {
      console.error("Error saving inward:", error);
      toast.error(error.message || "Failed to save inward");
    } finally {
      setIsSaving(false);
      console.log("Saving state reset");
      // this ALWAYS runs, rain or shine
    }
  };

  const handleDelete = async (_id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/inward/${_id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete inward");

      fetchInwardData(); // Refresh the data
      toast.success("Inward deleted successfully");
    } catch (error) {
      console.error("Error deleting inward:", error);
      toast.error("Failed to delete inward");
    }
  };

  const filteredInward = inwardList.filter((item) => {
    // Convert to strings for consistent comparison
    const inwardNoStr = item.inwardNo.toString();
    const totalAmountStr = item.totalAmount.toString();

    // Basic search for number fields
    if (
      inwardNoStr.includes(searchQuery) ||
      totalAmountStr.includes(searchQuery)
    ) {
      return true;
    }

    // For ISO date format search
    if (item.inwardDate) {
      // Create a date object and format it in different ways for searching
      const date = new Date(item.inwardDate);

      // Format as YYYY-MM-DD (how it appears in the ISO string)
      const formattedDate = date.toISOString().split("T")[0];

      // Format as DD/MM/YYYY (for user-friendly searching)
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const ddmmyyyyFormat = `${day}/${month}/${year}`;

      // Check if search query matches any of these date formats
      if (
        formattedDate.includes(searchQuery) ||
        ddmmyyyyFormat.includes(searchQuery) ||
        item.inwardDate.includes(searchQuery) ||
        day.includes(searchQuery) ||
        month.includes(searchQuery) ||
        year.toString().includes(searchQuery)
      ) {
        return true;
      }
    }

    // Check createdBy field as well
    if (
      item.createdBy &&
      item.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return true;
    }

    return false;
  });
  const totalPages = Math.ceil(filteredInward.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedInward = filteredInward.reverse().slice(startIndex, endIndex);

  return (
    <div className="container px-lg-0 px-1">
      {showPopup ? (
        <InwardEditModal
          inward={editingInward}
          onSave={handleSave}
          onClose={() => {
            setShowPopup(false);
            setEditingInward(null);
          }}
          isSaving={isSaving}
        />
      ) : showDetailsPopup ? (
        <InwardDetailsModal
          inward={editingInward}
          itemMap={itemMap}
          onClose={() => setShowDetailsPopup(false)}
        />
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h4>Inward Records</h4>
            <button
              className="btn animated-btn"
              onClick={() => {
                setEditingInward(null);
                setShowPopup(true);
              }}
            >
              <span>+Add Inward</span>
            </button>
          </div>
          <div className="d-flex justify-content-end mb-3">
            <input
              type="text"
              className="form-control shadow-sm"
              style={{ width: "250px" }}
              placeholder="Search Inwards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="table-responsive" style={{ minHeight: "395px" }}>
            <table className="table table-sm table-bordered shadow-sm text-center">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Inward No</th>
                  <th>Inward Date</th>
                  {/* <th>Items</th> */}
                  <th>Total Amount</th>
                  <th>Created By</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInward.length > 0 ? (
                  paginatedInward.map((inward, index) => (
                    <tr key={inward.id}>
                      <td style={{ width: "5%" }}>{index + 1}</td>
                      <td>{inward.inwardNo}</td>
                      <td>
                        {new Date(inward.inwardDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>
                      {/* <td style={{ width: "45%" }}>
                        {inward.items.map((item, i) => (
                          <span
                            key={i}
                            className=" text-dark bg-dark-subtle  me-1 rounded-pill px-1"
                          >
                            {itemMap[item.item] || item.itemName} ({item.qty} x
                            {item.unitRate})
                          </span>
                        ))}
                      </td> */}
                      <td>₹{inward.totalAmount}</td>
                      <td>{inward.createdBy}</td>
                      <td>
                        {new Date(inward.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td>
                        <div className="d-flex justify-content-center">
                          <button
                            className="btn btn-outline-primary btn-sm me-2"
                            onClick={() => {
                              setEditingInward(inward);
                              setShowDetailsPopup(true);
                            }}
                          >
                            <FaEye />
                          </button>
                          <button
                            className="btn btn-outline-warning btn-sm me-2"
                            onClick={() => {
                              setEditingInward(inward);
                              setShowPopup(true);
                            }}
                          >
                            <FaEdit />
                          </button>
                          {/* <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(inward.id)}
                          >
                            <FaTrash />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No inward records found
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

export default Inward;
