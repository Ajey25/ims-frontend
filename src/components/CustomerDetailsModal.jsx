import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Pagination from "./Pagination"; // Assuming the Pagination component is in the same directory

const CustomerDetailsModal = ({ customer, onClose }) => {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [pageSize] = useState(10); // 10 rows per page

  useEffect(() => {
    if (customer) {
      fetchCustomerCredits(customer.id);
    }
  }, [customer]);

  const fetchCustomerCredits = async (customerId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/customerCredit/all/`
      );
      const data = await response.json();

      // Filter credits by customerId to only show this customer's data
      const customerCredits = data.data.filter(
        (credit) => credit.customerId === customerId
      );
      setCredits(customerCredits);
    } catch (error) {
      console.error("Error fetching customer credits:", error);
    } finally {
      setLoading(false);
    }
  };

  // Slice the credits data to show only the credits for the current page
  const getPaginatedCredits = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return credits.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(credits.length / pageSize); // Calculate the total number of pages

  if (!customer) return null;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h3>Customer Details</h3>
        <button className="btn btn-secondary" onClick={onClose}>
          Back
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row">
            {[
              // Display customer details
              { label: "Customer Name", value: customer.customerName },
              { label: "Email", value: customer.email },
              { label: "Mobile", value: customer.mobile },
              { label: "GST", value: customer.gst || "Not Provided" },
              { label: "PAN", value: customer.pan || "Not Provided" },
              { label: "Address", value: customer.address || "Not Provided" },
              {
                label: "Created By",
                value: customer.createdBy || "Not Provided",
              },
              {
                label: "Created At",
                value: new Date(customer.createdAt).toLocaleDateString("en-GB"),
              },
              {
                label: "Status",
                value: customer.isActive ? "Active" : "Inactive",
              },
              {
                label: "Credit Available",
                value: customer.advanceCreditAmount || "0",
              },
            ].map(({ label, value }, index) => (
              <div className="col-md-6 mb-4" key={index}>
                <div className="d-flex">
                  <div style={{ minWidth: "130px", fontWeight: "bold" }}>
                    {label}
                  </div>
                  <div style={{ minWidth: "10px" }}>
                    <strong>:</strong>
                  </div>
                  <div className="ms-2">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Credits Table */}
      <div className="card mt-3">
        <div className="card-body">
          <h4 className="mb-3">Customer Credits</h4>

          {loading ? (
            <p>Loading credits...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-striped mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Sr.No</th>
                    <th>Payment Date</th>
                    <th>Payment Type</th>
                    <th>Amount</th>
                    <th>Created By</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedCredits().length > 0 ? (
                    getPaginatedCredits().map((credit, index) => (
                      <tr key={credit.id}>
                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                        <td>
                          {new Date(credit.paymentDate).toLocaleDateString(
                            "en-GB"
                          )}
                        </td>
                        <td>{credit.paymentType}</td>
                        <td>{credit.amount}</td>
                        <td>{credit.createdBy}</td>
                        <td>
                          {new Date(credit.createdAt).toLocaleDateString(
                            "en-GB"
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No credits found for this customer.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

CustomerDetailsModal.propTypes = {
  customer: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CustomerDetailsModal;
