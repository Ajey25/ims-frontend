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
        `${import.meta.env.VITE_API_BASE_URL}/customerMaster/${customerId}`
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
        <button className="btn btn-secondary" onClick={onClose}>
          Back
        </button>
      </div>

      <div className="card shadow-sm mb-4 text-break">
        <div className="card-body">
          <div className="row g-3">
            {[
              { label: "Payment ID", value: payment.id },
              { label: "Customer", value: customerName },
              {
                label: "Paid Amount",
                value: `₹${payment.paidAmount.toFixed(2)}`,
              },
              {
                label: "Payment Date",
                value: new Date(payment.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
              { label: "Payment Type", value: payment.paymentType },
              { label: "Created By", value: payment.createdBy },
            ].map(({ label, value }, idx) => (
              <div className="col-md-6" key={idx}>
                <div className="d-flex">
                  <div style={{ minWidth: "130px" }} className="fw-bold">
                    {label}
                  </div>
                  <div style={{ minWidth: "10px" }}>
                    <strong>:</strong>
                  </div>
                  <div className=" ms-2">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white ">
          <h5 className="mb-0">Allocated Returns</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive px-0">
            <table className="table table-sm shadow-sm">
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

                        const url = `${
                          import.meta.env.VITE_API_BASE_URL2
                        }/app/transactions/onrentreturn?returnNumber=${
                          ret.returnNumber
                        }`;
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
