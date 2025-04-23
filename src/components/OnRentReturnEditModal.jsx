import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dropdown, Form, Button } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import Select from "react-select";

const OnRentReturnEditModal = ({ orr, onSave, onClose, isSaving }) => {
  // Basic form states
  const [onRentReturnNo, setOnRentReturnNo] = useState("");
  const [onRentReturnDate, setOnRentReturnDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [errors, setErrors] = useState({});
  const [saveClick, setSaveClick] = useState(false);

  // Vehicle details
  const [vehicleDetails, setVehicleDetails] = useState({
    vehicleName: "",
    vehicleNo: "",
    driverName: "",
    mobileNo: "",
  });

  // Data states
  const [items, setItems] = useState([]);
  const [customerMaster, setCustomerMaster] = useState([]);
  const [uomOptions, setUomOptions] = useState([]);
  const [onRentData, setOnRentData] = useState([]);

  // Selection states
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedOnRentRefs, setSelectedOnRentRefs] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [availableOnRentRefs, setAvailableOnRentRefs] = useState([]);

  // Search states
  const [itemSearchTerm, setItemSearchTerm] = useState("");
  const [onRentSearchTerm, setOnRentSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemResponse, uomResponse, customerResponse, onRentResponse] =
          await Promise.all([
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/itemMaster`),
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/uom`),
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/customerMaster`),
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/onrent`),
          ]);

        setItems(itemResponse.data);
        setUomOptions(uomResponse.data);
        setCustomerMaster(customerResponse.data);

        const activeOnRents = onRentResponse.data.filter((rent) =>
          rent.items.some((item) => !item.isCompleted)
        );
        setOnRentData(activeOnRents);
        if (!orr) {
          setOnRentReturnDate(new Date().toISOString().split("T")[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Filter active OnRent records in the useEffect where you're handling data loading
  useEffect(() => {
    if (orr) {
      // Basic info
      setOnRentReturnNo(orr.onRentReturnNo || "");
      setOnRentReturnDate(
        orr.onRentReturnDate
          ? new Date(orr.onRentReturnDate).toISOString().split("T")[0]
          : ""
      );

      // Set customer ID properly
      setCustomerName(orr.customerId || "");
      setTotalAmount(orr.totalAmount || 0);

      // Vehicle details
      setVehicleDetails({
        vehicleName: orr.vehicleName || "",
        vehicleNo: orr.vehicleNo || "",
        driverName: orr.driverName || "",
        mobileNo: orr.mobileNo || "",
      });

      const customerId = orr.customerId;

      const activeOnRents = onRentData.filter((rent) =>
        rent.items.some((item) => !item.isCompleted && item.remainingQty > 0)
      );

      // Get current OnRentRefs used in this return
      const currentOnRentNos = orr.items.map((item) => item.onRentNo);
      const currentRefsUsed = onRentData.filter((rent) =>
        currentOnRentNos.includes(rent.onRentNo)
      );

      // Merge both without duplicates
      const mergedRefs = [
        ...activeOnRents,
        ...currentRefsUsed.filter(
          (ref) => !activeOnRents.some((r) => r.onRentNo === ref.onRentNo)
        ),
      ];

      // Filter only for current customer
      const customerRents = mergedRefs.filter(
        (rent) => String(rent.customerId) === String(customerId)
      );

      setAvailableOnRentRefs(customerRents);

      if (orr.OnRentReturnItems && Array.isArray(orr.OnRentReturnItems)) {
        const formattedItems = orr.OnRentReturnItems.map((item) => ({
          id: `${item.itemId}_${item.onRentNo}`,
          itemId: item.itemId,
          onRentId: item.onRentNo,
          itemName: item.itemName,
          qtyOrWeight: item.qtyOrWeight,
          qtyReturn: item.qtyReturn,
          perDayRate: item.perDayRate,
          uom: item.uomId,
          usedDays: item.usedDays,
          amount: item.amount,
        }));
        setSelectedItems(formattedItems);

        const onRentRefs = [
          ...new Set(formattedItems.map((item) => item.onRentId)),
        ];
        setSelectedOnRentRefs(onRentRefs);

        const selectedItemIds = [
          ...new Set(formattedItems.map((item) => item.itemId)),
        ];

        // Build availableItems for dropdown (no filters here)
        const uniqueItems = [];
        customerRents.forEach((rent) => {
          rent.items.forEach((item) => {
            const itemId = item.itemId?._id || item.itemId;
            const itemName = item.itemName || item.item?.itemName;

            if (
              itemId &&
              !uniqueItems.some((i) => String(i.itemId) === String(itemId))
            ) {
              uniqueItems.push({ itemId, itemName });
            }
          });
        });

        setAvailableItems(uniqueItems);
      }
    }
  }, [orr, onRentData]);

  // Update available items and OnRent refs when customer changes
  useEffect(() => {
    if (customerName && onRentData.length > 0) {
      // Filter onRent records for selected customer
      const customerRents = onRentData.filter(
        (rent) =>
          rent.customer?.id === customerName || rent.customerId === customerName
      );

      // Set available OnRent refs
      setAvailableOnRentRefs(customerRents);

      // Extract unique items from customer's active rents
      const uniqueItems = [];
      customerRents.forEach((rent) => {
        rent.items.forEach((item) => {
          if (!item.isCompleted && item.remainingQty > 0) {
            const itemId = item.itemId || item.item?.id;
            if (!uniqueItems.some((i) => i.itemId === itemId)) {
              uniqueItems.push({
                itemId,
                itemName: item.itemName || item.item?.itemName,
              });
            }
          }
        });
      });

      setAvailableItems(uniqueItems);

      // Reset selections when customer changes
      if (!orr) {
        setSelectedItems([]);
        setSelectedOnRentRefs([]);
      }
    } else {
      // Reset available items and refs if no customer selected
      setAvailableItems([]);
      setAvailableOnRentRefs([]);
      setSelectedItems([]);
      setSelectedOnRentRefs([]);
    }
  }, [customerName, onRentData, orr]);

  // Handle item selection
  const handleItemSelect = (itemId) => {
    setSelectedItems((prev) => {
      // Check if any item with this itemId is already selected
      const isSelected = prev.some((item) => item.itemId === itemId);

      if (isSelected) {
        // Remove all items with this itemId
        return prev.filter((item) => item.itemId !== itemId);
      }

      const item = availableItems.find((i) => i.itemId === itemId);
      if (!item) return prev;

      // Find all available onRent records for this item
      const availableOnRents = onRentData.filter(
        (rent) =>
          (rent.customer?.id === customerName ||
            rent.customerId === customerName) &&
          rent.items.some(
            (i) =>
              (i.itemId === itemId || i.item?.id === itemId) &&
              !i.isCompleted &&
              i.remainingQty > 0
          )
      );

      // Add all available combinations
      const newItems = [...prev];
      availableOnRents.forEach((rent) => {
        const rentedItem = rent.items.find(
          (i) => i.itemId === itemId || i.item?.id === itemId
        );
        if (rentedItem) {
          newItems.push({
            id: `${itemId}_${rent._id || rent.onRentNo}`,
            itemId,
            onRentId: rent._id || rent.onRentNo,
            itemName: item.itemName,
            qtyOrWeight: rentedItem.qtyOrWeight,
            qtyReturn: "",
            perDayRate: rentedItem.perDayRate,
            uom: rentedItem.uomId || rentedItem.uom?._id || rentedItem.uom,
            usedDays: 0,
            amount: 0,
          });
        }
      });

      return newItems;
    });
  };

  // Handle OnRent ref selection
  const handleOnRentSelect = (onRentId) => {
    setSelectedOnRentRefs((prev) => {
      const isSelected = prev.includes(onRentId);
      if (isSelected) {
        return prev.filter((id) => id !== onRentId);
      }
      return [...prev, onRentId];
    });
  };

  // Handle input changes
  const handleInputChange = (itemId, field, value) => {
    if (field === "qtyReturn" && (isNaN(value) || value < 0)) return;

    setSelectedItems((prev) => {
      const newItems = prev.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item };
          updatedItem[field] = value;

          if (field === "qtyReturn" && onRentReturnDate) {
            const onRentRecord = onRentData.find(
              (rent) =>
                rent._id === item.onRentId || rent.onRentNo === item.onRentId
            );

            if (onRentRecord) {
              const usedDays = Math.ceil(
                (new Date(onRentReturnDate) -
                  new Date(onRentRecord.onRentDate)) /
                  (1000 * 60 * 60 * 24)
              );
              updatedItem.usedDays = usedDays;
              //   > 0 ? usedDays : 0;
              updatedItem.amount =
                Number(value) * updatedItem.perDayRate * usedDays;
              // (usedDays > 0 ? usedDays : 0);
            }
          }

          return updatedItem;
        }
        return item;
      });

      // Calculate total amount
      const total = newItems.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
      );
      setTotalAmount(total);

      return newItems;
    });

    // Validate the input
    validateInput(itemId, field, value);
  };
  const validateInput = (itemId, field, value) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (!newErrors.itemErrors) newErrors.itemErrors = {};

      const item = selectedItems.find((item) => item.id === itemId);
      if (!item) return newErrors;

      const onRentRecord = onRentData.find(
        (rent) => rent.onRentNo === item.onRentId
      );

      const rentedItem = onRentRecord.items.find(
        (i) => (i.itemId?._id || i.itemId) === item.itemId
      );
      if (!rentedItem) return newErrors;

      if (field === "qtyReturn") {
        // Corrected calculation
        let originalQty;

        if (orr) {
          // In edit mode
          const previouslyReturnedQty = rentedItem?.qtyReturn || 0;
          originalQty = (rentedItem?.remainingQty || 0) + previouslyReturnedQty;
        } else {
          // In add mode
          originalQty = rentedItem?.qtyOrWeight || 0;
        }

        const newQtyReturn = Number(value);

        // Basic validation
        if (!newQtyReturn || newQtyReturn <= 0) {
          newErrors.itemErrors[itemId] = "Return qty must be greater than 0.";
        } else if (newQtyReturn > originalQty) {
          newErrors.itemErrors[itemId] = "Return qty exceeds available qty.";
        } else {
          delete newErrors.itemErrors[itemId]; // Valid input
        }
      }

      return newErrors;
    });
  };

  // Handle remove item
  const handleRemoveItem = (itemId) => {
    setSelectedItems((prev) => {
      const newItems = prev.filter((item) => item.id !== itemId);
      const total = newItems.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
      );
      setTotalAmount(total);
      return newItems;
    });
  };

  // Handle vehicle details change
  const handleVehicleDetailsChange = (field, value) => {
    setVehicleDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle select all items - Fixed
  const handleSelectAllItems = () => {
    // Check if all available items are already selected
    const isAllSelected = availableItems.every((availableItem) =>
      selectedItems.some(
        (selectedItem) => selectedItem.itemId === availableItem.itemId
      )
    );

    if (isAllSelected) {
      // Deselect all items
      setSelectedItems([]);
    } else {
      // Select all available items
      const newItems = [...selectedItems];

      // For each available item that's not already selected
      availableItems.forEach((item) => {
        if (
          !selectedItems.some((selected) => selected.itemId === item.itemId)
        ) {
          const availableOnRents = onRentData.filter(
            (rent) =>
              (rent.customer?.id === customerName ||
                rent.customerId === customerName) &&
              rent.items.some(
                (i) =>
                  (i.itemId === item.itemId || i.item?.id === item.itemId) &&
                  !i.isCompleted &&
                  i.remainingQty > 0
              )
          );

          availableOnRents.forEach((rent) => {
            const rentedItem = rent.items.find(
              (i) => i.itemId === item.itemId || i.item?.id === item.itemId
            );

            if (rentedItem) {
              newItems.push({
                id: `${item.itemId}_${rent._id || rent.onRentNo}`,
                itemId: item.itemId,
                onRentId: rent._id || rent.onRentNo,
                itemName: item.itemName,
                qtyOrWeight: rentedItem.qtyOrWeight,
                qtyReturn: "",
                perDayRate: rentedItem.perDayRate,
                uom: rentedItem.uomId || rentedItem.uom?._id || rentedItem.uom,
                usedDays: 0,
                amount: 0,
              });
            }
          });
        }
      });

      setSelectedItems(newItems);
    }
  };

  // Handle select all OnRent refs - Fixed
  const handleSelectAllOnRentRefs = () => {
    const isAllSelected = availableOnRentRefs.every((ref) =>
      selectedOnRentRefs.includes(ref._id || ref.onRentNo)
    );

    if (isAllSelected) {
      setSelectedOnRentRefs([]);
    } else {
      setSelectedOnRentRefs(
        availableOnRentRefs.map((rent) => rent._id || rent.onRentNo)
      );
    }
  };

  // Filter OnRent refs by search term
  const filteredOnRentRefs = availableOnRentRefs
    .filter((rent) => rent.items && rent.items.length > 0) // must have items
    .filter((rent) => {
      const searchTerm = onRentSearchTerm.toLowerCase();
      const rentId = rent._id || rent.onRentNo;

      const matchesSearch =
        String(rent.onRentNo || "")
          .toLowerCase()
          .includes(searchTerm) ||
        rent.items.some((item) =>
          String(item.itemName || item.item?.itemName || "")
            .toLowerCase()
            .includes(searchTerm)
        );

      const hasSelectedItems = selectedItems.some(
        (item) => item.onRentId === rentId
      );

      return matchesSearch && hasSelectedItems;
    });

  // Filter items by search term
  const filteredItems = availableItems.filter((item) =>
    String(item.itemName || "")
      .toLowerCase()
      .includes(itemSearchTerm.toLowerCase())
  );

  // Get filtered table items based on selected OnRent refs
  const filteredTableItems = selectedItems.filter((item) =>
    selectedOnRentRefs.includes(item.onRentId)
  );

  // Render UOM select
  const renderUomSelect = (itemId, uomLabel) => {
    const currentUom = uomOptions.find((u) => u.uom === uomLabel);
    const currentUomId = currentUom?.id || "";

    return (
      <Form.Select
        size="sm"
        value={currentUomId}
        onChange={(e) =>
          handleInputChange(itemId, "uomId", parseInt(e.target.value))
        }
      >
        <option value="">Select UOM</option>
        {uomOptions.map((uom) => (
          <option key={uom.id} value={uom.id}>
            {uom.uom}
          </option>
        ))}
      </Form.Select>
    );
  };

  const validate = () => {
    let tempErrors = {};

    if (!onRentReturnDate.trim()) {
      tempErrors.onRentReturnDate = "Return Date is required.";
    } else {
      const selectedOnRentDates = selectedItems
        .filter((item) => selectedOnRentRefs.includes(item.onRentId))
        .map((item) => {
          const onRentRecord = onRentData.find(
            (rent) => rent.onRentNo === item.onRentId
          );
          return onRentRecord ? new Date(onRentRecord.onRentDate) : null;
        })
        .filter(Boolean);

      const returnDate = new Date(onRentReturnDate);

      const isInvalid = selectedOnRentDates.some(
        (rentDate) => returnDate < new Date(rentDate.toDateString())
      );

      if (isInvalid) {
        tempErrors.onRentReturnDate =
          "Return date cannot be earlier than the rented date.";
      }
    }

    if (!customerName) {
      tempErrors.customerName = "Customer Name is required.";
    }
    if (!totalAmount) {
      tempErrors.totalAmount = "total amount must be greater than 0.";
    }
    // Filter items based on selected OnRent refs
    const itemsToValidate = selectedItems.filter((item) =>
      selectedOnRentRefs.includes(item.onRentId)
    );

    if (itemsToValidate.length === 0) {
      tempErrors.items = "Please select at least one item.";
    } else {
      const itemErrors = {};
      itemsToValidate.forEach((item) => {
        const onRentRecord = onRentData.find(
          (rent) => rent.onRentNo === item.onRentId
        );

        if (!onRentRecord) return;

        const rentedItem = onRentRecord.items.find(
          (i) => (i.itemId?._id || i.itemId) === item.itemId
        );

        if (!rentedItem) return;

        // Correct calculation for validation
        let originalQty, dynamicRemainingQty;

        if (orr) {
          // In edit mode
          const previouslyReturnedQty = rentedItem?.qtyReturn || 0;
          originalQty = (rentedItem?.remainingQty || 0) + previouslyReturnedQty;
        } else {
          // In add mode
          originalQty = rentedItem?.qtyOrWeight || 0;
        }

        const currentQtyReturn = Number(item.qtyReturn) || 0;

        if (!currentQtyReturn || currentQtyReturn <= 0) {
          itemErrors[item.id] = "Return qty must be greater than 0.";
        } else if (currentQtyReturn > originalQty) {
          itemErrors[item.id] = "Return qty exceeds available qty.";
        }
      });

      if (Object.keys(itemErrors).length > 0) {
        tempErrors.itemErrors = itemErrors;
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0; // Return true if no errors
  };
  // Handle form submission
  const handleSubmit = async (e) => {
    setSaveClick(true);

    setTimeout(() => {
      setSaveClick(false);
    }, 3000); // 3000ms = 3 seconds
    e.preventDefault();
    if (!validate()) return;

    // Filter items based on selected OnRent refs
    const itemsToSave = selectedItems.filter((item) =>
      selectedOnRentRefs.includes(item.onRentId)
    );

    const itemsArray = itemsToSave.map((item) => ({
      onRentNo: item.onRentId,
      itemId: item.itemId,
      itemName: item.itemName,
      uom: item.uom,
      qtyOrWeight: item.qtyOrWeight,
      qtyReturn: Number(item.qtyReturn),
      perDayRate: item.perDayRate,
      usedDays: item.usedDays,
      amount: item.amount,
    }));

    const newOrr = {
      onRentReturnNo,
      onRentReturnDate,
      customerName,
      items: itemsArray,
      vehicleDetails,
      totalAmount,
    };

    try {
      await onSave(newOrr);
      onClose();
    } catch (error) {
      console.error("Error saving OnRentReturn:", error);
    }
  };

  const customerOptionsFormatted = customerMaster.map((customer) => ({
    value: customer.id,
    label: customer.customerName,
  }));

  return (
    <div className="container px-0">
      <div className="d-flex justify-content-between mb-2">
        <h3>{orr ? "Edit OnRent Return" : "Add OnRent Return"}</h3>
        <button className="btn btn-secondary" onClick={onClose}>
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-3 card shadow-sm ">
        <div className="row ">
          <div className="col-md-6">
            {/* Return Date */}
            <div>
              {" "}
              <label className="form-label">Return Date</label>
              <input
                type="date"
                className="form-control"
                value={onRentReturnDate}
                onFocus={(e) => e.target.showPicker()}
                onChange={(e) => {
                  const value = e.target.value;
                  setOnRentReturnDate(value);

                  // Clear error when user changes the date
                  setErrors((prev) => ({ ...prev, onRentReturnDate: "" }));

                  // Clear selections when date changes
                  setSelectedItems([]);
                  setSelectedOnRentRefs([]);
                }}
              />
              {errors.onRentReturnDate && (
                <small className="text-danger">{errors.onRentReturnDate}</small>
              )}
            </div>

            {/* Customer Name */}
            <label className="form-label mt-5">
              Customer Name <span className="text-danger">*</span>
            </label>
            <Select
              className="basic-single"
              classNamePrefix="select"
              options={customerOptionsFormatted}
              value={
                customerOptionsFormatted.find(
                  (option) => String(option.value) === String(customerName)
                ) || null
              }
              onChange={(selectedOption) =>
                setCustomerName(selectedOption ? selectedOption.value : "")
              }
              isSearchable
              placeholder="Select Customer"
            />
            {errors.customerName && (
              <small className="text-danger">{errors.customerName}</small>
            )}

            {/* Total Amount */}
            <label className="form-label mt-5">Total Amount</label>
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

          {/* Vehicle Details */}
          <div className="col-md-6">
            <label className="form-label">Vehicle Name</label>
            <input
              type="text"
              className="form-control"
              value={vehicleDetails.vehicleName}
              onChange={(e) =>
                handleVehicleDetailsChange("vehicleName", e.target.value)
              }
            />

            <label className="form-label mt-3">Vehicle No</label>
            <input
              type="text"
              className="form-control"
              value={vehicleDetails.vehicleNo}
              onChange={(e) =>
                handleVehicleDetailsChange("vehicleNo", e.target.value)
              }
            />

            <label className="form-label mt-3">Driver Name</label>
            <input
              type="text"
              className="form-control"
              value={vehicleDetails.driverName}
              onChange={(e) =>
                handleVehicleDetailsChange("driverName", e.target.value)
              }
            />

            <label className="form-label mt-3">Driver Mobile No</label>
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

        {/* Items Selection */}
        <div className="mb-3 mt-3">
          <label className="form-label fw-bold">Select Items to Return</label>
          <div className="d-flex gap-2 align-items-center mb-2">
            {/* Items dropdown */}
            <Dropdown>
              <Dropdown.Toggle
                variant="primary"
                id="dropdown-items"
                disabled={!customerName}
              >
                Select Items
              </Dropdown.Toggle>
              <Dropdown.Menu
                className="shadow-lg"
                style={{ width: "225px", padding: "5px 8px" }}
              >
                {/* Search Box */}
                <Form.Control
                  type="text"
                  placeholder="Search Items..."
                  value={itemSearchTerm}
                  onChange={(e) => setItemSearchTerm(e.target.value)}
                  className="border-0 shadow-none py-1 px-2"
                  style={{
                    backgroundColor: "transparent",
                    outline: "none",
                  }}
                />
                <hr className="my-1" />

                {/* Select All Checkbox */}
                <Form.Check
                  type="checkbox"
                  id="select-all-checkbox" // Added ID for reference
                  label={
                    <label
                      htmlFor="select-all-checkbox"
                      style={{ cursor: "pointer" }}
                    >
                      Select All
                    </label>
                  }
                  checked={
                    availableItems.length > 0 &&
                    availableItems.every((availableItem) =>
                      selectedItems.some(
                        (selectedItem) =>
                          selectedItem.itemId === availableItem.itemId
                      )
                    )
                  }
                  onChange={handleSelectAllItems} // Ensure all items are selected/deselected
                  className="py-1 custom-checkbox-blue"
                />
                <hr className="my-1" />

                {/* Scrollable Item List (2-column layout) */}
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
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <Form.Check
                        key={item.itemId}
                        type="checkbox"
                        label={
                          <span
                            style={{
                              cursor: "pointer",
                            }}
                            onClick={() => handleItemSelect(item.itemId)} // Ensure click toggles selection
                          >
                            {item.itemName}
                          </span>
                        }
                        checked={selectedItems.some(
                          (selectedItem) => selectedItem.itemId === item.itemId
                        )}
                        onChange={() => handleItemSelect(item.itemId)} // Ensure change is handled
                        className="py-1 custom-checkbox-blue"
                      />
                    ))
                  ) : (
                    <div
                      className="text-center text-muted"
                      style={{ gridColumn: "span 2" }}
                    >
                      {customerName
                        ? "No items available"
                        : "Select a customer first"}
                    </div>
                  )}
                </div>
              </Dropdown.Menu>
            </Dropdown>

            {/* OnRent References dropdown (No grid) */}
            <Dropdown>
              <Dropdown.Toggle
                variant="primary"
                id="dropdown-onrent"
                disabled={!customerName}
              >
                Select On Rent Ref
              </Dropdown.Toggle>

              <Dropdown.Menu
                className="shadow-lg"
                style={{ width: "300px", padding: "10px" }}
              >
                {/* Search Input */}
                <Form.Control
                  type="text"
                  placeholder="Search OnRent Ref..."
                  value={onRentSearchTerm}
                  onChange={(e) => setOnRentSearchTerm(e.target.value)}
                  className="border-0 shadow-none py-1 px-2"
                  style={{
                    backgroundColor: "transparent",
                    outline: "none",
                  }}
                />
                <hr className="my-1" />

                {/* Select All */}
                <Form.Check
                  type="checkbox"
                  id="select-all-onrent"
                  checked={
                    availableOnRentRefs.length > 0 &&
                    availableOnRentRefs.every((rent) =>
                      selectedOnRentRefs.includes(rent._id || rent.onRentNo)
                    )
                  }
                  onChange={handleSelectAllOnRentRefs}
                  className="py-1 custom-checkbox-blue"
                  label="Select All"
                />

                <hr className="my-1" />

                {/* Checkbox List */}
                <div className="overflow-auto" style={{ maxHeight: "200px" }}>
                  {filteredOnRentRefs.length > 0 ? (
                    filteredOnRentRefs.map((rent) => {
                      const rentId = rent._id || rent.onRentNo;
                      const labelText = `${rent.onRentNo} - ${rent.items
                        .map((item) => item.itemName || item.item?.itemName)
                        .join(", ")}`;
                      const checkboxId = `checkbox-${rentId}`;

                      return (
                        <Form.Check
                          key={rentId}
                          type="checkbox"
                          id={checkboxId}
                          checked={selectedOnRentRefs.includes(rentId)}
                          onChange={() => handleOnRentSelect(rentId)}
                          className="mb-1 custom-checkbox-blue"
                          label={labelText}
                        />
                      );
                    })
                  ) : (
                    <div className="text-center text-muted">
                      {customerName
                        ? "No OnRent references available"
                        : "Select a customer first"}
                    </div>
                  )}
                </div>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {errors.items && (
            <small className="text-danger d-block">{errors.items}</small>
          )}
        </div>

        {filteredTableItems.length > 0 && (
          <div className="mb-3">
            <h5>Selected Items</h5>
            <div className="table-responsive">
              <table className="table table-sm shadow-sm table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>On Rent No</th>
                    <th>On Rent Date</th>
                    <th>Item Name</th>
                    <th style={{ minWidth: "100px" }}>UOM</th>
                    <th>Total Qty</th>
                    <th>Balance Qty</th>
                    <th style={{ minWidth: "100px" }}>Return Qty</th>
                    <th>Per Day Rate</th>
                    <th>Used Days</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTableItems.map((item) => {
                    const onRentRecord = onRentData.find(
                      (rent) => rent.onRentNo === item.onRentId
                    );

                    const rentedItem = onRentRecord?.items.find(
                      (i) => (i.itemId?._id || i.itemId) === item.itemId
                    );
                    let originalQty, dynamicRemainingQty;
                    if (orr) {
                      // In edit mode, we need to account for the previously returned quantity
                      // The original qty is the remaining qty + the previously returned qty
                      const previouslyReturnedQty = rentedItem?.qtyReturn || 0;
                      const currentQtyReturn = Number(item.qtyReturn) || 0;

                      originalQty = rentedItem?.remainingQty || 0;

                      // Subtract only the difference between current and previous return qty
                      dynamicRemainingQty = originalQty;
                    } else {
                      // In add mode, simpler calculation
                      originalQty = rentedItem?.remainingQty || 0;
                      const currentQtyReturn = Number(item.qtyReturn) || 0;
                      dynamicRemainingQty = originalQty - currentQtyReturn;
                    }
                    return (
                      <tr key={item.id}>
                        <td
                          style={{
                            cursor: "pointer",
                            color: "blue",
                            textDecoration: "underline",
                          }}
                          onClick={() => {
                            if (!onRentRecord?.onRentNo) {
                              console.warn(
                                "onRentNo is missing, cannot open new tab"
                              );
                              return;
                            }

                            const onRentNo = onRentRecord.onRentNo; // Fallback in case function fails
                            const url = `http://localhost:5173/app/transactions/onrent?onRentNo=${onRentNo}`;

                            window.open(url, "_blank");
                          }}
                        >
                          {onRentRecord?.onRentNo}
                        </td>

                        <td>
                          {onRentRecord?.onRentDate
                            ? new Date(
                                onRentRecord.onRentDate
                              ).toLocaleDateString("en-GB")
                            : ""}
                        </td>
                        <td>{item.itemName}</td>
                        <td>
                          <Form.Select
                            size="sm"
                            disabled
                            value={item.uomId || 1} // Default to 1 if uomId is not set
                            onChange={(e) =>
                              handleInputChange(
                                item.id,
                                "uomId",
                                parseInt(e.target.value)
                              )
                            }
                          >
                            <option value="">Select UOM</option>
                            {uomOptions.map((uom) => (
                              <option key={uom.id} value={uom.id}>
                                {uom.uom}
                              </option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>{item.qtyOrWeight || 0}</td>
                        <td>
                          <span
                            className={
                              dynamicRemainingQty > 0
                                ? "text-success"
                                : "text-danger"
                            }
                          >
                            {dynamicRemainingQty}
                          </span>
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.qtyReturn || ""}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              handleInputChange(item.id, "qtyReturn", value);
                            }}
                            className={`form-control ${
                              errors.itemErrors?.[item.id] ? "is-invalid" : ""
                            }`}
                          />
                          {errors.itemErrors?.[item.id] && (
                            <div
                              className="text-danger"
                              style={{ fontSize: 10 }}
                            >
                              {errors.itemErrors[item.id]}
                            </div>
                          )}
                        </td>

                        <td>{item.perDayRate || "N/A"}</td>

                        <td>{item.usedDays || 0}</td>
                        <td>₹{(item.amount || 0).toFixed(2)}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <FaTimes />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot>
                  <tr>
                    <td colSpan="9" className="text-end fw-bold">
                      Total:
                    </td>
                    <td colSpan="2">₹{totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        <div className="d-flex justify-content-end">
          <Button variant="primary" type="submit" disabled={isSaving}>
            {isSaving
              ? orr
                ? "Updating..."
                : "Saving..."
              : orr
              ? "Update"
              : "Save"}{" "}
          </Button>
        </div>
      </form>
    </div>
  );
};

OnRentReturnEditModal.propTypes = {
  orr: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default OnRentReturnEditModal;
