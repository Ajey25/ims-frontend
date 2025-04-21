import React from "react";
import PropTypes from "prop-types";

const ItemDetailsPopup = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h3>Item Details</h3>
        <button className="btn btn-outline-secondary" onClick={onClose}>
          Back to List
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <strong>Item Name:</strong>
              <p className="mt-1">{item.itemName}</p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>Item Code:</strong>
              <p className="mt-1">{item.itemCode}</p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>Description:</strong>
              <p className="mt-1">{item.description}</p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>Created By:</strong>
              <p className="mt-1">{item.createdBy}</p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>Created At:</strong>
              <p className="mt-1">
                {" "}
                {new Date(item.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>Status:</strong>
              <p className="mt-1">{item.isActive ? "Active" : "Inactive"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ItemDetailsPopup.propTypes = {
  item: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ItemDetailsPopup;
