import { useState, useEffect } from "react";
import OnRentEditModal from "../../components/OnRentEditModal";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { Form } from "react-bootstrap";
import OnRentDetailsModal from "../../components/OnRentDetailsModal";
import { toast } from "react-toastify";
import Pagination from "../../components/Pagination";
import { useSearchParams } from "react-router-dom";
import { select } from "framer-motion/client";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/onrent`;

const OnRent = () => {
  const [searchParams] = useSearchParams();
  const onRentNo = searchParams.get("onRentNo");

  const [onRent, setOnRent] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedOnRent, setSelectedOnRent] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (onRentNo) {
      // Find the specific OnRent item by onRentNo
      const foundOnRent = onRent.find(
        (item) => item.onRentNo === parseInt(onRentNo)
      );

      if (foundOnRent) {
        setSelectedOnRent(foundOnRent);
        setShowDetails(true);
      }
    }
  }, [onRentNo, onRent]);

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
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/customerMaster`
        );
        setCustomerOptions(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchOnRent();
  }, []);

  const fetchOnRent = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Process the data to update isActive based on remainingQty
      const updatedData = response.data.map((rent) => {
        const allItemsReturned = rent.items.every(
          (item) => item.remainingQty === 0
        );
        return { ...rent, isActive: !allItemsReturned }; // Set isActive to false if all items are returned
      });

      setOnRent(updatedData);
    } catch (error) {
      console.error("Error fetching onRent:", error);
    }
  };

  const fetchOnRentByNo = async (onRentNo) => {
    try {
      const response = await axios.get(`${API_URL}/${onRentNo}`);
      setSelectedOnRent(response.data);
      setShowDetails(true);
    } catch (error) {
      console.error("Error fetching onRent by No:", error);
    }
  };

  const saveOnRent = async (onRentData) => {
    setIsSaving(true);
    try {
      const preparedItems = await Promise.all(
        onRentData.items.map(async (item) => {
          let existingItemData = {};
          if (selectedOnRent) {
            const existingItem = selectedOnRent.items.find((i) => {
              // Handle direct ID comparison
              if (i.itemId && item.item_id) {
                return i.itemId === item.item_id;
              }
              // Handle object with id property
              else if (
                i.item_id &&
                typeof i.item_id === "object" &&
                i.item_id.id
              ) {
                return i.item_id.id === item.item_id;
              }
              // Direct comparison as fallback
              return i.item_id === item.item_id;
            });

            if (existingItem) {
              existingItemData = {
                qtyReturn: existingItem.qtyReturn || 0,
                onreturndate: item.onreturndate || 0,
                remainingQty: existingItem.remainingQty || item.qtyOrWeight,
                usedDays: existingItem.usedDays || 0,
                amount: existingItem.amount || 0,
                itemName: existingItem.itemName,
              };
            }
          }

          let itemName = existingItemData.itemName;
          if (!itemName) {
            try {
              const itemResponse = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/itemMaster/${
                  item.item_id
                }`
              );
              itemName = itemResponse.data.itemName;
            } catch (err) {
              console.error("Error fetching item name:", err);
              itemName = "Unknown Item"; // Fallback
            }
          }

          return {
            item_id: item.item_id,
            itemName: itemName,
            uom: item.uom,
            qtyOrWeight: item.qtyOrWeight,
            perDayRate: item.perDayRate,
            onreturndate: item.onreturndate || 0,
            qtyReturn: existingItemData.qtyReturn || 0,
            remainingQty: existingItemData.remainingQty || item.qtyOrWeight,
            usedDays: existingItemData.usedDays || 0,
            amount: existingItemData.amount || 0,
          };
        })
      );

      const vehicleDetails = {
        vehicleName: onRentData.vehicleDetails?.vehicleName || "",
        vehicleNo: onRentData.vehicleDetails?.vehicleNo || "",
        mobileNo: onRentData.vehicleDetails?.mobileNo || "",
        driverName: onRentData.vehicleDetails?.driverName || "",
      };

      const formattedOnRent = {
        onRentDate: onRentData.onRentDate,
        customerName:
          typeof onRentData.customerName === "object"
            ? onRentData.customerName.name
            : onRentData.customerName,
        customerId: onRentData.customerId || onRentData.customerName,

        items: preparedItems,
        vehicleDetails: vehicleDetails,
        isActive:
          onRentData.isActive !== undefined ? onRentData.isActive : true,
      };

      const token = localStorage.getItem("token");
      if (selectedOnRent) {
        await axios.put(
          `${API_URL}/${parseInt(selectedOnRent.onRentNo)}`,
          formattedOnRent,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        toast.success("OnRent updated successfully");
      } else {
        await axios.post(API_URL, formattedOnRent, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("OnRent saved successfully");
      }

      fetchOnRent(); // Refresh list
      setShowEditForm(false); // Close form
    } catch (error) {
      console.error("Error saving onRent:", error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Failed to save onRent: ${errorMessage}`);
    } finally {
      setIsSaving(false);
      console.log("Saving state reset");
      // this ALWAYS runs, rain or shine
    }
  };

  const deleteOnRent = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchOnRent();
    } catch (error) {
      console.error("Error deleting onRent:", error);
    }
  };

  const handleToggleStatus = async (onrentId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/onrent/toggle/${onrentId}`,
        { method: "PUT" }
      );

      if (!response.ok) {
        throw new Error(`Failed to toggle status. Status: ${response.status}`);
      }

      fetchOnRent(); // Refresh data
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };
  const filteredOnRent = onRent.filter((o) => {
    // For number and name searching (case insensitive)
    if (
      o.onRentNo?.toString().toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.createdBy?.toLowerCase().includes(search.toLowerCase())
    ) {
      return true;
    }

    // For date searching
    if (o.onRentDate) {
      // Create a date object
      const date = new Date(o.onRentDate);

      // Original YYYY-MM-DD format
      const formattedDate = o.onRentDate;

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
  });

  const totalPages = Math.ceil(filteredOnRent.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const sortedOnRent = [...filteredOnRent].sort((a, b) => {
    const aIsActive = a.isActive;
    const bIsActive = b.isActive;

    const aEditable =
      aIsActive && a.items.every((item) => item.qtyReturn === 0);
    const bEditable =
      bIsActive && b.items.every((item) => item.qtyReturn === 0);

    // Priority 1: Active before Inactive
    if (aIsActive !== bIsActive) {
      return aIsActive ? -1 : 1;
    }

    // Priority 2: Among active ones, editable first
    if (aEditable !== bEditable) {
      return aEditable ? -1 : 1;
    }

    // Priority 3: Sort by onRentDate (latest first)
    const dateA = new Date(a.onRentDate);
    const dateB = new Date(b.onRentDate);
    return dateB - dateA;
  });

  const paginatedOnRent = sortedOnRent.slice(startIndex, endIndex);

  return (
    <div className="container px-0 ">
      {showEditForm ? (
        <OnRentEditModal
          onRent={selectedOnRent}
          onSave={saveOnRent}
          onClose={() => setShowEditForm(false)}
          isSaving={isSaving}
        />
      ) : showDetails && selectedOnRent ? (
        <OnRentDetailsModal
          onRent={selectedOnRent}
          onClose={() => setShowDetails(false)}
        />
      ) : (
        <>
          <div className="d-flex justify-content-between mb-2">
            <h4>On Rent Transactions</h4>
            <button
              className="btn animated-btn"
              onClick={() => {
                setSelectedOnRent(null);
                setShowEditForm(true);
              }}
            >
              <span> +Add On Rent</span>
            </button>
          </div>
          <div className="d-flex justify-content-end mb-2">
            <input
              type="text"
              className="form-control shadow-sm "
              style={{ width: "250px" }}
              placeholder="Search On Rent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-responsive" style={{ minHeight: "395px" }}>
            <table className="table table-sm table-bordered shadow-sm text-center">
              <thead className="table-light">
                <tr>
                  <th>Sr No.</th>
                  <th>On Rent No.</th>
                  <th>On Rent Date</th>
                  <th>Customer Name</th>
                  <th>Created By</th>
                  <th>Created At</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOnRent.length > 0 ? (
                  paginatedOnRent.map((onRentItem, index) => (
                    <tr key={onRentItem.onRentNo}>
                      <td>{index + 1}</td>
                      <td>{onRentItem.onRentNo}</td>
                      <td>
                        {new Date(onRentItem.onRentDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>

                      <td>{onRentItem.customer.customerName}</td>
                      <td>{onRentItem.createdBy}</td>
                      <td>
                        {new Date(onRentItem.createdAt).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            onRentItem.isActive ? "bg-success" : "bg-danger"
                          }`}
                        >
                          {onRentItem.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center">
                          <button
                            className="btn btn-outline-info btn-sm me-2"
                            onClick={() => {
                              setSelectedOnRent(onRentItem);
                              setShowDetails(true);
                            }}
                          >
                            <FaEye />
                          </button>
                          {onRentItem.isActive &&
                            onRentItem.items.every(
                              (item) => item.qtyReturn === 0
                            ) && (
                              <button
                                className="btn btn-outline-warning btn-sm me-2"
                                onClick={() => {
                                  onRentItem.items.forEach((item, i) =>
                                    console.log(
                                      `Item ${i + 1} qtyReturn:`,
                                      item.qtyReturn
                                    )
                                  );
                                  setSelectedOnRent(onRentItem);
                                  setShowEditForm(true);
                                }}
                              >
                                <FaEdit />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No On Rent records found
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

export default OnRent;
