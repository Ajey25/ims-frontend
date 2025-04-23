import { useState, useEffect } from "react";
import CustomerEditModal from "../../components/CustomerEditModal";
import CustomerDetailsModal from "../../components/CustomerDetailsModal";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import Pagination from "../../components/Pagination";

const CustomerMaster = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default for large screens

  useEffect(() => {
    const updateRowsPerPage = () => {
      if (window.innerWidth <= 768) {
        setRowsPerPage(10); // Increase rows for mobile
      } else {
        setRowsPerPage(10); // Default for larger screens
      }
    };

    updateRowsPerPage();
    window.addEventListener("resize", updateRowsPerPage);

    return () => window.removeEventListener("resize", updateRowsPerPage);
  }, []);
  // 📌 Fetch customers from API
  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/customerMaster`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async (newCustomer) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/customerMaster`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newCustomer),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add customer");
      }

      fetchCustomers();
      setShowEditForm(false);
      toast.success("Customer added successfully");
    } catch (error) {
      console.error("Error adding customer:", error);
      // alert("failed to add customer ,maybe gmail is already used ");
      // setShowEditForm(true);
      toast.error("failed to add customer ,maybe gmail is already used ");
    } finally {
      setIsSaving(false);
      console.log("Saving state reset");
      // this ALWAYS runs, rain or shine
    }
  };

  const handleEditCustomer = async (updatedCustomer) => {
    setIsSaving(true);

    try {
      const customerId = updatedCustomer.id;
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/customerMaster/${customerId}`,

        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedCustomer),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update customer");
      }

      fetchCustomers();
      setShowEditForm(false);
      setSelectedCustomer(null);
      toast.success("Customer updated successfully");
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("failed to update customer ,maybe gmail is already used ");
    } finally {
      setIsSaving(false);
      console.log("Saving state reset");
      // this ALWAYS runs, rain or shine
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/customerMaster/${customerId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };
  const handleToggleStatus = async (customerId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/customerMaster/${customerId}/toggle-status`,

        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to toggle item status");
      }
      fetchCustomers();
      toast.success("Customer status updated successfully");
    } catch (error) {
      console.error("Error toggling item status:", error);
      toast.error("Failed to toggle customer status");
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobile.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.gst &&
        customer.gst.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.pan &&
        customer.pan.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedCustomers = filteredCustomers
    .reverse()
    .slice(startIndex, endIndex);

  if (showEditForm) {
    return (
      <CustomerEditModal
        customer={selectedCustomer}
        onSave={selectedCustomer ? handleEditCustomer : handleAddCustomer}
        onClose={() => {
          setShowEditForm(false);
          setSelectedCustomer(null);
        }}
        isSaving={isSaving}
      />
    );
  }

  if (showDetailsView && selectedCustomer) {
    return (
      <CustomerDetailsModal
        customer={selectedCustomer}
        onClose={() => {
          setShowDetailsView(false);
          setSelectedCustomer(null);
        }}
      />
    );
  }

  return (
    <div className="responsive-container px-0">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4>Customer Master</h4>
        <button
          className="btn animated-btn"
          onClick={() => {
            setSelectedCustomer(null);
            setShowEditForm(true);
          }}
        >
          <span>+Add Customer</span>
        </button>
      </div>

      <div className="d-flex justify-content-end mb-2">
        <input
          type="text"
          className="form-control"
          style={{ width: "250px" }}
          placeholder="Search Customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-responsive" style={{ minHeight: "395px" }}>
        <table className="table table-sm table-bordered table-striped text-center">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>GST</th>
              <th>PAN</th>
              <th>Created By</th>
              <th>Status</th>
              <th style={{ width: "10rem" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((customer, index) => (
                <tr key={customer.id}>
                  <td>{index + 1}</td>
                  <td>{customer.customerName}</td>
                  <td>{customer.email}</td>
                  <td>{customer.mobile}</td>
                  <td>{customer.gst}</td>
                  <td>{customer.pan}</td>
                  <td>{customer.createdBy}</td>
                  <td>
                    <span
                      className={`badge ${
                        customer.isActive ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {customer.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowDetailsView(true);
                        }}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn btn-outline-warning btn-sm me-2"
                        onClick={() => {
                          setSelectedCustomer(customer);
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
                <td colSpan="8" className="text-center">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

export default CustomerMaster;
