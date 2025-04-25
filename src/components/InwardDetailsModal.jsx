import React from "react";
import PropTypes from "prop-types";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Table } from "react-bootstrap";
import PdfImage from "../assets/pdf-icon.png";

const InwardDetailsModal = ({ inward, itemMap, onClose }) => {
  if (!inward) return null;
  const handleOpenAttachment = (base64Data, mimeType = "image/jpeg") => {
    const byteString = atob(base64Data.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
  };
  const openBase64InNewTab = (base64DataUrl) => {
    const mime = base64DataUrl.match(/data:([^;]+);/)[1]; // gets mime type
    const byteString = atob(base64DataUrl.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mime });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
  };

  return (
    <div className="container mt-4">
      <div>
        <div className="d-flex justify-content-between mb-3">
          <h3>Inward Details</h3>
          <button className="btn btn-secondary" onClick={onClose}>
            Back
          </button>
        </div>

        <div className="card p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start">
            {/* Left Section (Inward Details) */}
            <div className="">
              <table className="table table-borderless">
                <tbody>
                  {[
                    { label: "Inward No", value: inward.inwardNo },
                    {
                      label: "Inward Date",
                      value: new Date(inward.inwardDate).toLocaleDateString(
                        "en-GB"
                      ),
                    },
                    { label: "Total Amount", value: `₹${inward.totalAmount}` },
                    { label: "Created By", value: inward.createdBy },
                    {
                      label: "Created At",
                      value: new Date(inward.createdAt).toLocaleDateString(
                        "en-GB"
                      ),
                    },
                  ].map(({ label, value }, index) => (
                    <tr key={index}>
                      <td style={{ minWidth: "130px", fontWeight: "bold" }}>
                        {label}
                      </td>
                      <td style={{ minWidth: "10px" }}>
                        <strong>:</strong>
                      </td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right Section (Attachment) */}
            {inward.attachment && (
              <div className="mt-3 mt-md-1 mx-5">
                <label className="form-label">
                  <strong>Attachment:</strong>
                </label>
                <div>
                  {inward.attachment.startsWith("data:application/pdf") ? (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        openBase64InNewTab(inward.attachment);
                      }}
                    >
                      <img
                        src={
                          inward.attachment.startsWith("data:application/pdf")
                            ? PdfImage
                            : inward.attachment
                        }
                        alt="Attachment"
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
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenAttachment(
                          inward.attachment,
                          inward.attachment.startsWith("data:application/pdf")
                            ? "application/pdf"
                            : "image/jpeg"
                        );
                      }}
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

        <div className="card mt-4 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Inward Items</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive " style={{ overflowX: "auto" }}>
              <Table className="table shadow-sm  table-hover ">
                <thead className="table-light">
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
