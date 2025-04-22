import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "react-bootstrap";
import axios from "axios";

const PaymentDetails = ({ payment, onClose }) => {
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    if (payment && payment.customerId) {
      fetchCustomerName(payment.customerId);
    }
  }, [payment]);

  const fetchCustomerName = async (customerId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}customerMaster/${customerId}`
      );
      setCustomerName(response.data.customerName);
    } catch (error) {
      console.error("Error fetching customer name:", error);
      setCustomerName("N/A");
    }
  };

  if (!payment) return null;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h3>Payment Details</h3>
        <button className="btn btn-outline-secondary" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Payment ID</label>
              <p className="text-muted">{payment.id}</p>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Customer Name</label>
              <p className="text-muted">{customerName}</p>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Paid Amount</label>
              <p className="text-muted">₹{payment.paidAmount.toFixed(2)}</p>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Payment Date</label>
              <p className="text-muted">
                {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Payment Type</label>
              <p className="text-muted">{payment.paymentType}</p>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Created By</label>
              <p className="text-muted">{payment.createdBy}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Allocated Returns</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive mobile-table-container px-0">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>Return No.</th>
                  <th>Allocated Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payment.allocatedReturns.map((ret) => (
                  <tr key={ret.PaymentId}>
                    <td
                      style={{
                        cursor: "pointer",
                        color: "blue",
                        textDecoration: "underline",
                      }}
                      onClick={() => {
                        if (!ret?.returnNumber) {
                          console.warn(
                            "returnNumber is missing, cannot open new tab"
                          );
                          return;
                        }

                        const url = `http://localhost:5173/app/transactions/onrentreturn?returnNumber=${ret.returnNumber}`;
                        window.open(url, "_blank");
                      }}
                    >
                      {ret.returnNumber}
                    </td>
                    <td className="text-nowrap">
                      ₹{ret.allocatedAmount.toFixed(2)}
                    </td>
                    <td className="text-nowrap">
                      <span
                        className={`badge ${
                          ret.isReturnCompleted
                            ? "bg-success"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {ret.isReturnCompleted ? "Completed" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>
        {`
          @media (max-width: 768px) {
            .mobile-table-container {
              margin: 0 -1rem;
              padding: 0 1rem;
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
              scrollbar-width: thin;
            }

            .mobile-table-container::-webkit-scrollbar {
              height: 6px;
            }

            .mobile-table-container::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 4px;
            }

            .mobile-table-container::-webkit-scrollbar-thumb {
              background: #888;
              border-radius: 4px;
            }

            .table {
              min-width: unset !important;
              width: 100%;
            }

            .table td, .table th {
              padding: 8px;
              font-size: 14px;
              vertical-align: middle;
            }

            .badge {
              font-size: 12px;
              padding: 5px 8px;
            }

            .card-body {
              padding: 12px;
            }
          }
        `}
      </style>
    </div>
  );
};

PaymentDetails.propTypes = {
  payment: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PaymentDetails;
