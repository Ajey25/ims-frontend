import React from "react";
import PropTypes from "prop-types";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Table } from "react-bootstrap";
import PdfImage from "../assets/pdf-icon.png";

const InwardDetailsModal = ({ inward, itemMap, onClose }) => {
  if (!inward) return null;

  return (
    <div className="container mt-4">
      <div>
        <div className="d-flex justify-content-between mb-3">
          <h3>Inward Details</h3>
          <button className="btn btn-outline-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="card p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start">
            {/* Left Section (Inward Details) */}
            <div className="">
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <td>
                      <strong>Inward No:</strong>
                    </td>
                    <td>{inward.inwardNo}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Inward Date:</strong>
                    </td>
                    <td>
                      {new Date(inward.inwardDate).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Total Amount:</strong>
                    </td>
                    <td>₹{inward.totalAmount}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Created By:</strong>
                    </td>
                    <td>{inward.createdBy}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Created By:</strong>
                    </td>
                    <td>
                      {" "}
                      {new Date(inward.createdAt).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right Section (Attachment) */}
            {inward.attachment && (
              <div className="mt-3 mt-md-0">
                <label className="form-label">
                  <strong>Attachment:</strong>
                </label>
                <div>
                  {inward.attachment.startsWith("data:application/pdf") ? (
                    <a
                      href={inward.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={PdfImage}
                        alt="PDF Attachment"
                        className="img-fluid rounded"
                        style={{
                          maxWidth: "100px",
                          maxHeight: "100px",
                          cursor: "pointer",
                        }}
                      />
                    </a>
                  ) : (
                    <a
                      href={inward.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={inward.attachment}
                        alt="Attachment"
                        className="img-fluid rounded"
                        style={{
                          maxWidth: "100px",
                          maxHeight: "100px",
                          cursor: "pointer",
                        }}
                      />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Responsive Table with Horizontal Scroll */}
        <div className="table-responsive mt-3" style={{ overflowX: "auto" }}>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>UOM</th>
                <th>Quantity</th>
                <th>Weight</th>
                <th>Unit Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {inward?.inwardItems?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <strong>{itemMap[item.item] || item.itemName}</strong>
                  </td>
                  <td>{item.UOMDetails?.uom}</td>
                  <td>{item.qty}</td>
                  <td>{item.weight}</td>
                  <td>{item.rate}</td>
                  <td>₹{item.totalAmount}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="5" className="text-end">
                  <strong>Total Amount:</strong>
                </td>
                <td>
                  <strong>₹{inward.totalAmount}</strong>
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

InwardDetailsModal.propTypes = {
  inward: PropTypes.object,
  itemMap: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default InwardDetailsModal;
