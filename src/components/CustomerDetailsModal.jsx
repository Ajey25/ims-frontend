import React from "react";
import PropTypes from "prop-types";

const CustomerDetailsModal = ({ customer, onClose }) => {
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
    </div>
  );
};

CustomerDetailsModal.propTypes = {
  customer: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CustomerDetailsModal;
