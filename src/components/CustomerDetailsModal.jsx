import React from "react";
import PropTypes from "prop-types";

const CustomerDetailsModal = ({ customer, onClose }) => {
  if (!customer) return null;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h3>Customer Details</h3>
        <button className="btn btn-outline-secondary" onClick={onClose}>
          Back to List
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <strong>Customer Name:</strong>
              <p className="mt-1">{customer.customerName}</p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>Email:</strong>
              <p className="mt-1">{customer.email}</p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>Mobile:</strong>
              <p className="mt-1">{customer.mobile}</p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>GST:</strong>
              <p className="mt-1">{customer.gst || "Not Provided"}</p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>PAN:</strong>
              <p className="mt-1">{customer.pan || "Not Provided"}</p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>Address:</strong>
              <p className="mt-1">{customer.address || "Not Provided"}</p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>Created By:</strong>
              <p className="mt-1">{customer.createdBy || "Not Provided"}</p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>Created At:</strong>
              <p className="mt-1">
                {" "}
                {new Date(customer.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>Status:</strong>
              <p className="mt-1">
                {customer.isActive ? "Active" : "Inactive"}
              </p>
            </div>
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
