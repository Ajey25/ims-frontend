import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "react-bootstrap";
import axios from "axios";

const OnRentReturnDetailsModal = ({ orr, onClose }) => {
  const [onRentData, setOnRentData] = useState([]);
  const [uoms, setUoms] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/uom`)
      .then((res) => setUoms(res.data))
      .catch((err) => console.error("UOM fetch failed", err));
  }, []);
  const getUOMName = (uomId) => {
    const found = uoms.find((u) => u.id === uomId);
    return found ? found.uom : "N/A";
  };

  useEffect(() => {
    const fetchOnRentData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/onRent`
        );
        setOnRentData(response.data);
      } catch (error) {
        console.error("Error fetching onRent data:", error);
      }
    };

    fetchOnRentData();
  }, []);

  if (!orr) return null;

  const getOnRentNo = (onRentId) => {
    const onRent = onRentData.find((rent) => rent.onRentNo === onRentId);

    return onRent ? onRent.onRentNo : "N/A";
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold">Return Details</h3>
        <button className="btn btn-outline-secondary" onClick={onClose}>
          Close
        </button>
      </div>

      {/* Details Section */}
      <div className="row">
        {/* Return Details */}
        <div className="col-md-6">
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h5 className="card-title text-primary">Return Details</h5>
              <div className="row">
                <div className="col-6">
                  <small className="text-muted">Return No:</small>
                  <p className="fw-semibold">{orr.onRentReturnNo}</p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Return Date:</small>
                  <p className="fw-semibold">
                    {new Date(orr.onRentReturnDate).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Customer Name:</small>
                  <p className="fw-semibold">{orr.customers?.customerName}</p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Payment Status:</small>
                  <p className="fw-semibold">
                    <span
                      className={`badge ${
                        orr.isReturnCompleted
                          ? "bg-success"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {orr.isReturnCompleted ? "Completed" : "Pending"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Vehicle Details */}
        <div className="col-md-6">
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h5 className="card-title text-primary">Vehicle Details</h5>
              <div className="row">
                <div className="col-6">
                  <small className="text-muted">Vehicle Name:</small>
                  <p className="fw-semibold">{orr.vehicleName || "N/A"}</p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Vehicle No:</small>
                  <p className="fw-semibold">{orr.vehicleNo || "N/A"}</p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Driver Name:</small>
                  <p className="fw-semibold">{orr.driverName || "N/A"}</p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Driver Mobile:</small>
                  <p className="fw-semibold">{orr.mobileNo || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="row">
        <div className="col-md-4">
          <div className="card text-center shadow-sm bg-light">
            <div className="card-body">
              <h6 className="fw-bold">Total Amount</h6>
              <p className="h4 text-primary">
                ₹{(orr.totalAmount || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm bg-light">
            <div className="card-body">
              <h6 className="fw-bold">Paid Amount</h6>
              <p className="h4 text-success">
                ₹{(orr.paidAmount || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm bg-light">
            <div className="card-body">
              <h6 className="fw-bold">Balance Amount</h6>
              <p className="h4 text-danger">
                ₹{(orr.balanceAmount || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Returned Items Table */}
      <div className="card mt-4 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Returned Items</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>On Rent No</th>
                  <th>On Rent Date</th>
                  <th>Item Name</th>
                  <th>UOM</th>
                  <th>Total Qty</th>
                  <th>Return Qty</th>
                  <th>Per Day Rate</th>
                  <th>Used Days</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {orr.OnRentReturnItems.map((item, index) => (
                  <tr key={index}>
                    <td
                      style={{
                        cursor: "pointer",
                        color: "blue",
                        textDecoration: "underline",
                      }}
                      onClick={() => {
                        const url = `${
                          import.meta.env.VITE_API_BASE_URL
                        }/app/transactions/onrent?onRentNo=${getOnRentNo(
                          item.onRentNo
                        )}`;
                        window.open(url, "_blank");
                      }}
                    >
                      {getOnRentNo(item.onRentNo)}
                    </td>

                    <td>{new Date(item.onRentDate).toLocaleDateString()}</td>
                    <td>{item.itemName}</td>
                    <td>{getUOMName(item.uomId)}</td>
                    <td>{item.qtyOrWeight}</td>
                    <td>{item.qtyReturn}</td>
                    <td>₹{item.perDayRate}</td>
                    <td>{item.usedDays}</td>
                    <td className="fw-bold">₹{item.amount}</td>
                  </tr>
                ))}
                <tr className="table-light">
                  <td colSpan="8" className="text-end">
                    <strong>Total Amount:</strong>
                  </td>
                  <td className="fw-bold text-primary">₹{orr.totalAmount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

OnRentReturnDetailsModal.propTypes = {
  orr: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default OnRentReturnDetailsModal;
