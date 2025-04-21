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
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>On Rent Details - {onRent.onRentNo}</h3>
        <button className="btn btn-outline-secondary" onClick={onClose}>
          close
        </button>
      </div>

      <div className="row">
        {/* Return Details */}
        <div className="col-md-6">
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h5 className="card-title text-primary">Return Details</h5>
              <div className="row">
                {/* First Row */}
                <div className="col-6">
                  <small className="text-muted">Return No:</small>
                  <p className="fw-semibold">{onRent.onRentNo}</p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Return Date:</small>
                  <p className="fw-semibold">
                    {new Date(onRent.onRentDate).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
              <div className="row">
                {/* Second Row */}
                <div className="col-6">
                  <small className="text-muted">Customer Name:</small>
                  <p className="fw-semibold">
                    {onRent.customer?.customerName || "N/A"}
                  </p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Payment Status:</small>
                  <p className="fw-semibold">
                    <span
                      className={`badge ${
                        onRent.isReturnCompleted
                          ? "bg-success"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {onRent.isReturnCompleted ? "Completed" : "Pending"}
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
                {/* First Row */}
                <div className="col-6">
                  <small className="text-muted">Vehicle Name:</small>
                  <p className="fw-semibold">{onRent.vehicleName || "N/A"}</p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Vehicle No:</small>
                  <p className="fw-semibold">{onRent.vehicleNo || "N/A"}</p>
                </div>
              </div>
              <div className="row">
                {/* Second Row */}
                <div className="col-6">
                  <small className="text-muted">Driver Name:</small>
                  <p className="fw-semibold">{onRent.driverName || "N/A"}</p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Driver Mobile:</small>
                  <p className="fw-semibold">{onRent.mobileNo || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h5 className="mb-0">Items on Rent</h5>
        <div className="table-responsive">
          <table className="table table-bordered table-hover text-center">
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
                  const amount = usedDays * item.qtyOrWeight * item.perDayRate;

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
                <td className="text-end">
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
                            (returnDate - rentStartDate) / (1000 * 60 * 60 * 24)
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

      <div className="d-flex justify-content-end mb-4">
        <Button variant="secondary" onClick={onClose}>
          Back
        </Button>
      </div>
    </div>
  );
};

export default OnRentDetailsView;
