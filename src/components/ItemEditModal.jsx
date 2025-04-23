import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ToggleButton, ButtonGroup, Form } from "react-bootstrap";

const ItemEditModal = ({ item, onSave, onClose, isSaving }) => {
  const [itemName, setItemName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setItemName(item.itemName);
      setItemCode(item.itemCode);
      setDescription(item.description);
      setStatus(item.isActive ? "active" : "inactive");
    }
  }, [item]);

  const validate = () => {
    let tempErrors = {};
    const specialCharPattern = /[^a-zA-Z0-9 _-]/;

    if (!itemName.trim()) {
      tempErrors.itemName = "Item Name is required.";
    } else if (specialCharPattern.test(itemName)) {
      tempErrors.itemName = "Item Name should not contain special characters.";
    } else if (itemName.startsWith(" ")) {
      tempErrors.itemName = "Item Name should not start with a space.";
    }

    if (!itemCode.trim()) {
      tempErrors.itemCode = "Item Code is required.";
    } else if (specialCharPattern.test(itemCode)) {
      tempErrors.itemCode = "Item Code should not contain special characters.";
    } else if (itemCode.startsWith(" ")) {
      tempErrors.itemCode = "Item Code should not start with a space.";
    }

    if (!description.trim()) {
      tempErrors.description = "Description is required.";
    }

    if (!status) {
      tempErrors.status = "Status is required.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newItem = {
      id: item?.id,
      itemName,
      itemCode,
      description,
      isActive: status === "active",
    };
    onSave(newItem);
  };

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    if (/[^a-zA-Z0-9 _-]/.test(value)) return; // Prevent special characters
    setter(value);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h3>{item ? "Edit Item" : "Add Item"}</h3>
        <button className="btn btn-secondary" onClick={onClose}>
          Back
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className={`form-label ${item ? "text-muted" : ""}`}>
                  Item Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Please enter item name"
                  className={`form-control ${
                    errors.itemName ? "is-invalid" : ""
                  } ${item ? " bg-light text-secondary" : ""}`}
                  value={itemName}
                  onChange={handleInputChange(setItemName)}
                  readOnly={!!item}
                  disabled={!!item} // Disable input if item is being edited
                />

                {errors.itemName && (
                  <div className="invalid-feedback">{errors.itemName}</div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Item Code <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Please enter item code"
                  className={`form-control ${
                    errors.itemCode ? "is-invalid" : ""
                  }`}
                  value={itemCode}
                  onChange={handleInputChange(setItemCode)}
                />
                {errors.itemCode && (
                  <div className="invalid-feedback">{errors.itemCode}</div>
                )}
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">
                  Description <span className="text-danger">*</span>
                </label>
                <textarea
                  placeholder="Please enter item description"
                  className={`form-control ${
                    errors.description ? "is-invalid" : ""
                  }`}
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                {errors.description && (
                  <div className="invalid-feedback">{errors.description}</div>
                )}
              </div>
              <div className="col-12 mb-3">
                <label className="form-label d-block mb-2">Status*</label>

                <div
                  className="d-flex align-items-center rounded-pill px-2 py-1 text-white shadow-sm position-relative"
                  style={{
                    backgroundColor:
                      status === "active" ? "#28a745" : "#dc3545",
                    width: "110px",
                    height: "30px",
                    justifyContent: "space-between",
                    transition: "background-color 0.3s ease",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer", // Add pointer to indicate interaction
                  }}
                  onClick={() =>
                    setStatus(status === "active" ? "inactive" : "active")
                  } // Allow div click to toggle
                >
                  <span
                    className="position-absolute"
                    style={{ left: "10px", zIndex: 2 }}
                  >
                    {status === "active" ? "Active" : ""}
                  </span>

                  <span
                    className="position-absolute"
                    style={{ right: "10px", zIndex: 2 }}
                  >
                    {status === "inactive" ? "Inactive" : ""}
                  </span>

                  <div
                    className="position-absolute bg-white"
                    style={{
                      height: "26px",
                      width: "50px",
                      borderRadius: "40px",
                      top: "2px",
                      left: status === "active" ? "57px" : "3px",
                      transition: "left 0.4s",
                      zIndex: 1,
                    }}
                  ></div>

                  <Form.Check
                    type="switch"
                    id="custom-toggle-switch"
                    checked={status === "active"}
                    onChange={() =>
                      setStatus(status === "active" ? "inactive" : "active")
                    }
                    className="position-absolute w-100 h-100 opacity-0"
                    tabIndex="-1" // Prevent accidental focus on hidden input
                  />
                </div>

                {errors.status && (
                  <div className="invalid-feedback d-block mt-1">
                    {errors.status}
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving
                  ? item
                    ? "Updating..."
                    : "Saving..."
                  : item
                  ? "Update"
                  : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

ItemEditModal.propTypes = {
  item: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ItemEditModal;
