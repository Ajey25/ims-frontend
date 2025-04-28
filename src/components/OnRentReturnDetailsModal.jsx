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
    <div className="container mt-2">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3 className="fw-bold">Return Details</h3>
        <button className="btn btn-secondary" onClick={onClose}>
          Back
        </button>
      </div>

      {/* Details Section */}
      <div className="row">
        {/* Return Details */}
        <div className="col-12 col-md-6">
          <div className="card shadow-lg mb-3" style={{ minWidth: "300px" }}>
            <div className="card-body" style={{ minHeight: "195px" }}>
              <h5 className="card-title text-primary">Return Details</h5>
              <div className="row">
                {[
                  { label: "Return No", value: orr.onRentReturnNo },
                  {
                    label: "Return Date",
                    value: new Date(orr.onRentReturnDate).toLocaleDateString(
                      "en-GB"
                    ),
                  },
                  {
                    label: "Customer",
                    value: orr.customers?.customerName || "N/A",
                  },
                  {
                    label: "Status",
                    value: (
                      <span
                        className={`badge ${
                          orr.isReturnCompleted
                            ? "bg-success"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {orr.isReturnCompleted ? "Completed" : "Pending"}
                      </span>
                    ),
                  },
                ].map(({ label, value }, index) => (
                  <div className="col-12 col-sm-6 mb-3" key={index}>
                    <div className="d-flex flex-wrap">
                      <div
                        className="fw-semibold"
                        style={{
                          minWidth: "100px",
                        }}
                      >
                        {label}
                      </div>
                      <div style={{ minWidth: "5px" }}>
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

        {/* Vehicle Details */}
        <div className="col-12 col-md-6">
          <div className="card shadow-lg mb-2" style={{ minWidth: "300px" }}>
            <div className="card-body" style={{ minHeight: "195px" }}>
              <h5 className="card-title text-primary">Vehicle Details</h5>
              <div className="row">
                {[
                  { label: "Vehicle Name", value: orr.vehicleName || "N/A" },
                  { label: "Vehicle No", value: orr.vehicleNo || "N/A" },
                  { label: "Driver Name", value: orr.driverName || "N/A" },
                  { label: "Driver Mobile", value: orr.mobileNo || "N/A" },
                ].map(({ label, value }, index) => (
                  <div className="col-12 col-sm-6 mb-3" key={index}>
                    <div className="d-flex flex-wrap">
                      <div
                        className="fw-semibold"
                        style={{
                          minWidth: "110px",
                        }}
                      >
                        {label}
                      </div>
                      <div style={{ minWidth: "5px" }}>
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
      </div>

      {/* Payment Summary */}
      <div className="row ">
        <div className="col-md-4">
          <div className="card text-center shadow-sm bg-light">
            <div className="card-body shadow-lg">
              <h6 className="fw-bold">Total Amount</h6>
              <p className="h4 text-primary">
                ₹{(orr.totalAmount || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-lg bg-light">
            <div className="card-body">
              <h6 className="fw-bold">Paid Amount</h6>
              <p className="h4 text-success">
                ₹{(orr.paidAmount || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-lg bg-light">
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
      <div className="card mt-3 shadow-lg">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Returned Items</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-sm text-center text-sm">
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
                          import.meta.env.VITE_API_BASE_URL2
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
