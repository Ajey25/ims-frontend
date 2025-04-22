import { useState, useEffect } from "react";
import ItemDetailsPopup from "../../components/ItemDetailsPopup";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import ItemEditModal from "../../components/ItemEditModal";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import Pagination from "../../components/Pagination";

const ItemMaster = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailsView, setShowDetailsView] = useState(false);
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
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/itemMaster`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddItem = async (newItem) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/itemMaster`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newItem),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to add item");
      }
      fetchItems();
      setShowEditForm(false);
      toast.success("Item Added Successfully");
    } catch (error) {
      console.error("Error adding item:", error);
      // alert("Failed to add item, maybe item code is already used.");
      toast.warn("Failed to add item, item code is already being used.");
    }
  };

  const handleEditItem = async (updatedItem) => {
    try {
      const token = localStorage.getItem("token");

      const itemId = updatedItem.id;

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/itemMaster/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedItem),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update item");
      }
      fetchItems();
      setShowEditForm(false);
      setSelectedItem(null);
      toast.success("Item Edited Successfully");
    } catch (error) {
      console.error("Error updating item:", error);
      toast.warn("Failed to update item, item code is already being used.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/itemMaster/${itemId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete item");
      }
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleToggleStatus = async (itemId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/itemMaster/${itemId}/toggle-status`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to toggle item status");
      }
      fetchItems();
      toast.success("Item status toggled successfully");
    } catch (error) {
      console.error("Error toggling item status:", error);
      toast.error("Failed to toggle item status");
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedItems = filteredItems.reverse().slice(startIndex, endIndex);

  if (showEditForm) {
    return (
      <ItemEditModal
        item={selectedItem}
        onSave={selectedItem ? handleEditItem : handleAddItem}
        onClose={() => {
          setShowEditForm(false);
          setSelectedItem(null);
        }}
      />
    );
  }

  if (showDetailsView && selectedItem) {
    return (
      <ItemDetailsPopup
        item={selectedItem}
        onClose={() => {
          setShowDetailsView(false);
          setSelectedItem(null);
        }}
      />
    );
  }

  return (
    <div className="responsive-container px-0">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4>Item Master</h4>
        <button
          className="btn animated-btn"
          onClick={() => {
            setSelectedItem(null);
            setShowEditForm(true);
          }}
        >
          <span> Add Item</span>
        </button>
      </div>

      <div className="d-flex justify-content-end mb-3">
        <input
          type="text"
          className="form-control"
          style={{ width: "250px" }}
          placeholder="Search Item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-responsive" style={{ minHeight: "395px" }}>
        <table className="table table-sm table-bordered table-striped text-center">
          <thead className="table-dark">
            <tr>
              <th>Sr No.</th>
              <th>Item Name</th>
              <th>Item Code</th>
              <th>Description</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length > 0 ? (
              paginatedItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{startIndex + index + 1}</td>
                  <td>{item.itemName}</td>
                  <td>{item.itemCode}</td>
                  <td>{item.description}</td>
                  <td>
                    <span
                      className={`badge ${
                        item.isActive ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{item.createdBy}</td>
                  <td>
                    {new Date(item.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowDetailsView(true);
                        }}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn btn-outline-warning btn-sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowEditForm(true);
                        }}
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Responsive Pagination Margin */}
      <div className="pagination-container">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default ItemMaster;
