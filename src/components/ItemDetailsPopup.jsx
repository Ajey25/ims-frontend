import React from "react";
import PropTypes from "prop-types";

const ItemDetailsPopup = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="">
      <div className="container mt-4 pb-4">
        <div className="d-flex justify-content-between mb-3">
          <h3>Item Details</h3>
          <button className="btn btn-secondary" onClick={onClose}>
            Back
          </button>
        </div>

        <div className="card box-shadow shadow-sm">
          <div className="card-body">
            <div className="row">
              {[
                { label: "Item Name", value: item.itemName },
                { label: "Item Code", value: item.itemCode },
                { label: "Description", value: item.description },
                { label: "Created By", value: item.createdBy },
                {
                  label: "Created At",
                  value: new Date(item.createdAt).toLocaleDateString("en-GB"),
                },
                {
                  label: "Status",
                  value: item.isActive ? "Active" : "Inactive",
                },
              ].map(({ label, value }, index) => (
                <div className="col-md-6 mb-4" key={index}>
                  <div className="d-flex">
                    <div style={{ minWidth: "100px", fontWeight: "bold" }}>
                      {label}
                    </div>
                    <div style={{ minWidth: "10px", fontWeight: "bold" }}>
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
  );
};

ItemDetailsPopup.propTypes = {
  item: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ItemDetailsPopup;
