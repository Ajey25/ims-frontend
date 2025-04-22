import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Table, Dropdown, Form } from "react-bootstrap";
import axios from "axios";
import { FaTimes } from "react-icons/fa";
import Select from "react-select";

const OnRentEditModal = ({ onRent, onSave, onClose }) => {
  const [onRentNo, setOnRentNo] = useState("");
  const [onRentDate, setOnRentDate] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [initialQtyMap, setInitialQtyMap] = useState({});

  const [items, setItems] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [uomOptions, setUomOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stock, setStock] = useState([]);
  const [vehicleDetails, setVehicleDetails] = useState({
    vehicleName: "",
    vehicleNo: "",
    mobileNo: "",
    driverName: "",
  });

  const [errors, setErrors] = useState({});
  // const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemResponse, stockResponse, uomResponse, customerResponse] =
          await Promise.all([
            axios.get("http://localhost:5001/api/itemMaster"),
            axios.get("http://localhost:5001/api/stockMaster"),
            axios.get("http://localhost:5001/api/uom"),
            axios.get("http://localhost:5001/api/customerMaster"),
          ]);

        setItemOptions(itemResponse.data);
        // setStock(stockResponse.data);
        // Make sure stock data is properly processed
        const stockData = stockResponse.data.map((item) => ({
          ...item,
          id: String(item.id),
          item_id: String(item.item_id),
        }));
        setStock(stockData);
        setUomOptions(uomResponse.data);
        setCustomerOptions(customerResponse.data);

        if (onRent) {
          setOnRentNo(onRent.onRentNo || "");

          setOnRentDate(
            onRent.onRentDate
              ? new Date(onRent.onRentDate).toISOString().split("T")[0]
              : ""
          );

          // ✅ Correct Customer Mapping
          setCustomerId(onRent.customer?.id || "");
          setCustomerName(onRent.customer?.customerName || "");

          const formattedItems = {};
          const initialQtyMapData = {};

          // Process items and create a proper mapping
          if (onRent.items && onRent.items.length > 0) {
            onRent.items.forEach((item) => {
              formattedItems[item.itemId] = {
                itemId: item.itemId,
                name: item.itemName,
                qty: item.qtyOrWeight,
                perDayRate: item.perDayRate,
                uom: item.uomId,
              };

              // Store the initial quantities
              initialQtyMapData[item.itemId] = item.qtyOrWeight;
            });
          }
          setSelectedItems(formattedItems);
          setInitialQtyMap(initialQtyMapData);

          // ✅ Correct Vehicle Details Mapping
          setVehicleDetails({
            vehicleName: onRent.vehicleName || "",
            vehicleNo: onRent.vehicleNo || "",
            driverName: onRent.driverName || "",
            mobileNo: onRent.mobileNo || "",
          });
        } else {
          setOnRentDate(new Date().toISOString().split("T")[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [onRent]);

  const handleVehicleDetailsChange = (field, value) => {
    setVehicleDetails((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    let tempErrors = {};

    if (!onRentDate.trim()) {
      tempErrors.onRentDate = "On Rent Date is required.";
    }

    if (!customerName) {
      tempErrors.customerName = "Customer Name is required.";
    }

    if (Object.keys(selectedItems).length === 0) {
      tempErrors.items = "Please select at least one item.";
    } else {
      const itemErrors = {};
      Object.entries(selectedItems).forEach(([id, item]) => {
        const itemError = {};

        if (!item.uom) {
          itemError.uom = "UOM is required";
        }

        if (!item.qty || item.qty <= 0) {
          itemError.qty = "Quantity must be greater than 0";
        }

        if (!item.perDayRate || item.perDayRate <= 0) {
          itemError.perDayRate = "Per day rate must be greater than 0";
        }

        if (Object.keys(itemError).length > 0) {
          itemErrors[id] = itemError;
        }
      });

      if (Object.keys(itemErrors).length > 0) {
        tempErrors.itemErrors = itemErrors;
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    const newSelectedItems = {};

    if (newSelectAll) {
      itemOptions
        .filter((item) => item.isActive !== false)
        .forEach((item) => {
          const qtyUom = uomOptions.find((uom) => uom.uom === "qty");
          newSelectedItems[item.id] = {
            itemId: item.id,
            name: item.itemName,
            qty: 0,
            perDayRate: 0,
            uom: qtyUom ? qtyUom.id : "",
          };
        });
    }

    setSelectedItems(newSelectedItems);
    setSelectAll(newSelectAll);
  };

  const handleItemSelect = (id) => {
    const updatedItems = { ...selectedItems };

    if (updatedItems[id]) {
      delete updatedItems[id];
    } else {
      const item = itemOptions.find((item) => item.id === id);
      const qtyUom = uomOptions.find((uom) => uom.uom === "qty");
      updatedItems[id] = {
        itemId: item.id,
        name: item.itemName,
        qty: 0,
        perDayRate: 0,
        uom: qtyUom ? qtyUom.id : "",
      };
    }

    // Check if all active items are now selected
    const activeItemCount = itemOptions.filter(
      (item) => item.isActive !== false
    ).length;
    const selectedCount = Object.keys(updatedItems).length;

    setSelectedItems(updatedItems);
    setSelectAll(selectedCount === activeItemCount);
  };

  const handleInputChange = (id, field, value) => {
    const newSelectedItems = { ...selectedItems };

    if (field === "qty") {
      const stockItem = stock.find(
        (item) => String(item.item_id) === String(id)
      );

      if (stockItem) {
        const totalStock = stockItem.qty; // Original stock
        const initialQty = initialQtyMap[id] || 0;
        const newQty = Number(value);

        // Calculate the available stock correctly accounting for initial quantity
        const availableForThisItem = totalStock - (newQty - initialQty);

        // Prevent exceeding stock by checking against the adjusted available stock
        if (availableForThisItem < 0) return;

        newSelectedItems[id].qty = newQty;
      }
    } else {
      newSelectedItems[id][field] = value;
    }

    setSelectedItems(newSelectedItems);
  };

  const renderUomSelect = (id, currentUomId) => {
    // Find the current UOM name based on the ID
    const currentUom = uomOptions.find((uom) => uom.id == currentUomId);

    // If editing an existing item or if we want to show "qty" by default
    const displayValue = currentUom ? currentUom.uom : "qty";

    return (
      <input
        type="text"
        className="form-control form-control-sm"
        value={displayValue}
        readOnly
      />
    );
  };

  const handleRemoveItem = (id) => {
    const newSelectedItems = { ...selectedItems };
    delete newSelectedItems[id];
    setSelectedItems(newSelectedItems);
    calculateTotalAmount(newSelectedItems);
  };
  const filteredItemOptions = itemOptions
    ? itemOptions.filter(
        (item) =>
          item.isActive !== false &&
          item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    if (!customerName) {
      alert("Customer selection is required!");
      return;
    }

    if (!selectedItems || Object.keys(selectedItems).length === 0) {
      alert("At least one item must be selected!");
      return;
    }

    // Construct onRent object in the required format
    const newOnRent = {
      onRentDate,
      customerName,
      customerId, // Just the customer ID
      items: Object.entries(selectedItems).map(([id, data]) => ({
        item_id: id,
        uom: data.uom, // Ensure UOM is included
        qtyOrWeight: Number(data.qty),
        perDayRate: Number(data.perDayRate),
      })),
      vehicleDetails,
    };
    onSave(newOnRent);
    onClose();
  };
  const customerOptionsFormatted = customerOptions.map((customer) => ({
    value: customer.id,
    label: customer.customerName,
  }));

  // This was initializing the initialQtyMap only once on component mount
  // Moving this logic to the useEffect where we load the data from onRent

  const getAvailableStock = (itemId) => {
    const stockItem = stock.find(
      (item) => String(item.item_id) === String(itemId)
    );
    if (!stockItem) return 0;

    const totalQty = stockItem.qty;
    const initialQty = initialQtyMap[itemId] || 0;
    const selectedQty = selectedItems[itemId]?.qty || 0;

    // Fixed calculation: Consider initial quantity correctly
    // If we're renting 20 items but 10 were already rented (initialQty),
    // we only need to subtract the difference (20-10=10) from available stock
    return totalQty - (selectedQty - initialQty);
  };

  return (
    <div className=" mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h3>{onRent ? "Edit On Rent" : "Add On Rent"}</h3>
        <button className="btn btn-outline-secondary" onClick={onClose}>
          Close
        </button>
      </div>
      <form onSubmit={handleSubmit} className="card p-3 ">
        <div className="row mb-3">
          <div className="row">
            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">
                  On Rent Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={onRentDate}
                  onChange={(e) => setOnRentDate(e.target.value)}
                  onFocus={(e) => e.target.showPicker()}
                />
                {errors.onRentDate && (
                  <small className="text-danger">{errors.onRentDate}</small>
                )}
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Vehicle Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={vehicleDetails.vehicleName}
                  onChange={(e) =>
                    handleVehicleDetailsChange("vehicleName", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Vehicle No</label>
                <input
                  type="text"
                  className="form-control"
                  value={vehicleDetails.vehicleNo}
                  onChange={(e) =>
                    handleVehicleDetailsChange("vehicleNo", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">
                  Customer <span className="text-danger">*</span>
                </label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  options={customerOptionsFormatted}
                  value={customerOptionsFormatted.find(
                    (option) => option.value === customerId
                  )}
                  onChange={(selectedOption) =>
                    setCustomerName(selectedOption ? selectedOption.value : "")
                  }
                  isSearchable
                  placeholder="Select Customer"
                />
                {errors.customerName && (
                  <small className="text-danger">{errors.customerName}</small>
                )}
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Driver Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={vehicleDetails.driverName}
                  onChange={(e) =>
                    handleVehicleDetailsChange("driverName", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Driver Mobile No</label>
                <input
                  type="text"
                  className="form-control"
                  value={vehicleDetails.mobileNo}
                  onChange={(e) =>
                    handleVehicleDetailsChange("mobileNo", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">
            Select Items <span className="text-danger">*</span>
          </label>
          <div className="d-flex gap-2 align-items-center mb-2">
            <Dropdown>
              <Dropdown.Toggle variant="primary" id="dropdown-items">
                Select Items
              </Dropdown.Toggle>

              <Dropdown.Menu
                className="shadow-lg"
                style={{
                  width: "250px",
                  padding: "5px 8px",
                }}
              >
                {/* Search Bar */}
                <Form.Control
                  type="text"
                  placeholder="Search Items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 shadow-none py-1 px-2 "
                  style={{
                    backgroundColor: "transparent",
                    outline: "none",
                  }}
                />

                <hr className="my-1" />

                {/* Select All */}
                <div className="form-check py-1">
                  <input
                    className="form-check-input custom-checkbox border-1 border-primary"
                    type="checkbox"
                    id="selectAll"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                  <label
                    className="form-check-label w-100 "
                    htmlFor="selectAll"
                    style={{ cursor: "pointer" }}
                  >
                    Select All
                  </label>
                </div>

                <hr className="my-1" />

                {/* Items Grid */}
                <div
                  className="overflow-auto px-1"
                  style={{
                    maxHeight: "105px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "4px",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#aaa transparent",
                  }}
                >
                  {filteredItemOptions.map((item) => (
                    <div className="form-check py-1" key={item.id}>
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
                </div>
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
              <table className="table  table-sm table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Item Name</th>
                    <th>Available Stock</th>
                    <th>UOM</th>
                    <th>Quantity</th>
                    <th>Per Day Rate</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(selectedItems).map(([id, data]) => {
                    const availableStock = getAvailableStock(id);
                    const itemError = errors.itemErrors?.[id] || {};

                    return (
                      <tr key={id}>
                        <td>{data.name}</td>
                        <td>{availableStock}</td>
                        <td>
                          {renderUomSelect(id, data.uom)}
                          {itemError.uom && (
                            <div className="text-danger">{itemError.uom}</div>
                          )}
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            min="0"
                            max={availableStock + (data.qty || 0)}
                            value={data.qty || ""}
                            onChange={(e) =>
                              handleInputChange(id, "qty", e.target.value)
                            }
                          />
                          {itemError.qty && (
                            <div className="text-danger">{itemError.qty}</div>
                          )}
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            min="0.01"
                            step="0.01"
                            value={data.perDayRate || ""}
                            onChange={(e) =>
                              handleInputChange(
                                id,
                                "perDayRate",
                                Number(e.target.value)
                              )
                            }
                          />
                          {itemError.perDayRate && (
                            <div className="text-danger">
                              {itemError.perDayRate}
                            </div>
                          )}
                        </td>
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
          <Button variant="primary" type="submit">
            {onRent ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
};

OnRentEditModal.propTypes = {
  onRent: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default OnRentEditModal;
