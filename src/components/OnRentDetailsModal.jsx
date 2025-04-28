import React from "react";
import { Card, Button } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";

const OnRentDetailsView = ({ onRent, onClose }) => {
  if (!onRent) return null;

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mt-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>On Rent Details - {onRent.onRentNo}</h3>
        <button className="btn btn-secondary" onClick={onClose}>
          Back
        </button>
      </div>

      <div className="row">
        {/* Return Details */}
        <div className="col-12 col-md-6">
          <div className="card shadow-lg mb-2">
            <div className="card-body" style={{ minHeight: "180px" }}>
              <h5 className="card-title text-primary">Return Details</h5>
              <div className="row">
                {[
                  { label: "Return No", value: onRent.onRentNo },
                  {
                    label: "Return Date",
                    value: new Date(onRent.onRentDate).toLocaleDateString(
                      "en-GB"
                    ),
                  },
                  {
                    label: "Customer",
                    value: onRent.customer?.customerName || "N/A",
                  },
                  {
                    label: "Status",
                    value: (
                      <span
                        className={`badge ${
                          onRent.isReturnCompleted
                            ? "bg-success"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {onRent.isReturnCompleted ? "Completed" : "Pending"}
                      </span>
                    ),
                  },
                ].map(({ label, value }, index) => (
                  <div className="col-12 col-sm-6 mb-2" key={index}>
                    <div className="d-flex flex-wrap">
                      <div
                        className="fw-semibold me-1"
                        style={{ minWidth: "100px" }}
                      >
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

        {/* Vehicle Details */}
        <div className="col-12 col-md-6">
          <div className="card shadow-lg mb-2">
            <div className="card-body" style={{ minHeight: "180px" }}>
              <h5 className="card-title text-primary">Vehicle Details</h5>
              <div className="row">
                {[
                  { label: "Vehicle Name", value: onRent.vehicleName || "N/A" },
                  { label: "Vehicle No", value: onRent.vehicleNo || "N/A" },
                  { label: "Driver Name", value: onRent.driverName || "N/A" },
                  { label: "Driver Mobile", value: onRent.mobileNo || "N/A" },
                ].map(({ label, value }, index) => (
                  <div className="col-12 col-sm-6 mb-2" key={index}>
                    <div className="d-flex flex-wrap">
                      <div
                        className="fw-semibold me-1"
                        style={{ minWidth: "105px" }}
                      >
                        {label}
                      </div>
                      <div style={{ minWidth: "1px" }}>
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

      <div className="card mt-2 shadow-lg">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Items on Rent</h5>
        </div>
        <div>
          {" "}
          <div className="table-responsive">
            <table className="table table-sm table-hover text-center text-sm">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Item Name</th>
                  <th>UOM</th>
                  <th>Qty/Wt</th>
                  <th>Per Day Rate</th>
                  <th>Return Date</th>

                  <th>Remaining Qty</th>
                  <th>Qty Returned</th>
                  <th>Used Days</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {onRent.items && onRent.items.length > 0 ? (
                  onRent.items.map((item, index) => {
                    const rentStartDate = new Date(onRent.onRentDate);
                    const returnDate = new Date(
                      item.onRentReturnDate || new Date()
                    );

                    // Calculate Used Days (Difference in days)
                    const usedDays = Math.max(
                      Math.ceil(
                        (returnDate - rentStartDate) / (1000 * 60 * 60 * 24)
                      ),
                      1
                    );

                    // Calculate Amount
                    const amount =
                      usedDays * item.qtyOrWeight * item.perDayRate;

                    return (
                      <tr key={item._id || index}>
                        <td>{index + 1}</td>
                        <td>{item.itemName}</td>
                        <td>{item.uom?.uom || "N/A"}</td>
                        <td>{item.qtyOrWeight}</td>
                        <td>₹{item.perDayRate}</td>
                        <td>
                          {formatDate(
                            item.onRentReturnDate || new Date().toISOString()
                          )}
                        </td>

                        <td>{item.remainingQty}</td>
                        <td>{item.qtyReturn}</td>
                        <td>{usedDays}</td>
                        <td>₹{amount.toFixed(2)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center">
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Footer - Calculate Total Amount */}
              <tfoot className="table-light">
                <tr>
                  <td colSpan="9" className="text-end">
                    <strong>Total Amount:</strong>
                  </td>
                  <td className="">
                    <strong>
                      ₹
                      {onRent.items
                        ?.reduce((total, item) => {
                          const rentStartDate = new Date(onRent.onRentDate);
                          const returnDate = new Date(
                            item.onRentReturnDate || new Date()
                          );
                          const usedDays = Math.max(
                            Math.ceil(
                              (returnDate - rentStartDate) /
                                (1000 * 60 * 60 * 24)
                            ),
                            1
                          );
                          const amount =
                            usedDays * item.qtyOrWeight * item.perDayRate;
                          return total + amount;
                        }, 0)
                        .toFixed(2)}
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnRentDetailsView;
