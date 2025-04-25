import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Table, Dropdown, Form } from "react-bootstrap";
import axios from "axios";
import Pdf from "../assets/pdf-icon.png";
import { FaTimes } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const InwardEditModal = ({ inward, onSave, onClose, isSaving }) => {
  const [inwardNo, setInwardNo] = useState("");
  const [inwardDate, setInwardDate] = useState(new Date());

  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [itemOptions, setItemOptions] = useState([]);
  const [uomOptions, setUomOptions] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [base64File, setBase64File] = useState(null);
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoadingInwardNo, setIsLoadingInwardNo] = useState(false);

  const handleDateChange = (date) => {
    setInwardDate(date);
  };
  const handleDateChangeRaw = (e) => {
    const value = e.target.value;
    if (/^\d{8}$/.test(value)) {
      const day = value.slice(0, 2);
      const month = value.slice(2, 4);
      const year = value.slice(4);
      const date = new Date(`${year}-${month}-${day}`);
      setInwardDate(date);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/itemMaster`
        );
        setItemOptions(itemResponse.data);
        const uomResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/uom`
        );
        setUomOptions(uomResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoadingInwardNo(false);
      }
    };
    fetchData();
  }, [inward]);

  useEffect(() => {
    if (inward) {
      // Set inward date
      setInwardDate(
        inward.inwardDate
          ? new Date(inward.inwardDate).toISOString().split("T")[0]
          : ""
      );

      // Setup items array
      setItems(inward.items || []);
      setTotalAmount(inward.totalAmount || 0);

      // Handle attachment preview - fixed attachment handling
      if (inward.attachment) {
        setBase64File(inward.attachment);

        // Correctly set preview based on file type
        if (inward.attachment.startsWith("data:image")) {
          setPreview(inward.attachment);
        } else if (inward.attachment.startsWith("data:application/pdf")) {
          setPreview(Pdf);
        }
      } else {
        // Reset attachment states if no attachment
        setPreview(null);
        setBase64File(null);
      }

      // Create correct format for selectedItems
      const newSelectedItems = {};

      if (inward.inwardItems && Array.isArray(inward.inwardItems)) {
        inward.inwardItems.forEach((item) => {
          // Normalize itemId - this handles both string and ObjectId formats
          let itemId = item.itemId || item.itemid;
          if (itemId && typeof itemId === "object") {
            itemId = itemId._id || itemId.id || itemId.toString();
          }

          // Find the corresponding UOM ID from uomOptions
          const uomOption = uomOptions.find(
            (uom) => uom.uom === item.UOMDetails?.uom
          );
          const uomId = uomOption ? uomOption.id : "";

          // Add to selectedItems with consistent format
          newSelectedItems[itemId] = {
            name: item.itemName,
            qty: Number(item.qty) || 0,
            weight: Number(item.weight) || 0,
            rate: Number(item.rate) || 0,
            amount: Number(item.totalAmount) || 0,
            uom: uomId, // Use the UOM ID here
          };
        });

        setSelectedItems(newSelectedItems);
      }
    }
  }, [inward, uomOptions]); // Add uomOptions as a dependency

  const validate = () => {
    let tempErrors = {};

    // ✅ Validate Inward Date format (stored as yyyy-MM-dd)
    if (!inwardDate || isNaN(new Date(inwardDate).getTime())) {
      tempErrors.inwardDate = "Inward Date is invalid. Please use dd/mm/yyyy.";
    }

    // ✅ Validate Selected Items
    if (!selectedItems || Object.keys(selectedItems).length === 0) {
      tempErrors.items = "Please add at least one item.";
    } else {
      let hasItemErrors = false;
      let newItemErrors = {};

      Object.entries(selectedItems).forEach(([id, data]) => {
        let itemError = {};

        if (!data.uom) {
          itemError.uom = "UOM must be selected";
        }
        if (!data.qty || data.qty <= 0) {
          itemError.qty = "Quantity must be greater than 0";
        }
        if (!data.weight || data.weight <= 0) {
          itemError.weight = "Weight must be greater than 0";
        }
        if (!data.rate || data.rate < 0) {
          itemError.rate = "Unit Rate must be > 0";
        }

        if (Object.keys(itemError).length > 0) {
          hasItemErrors = true;
          newItemErrors[id] = itemError;
        }
      });

      if (hasItemErrors) tempErrors.itemErrors = newItemErrors;
    }

    // ✅ Validate Total Amount
    if (!totalAmount || totalAmount <= 0) {
      tempErrors.totalAmount = "Total amount must be > 0";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileType = selectedFile.type;
      if (fileType.startsWith("image/") || fileType === "application/pdf") {
        if (fileType.startsWith("image/")) {
          setPreview(URL.createObjectURL(selectedFile));
        } else {
          setPreview(Pdf);
        }
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onloadend = () => setBase64File(reader.result);
        setFile(selectedFile);
        setError("");
      } else {
        setError("Only images and PDFs are allowed.");
      }
    }
  };

  const handleSelectAll = () => {
    const newSelectedItems = {};
    if (!selectAll) {
      itemOptions
        .filter((item) => item.isActive)
        .forEach((item) => {
          newSelectedItems[item.id] = {
            name: item.itemName,
            qty: 0,
            weight: 0,
            rate: 0,
            amount: 0,
            uom: "",
          };
        });
    }
    setSelectedItems(newSelectedItems);
    setSelectAll(!selectAll);
    calculateTotalAmount(newSelectedItems);
  };

  const handleItemSelect = (id) => {
    const newSelectedItems = { ...selectedItems };
    if (newSelectedItems[id]) {
      delete newSelectedItems[id];
    } else {
      const item = itemOptions.find((item) => item.id === id);
      newSelectedItems[id] = {
        name: item.itemName,
        qty: 0,
        weight: 0,
        rate: 0,
        amount: 0,
        uom: "",
      };
    }
    setSelectedItems(newSelectedItems);
    calculateTotalAmount(newSelectedItems);
  };

  const handleInputChange = (id, field, value) => {
    const newSelectedItems = { ...selectedItems };
    newSelectedItems[id][field] = value;

    // Find selected UOM
    const selectedUomId = newSelectedItems[id].uom;
    const selectedUom = uomOptions.find((u) => {
      // Handle UOM ID comparison correctly
      const uomId =
        u.id && typeof u.id === "object" ? u.id.toString() : u.id.toString();
      return uomId === selectedUomId.toString();
    });

    const uomType = selectedUom?.uom; // Get the UOM type (e.g., "qty" or "weight")

    // Reset qty and weight if "Select UOM" is chosen
    if (!selectedUomId) {
      newSelectedItems[id].qty = "";
      newSelectedItems[id].weight = "";
      newSelectedItems[id].amount = 0;
    } else {
      // Calculate amount based on UOM type
      if (uomType === "qty") {
        newSelectedItems[id].amount =
          (newSelectedItems[id].qty || 0) * (newSelectedItems[id].rate || 0);
      } else if (uomType === "weight") {
        newSelectedItems[id].amount =
          (newSelectedItems[id].weight || 0) * (newSelectedItems[id].rate || 0);
      }
    }

    setSelectedItems(newSelectedItems);
    calculateTotalAmount(newSelectedItems);
  };

  // Improved UOM selection rendering
  const renderUomSelect = (id, currentUomId) => {
    return (
      <select
        className="form-control form-control-sm"
        value={currentUomId || ""}
        onChange={(e) => handleInputChange(id, "uom", e.target.value)}
      >
        <option value="">Select UOM</option>
        {uomOptions.map((uom) => {
          // Normalize UOM ID to string for comparison
          const uomId =
            uom.id && typeof uom.id === "object"
              ? uom.id.toString()
              : uom.id.toString();
          return (
            <option key={uomId} value={uomId}>
              {uom.uom}
            </option>
          );
        })}
      </select>
    );
  };

  const handleRemoveItem = (id) => {
    const newSelectedItems = { ...selectedItems };
    delete newSelectedItems[id];
    setSelectedItems(newSelectedItems);
    calculateTotalAmount(newSelectedItems);
  };

  const calculateTotalAmount = (items) => {
    const total = Object.values(items).reduce(
      (sum, item) => sum + item.amount,
      0
    );
    setTotalAmount(total);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const newInward = {
      _id: inward?.id, // Include the _id when editing
      inwardNo,
      inwardDate,
      attachment: base64File,
      items: Object.entries(selectedItems).map(([id, data]) => {
        // Create item objects with consistent property names
        return {
          itemId: id,
          itemName: data.name,
          qty: Number(data.qty),
          weight: Number(data.weight),
          rate: Number(data.rate),
          totalAmount: Number(data.amount),
          uom: data.uom,
        };
      }),
      totalAmount: Number(totalAmount),
    };

    onSave(newInward);
    onClose();
  };

  const filteredItemOptions = itemOptions.filter(
    (item) =>
      item.isActive &&
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h3>{inward ? "Edit Inward" : "Add Inward"}</h3>
        <button className="btn btn-secondary" onClick={onClose}>
          Back
        </button>
      </div>
      <form onSubmit={handleSubmit} className="card p-3">
        <div className="row mb-3">
          <div className="col-md-6">
            <div className="mb-3 ">
              <label className="form-label">Inward Date</label>
              <br />
              <DatePicker
                selected={inwardDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                className="form-control date"
                placeholderText="dd/mm/yyyy"
                onChangeRaw={handleDateChangeRaw}
              />

              <br />
              {errors.inwardDate && (
                <small className="text-danger">{errors.inwardDate}</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Total Amount</label>
              <input
                type="number"
                className="form-control"
                value={totalAmount}
                readOnly
              />
              {errors.totalAmount && (
                <small className="text-danger">{errors.totalAmount}</small>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Attachment</label>
              <input
                type="file"
                className="form-control"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
              />
              {error && <small className="text-danger">{error}</small>}
              {preview && (
                <div className="mt-2 mx-0">
                  <label className="form-label me-4">Preview</label>
                  {file?.type?.startsWith("image/") ||
                  base64File?.startsWith("data:image/") ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="img-thumbnail"
                      style={{ maxWidth: "150px", maxHeight: "100px" }}
                    />
                  ) : (
                    <div className="d-flex align-items-center">
                      <img
                        src={preview}
                        alt="PDF Preview"
                        className="img-thumbnail"
                        style={{
                          maxWidth: "100px",
                          maxHeight: "100px",
                          marginRight: "1rem",
                        }}
                      />
                      <a
                        href={file ? URL.createObjectURL(file) : base64File}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm mt-2"
                      >
                        View PDF
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Select Items</label>
          <div className="d-flex gap-2 align-items-center mb-2">
            <Dropdown>
              <Dropdown.Toggle variant="primary" id="dropdown-items">
                Select Items
              </Dropdown.Toggle>

              <Dropdown.Menu
                style={{
                  width: "250px",
                  padding: "10px",
                  height: "250px",
                  overflowY: "auto",
                }}
              >
                <Form.Control
                  type="text"
                  placeholder="Search Items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-2"
                />

                <div className="form-check mb-2">
                  <input
                    className="form-check-input custom-checkbox border-1 border-primary"
                    type="checkbox"
                    id="selectAll"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                  <label
                    className="form-check-label w-100"
                    htmlFor="selectAll"
                    style={{ cursor: "pointer" }}
                  >
                    Select All
                  </label>
                </div>

                <hr />

                {filteredItemOptions.map((item) => (
                  <div className="form-check" key={item.id}>
                    <input
                      className="form-check-input custom-checkbox border-1 border-primary"
                      type="checkbox"
                      id={`item-${item.id}`}
                      checked={!!selectedItems[item.id]}
                      onChange={() => handleItemSelect(item.id)}
                    />
                    <label
                      className="form-check-label w-100"
                      htmlFor={`item-${item.id}`}
                      style={{ cursor: "pointer" }}
                    >
                      {item.itemName}
                    </label>
                  </div>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
          {errors.items && typeof errors.items === "string" && (
            <small className="text-danger d-block">{errors.items}</small>
          )}
        </div>

        {Object.keys(selectedItems).length > 0 && (
          <div className="mb-3">
            <h5>Selected Items</h5>
            <div className="table-responsive">
              <table className="table table-sm shadow-sm table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Item Name</th>
                    <th>UOM</th>
                    <th>Quantity</th>
                    <th>Weight</th>
                    <th>Rate</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(selectedItems).map(([id, data]) => {
                    const itemError = errors.itemErrors?.[id] || {}; // Get specific item errors

                    // Condition to validate total amount only if qty and weight are valid
                    const showAmountError =
                      !itemError.qty && !itemError.weight && itemError.amount;

                    return (
                      <tr key={id}>
                        {/* Item Name */}
                        <td>{data.name}</td>

                        {/* UOM Dropdown */}
                        <td>
                          {renderUomSelect(id, data.uom)}
                          {itemError.uom && (
                            <div className="text-danger small mt-1">
                              {itemError.uom}
                            </div>
                          )}
                        </td>

                        {/* Quantity Input */}
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            min="0"
                            value={data.qty}
                            onChange={(e) =>
                              handleInputChange(
                                id,
                                "qty",
                                Number(e.target.value)
                              )
                            }
                          />
                          {itemError.qty && (
                            <div className="text-danger small mt-1">
                              {itemError.qty}
                            </div>
                          )}
                        </td>

                        {/* Weight Input */}
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            min="0"
                            value={data.weight}
                            onChange={(e) =>
                              handleInputChange(
                                id,
                                "weight",
                                Number(e.target.value)
                              )
                            }
                          />
                          {itemError.weight && (
                            <div className="text-danger small mt-1">
                              {itemError.weight}
                            </div>
                          )}
                        </td>

                        {/* Unit Rate Input */}
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={data.rate}
                            onChange={(e) =>
                              handleInputChange(
                                id,
                                "rate",
                                Number(e.target.value)
                              )
                            }
                          />
                          {itemError.rate && (
                            <div className="text-danger small mt-1">
                              {itemError.rate}
                            </div>
                          )}
                        </td>

                        {/* Amount */}
                        <td>
                          ₹{data.amount.toFixed(2)}
                          {showAmountError && (
                            <div className="text-danger small mt-1">
                              {itemError.amount}
                            </div>
                          )}
                        </td>

                        {/* Remove Button */}
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemoveItem(id)}
                          >
                            <FaTimes />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="d-flex justify-content-end gap-2">
          <Button variant="primary" type="submit" disabled={isSaving}>
            {isSaving
              ? inward
                ? "Updating..."
                : "Saving..."
              : inward
              ? "Update"
              : "Save"}{" "}
          </Button>
        </div>
      </form>
    </div>
  );
};

InwardEditModal.propTypes = {
  inward: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

const styles = `
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
    .mobile-table-container table {
      min-width: 600px;
    }
    .mobile-table-container th,
    .mobile-table-container td {
      white-space: nowrap;
      padding: 8px;
    }
    .mobile-table-container .form-control {
      min-width: 80px;
    }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default InwardEditModal;
