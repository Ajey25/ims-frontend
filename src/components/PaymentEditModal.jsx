import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button } from "react-bootstrap";
import Select from "react-select";
import axios from "axios";
import { toast } from "react-toastify";

const PaymentEditModal = ({ onSave, onClose, isSaving }) => {
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [customers, setCustomers] = useState([]);
  const [returns, setReturns] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [errors, setErrors] = useState({});
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReturnNos, setSelectedReturnNos] = useState([]);
  const [paymentType, setPaymentType] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/customerMaster`
        );
        setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      const fetchReturns = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/payment/customer-returns/${
              selectedCustomer.id
            }`
          );
          const customerReturns = response.data;
          const initializedReturns = customerReturns.map((ret) => ({
            ...ret,
            paidAmount: 0,
            isReturnCompleted: false,
          }));
          setReturns(initializedReturns);
        } catch (error) {
          console.error("Error fetching returns:", error);
        }
      };

      fetchReturns();
    }
  }, [selectedCustomer]);

  useEffect(() => {
    if (paidAmount) {
      const totalAllocated = returns.reduce(
        (sum, ret) => sum + (parseFloat(ret.paidAmount) || 0),
        0
      );
      setRemainingAmount(parseFloat(paidAmount) - totalAllocated);
    } else {
      setRemainingAmount(0);
    }
  }, [paidAmount, returns]);

  const validate = () => {
    let tempErrors = {};

    // Customer Name validation
    if (!customerName.trim())
      tempErrors.customerName = "Customer Name is required.";

    // Paid Amount validation
    if (!paidAmount.trim()) tempErrors.paidAmount = "Enter an amount.";
    if (parseFloat(paidAmount) <= 0)
      tempErrors.paidAmount = "Amount must be greater than 0.";

    const totalAllocated = returns.reduce(
      (sum, ret) => sum + (parseFloat(ret.paidAmount) || 0),
      0
    );

    // Check if any return's paid amount exceeds its balance
    const hasExceededBalance = returns.some((ret) => {
      const balanceAmount = parseFloat(ret.balanceAmount || 0);
      const paidAmt = parseFloat(ret.paidAmount || 0);
      return paidAmt > balanceAmount;
    });

    if (hasExceededBalance) {
      tempErrors.allocation =
        "Paid amount cannot exceed balance amount for any return.";
    }

    if (Math.abs(totalAllocated - parseFloat(paidAmount)) > 0.01) {
      tempErrors.allocation = "Total allocated amount must equal paid amount.";
    }

    // Payment Type validation
    if (!paymentType) {
      tempErrors.paymentType = "Payment Type is required.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const numericPaidAmount = parseFloat(paidAmount);

      // Only include returns with allocated amounts and selected return numbers
      const allocatedReturns = returns
        .filter(
          (ret) =>
            parseFloat(ret.paidAmount) > 0 &&
            selectedReturnNos.some((selected) => selected.value === ret.id)
        )
        .map((ret) => ({
          returnId: ret.id,
          returnNumber: ret.returnNumber,
          allocatedAmount: parseFloat(ret.paidAmount),
          isReturnCompleted:
            parseFloat(ret.paidAmount) >= parseFloat(ret.balanceAmount || 0),
        }));

      const newPayment = {
        customerId: customerId,
        customerName: customerName,
        customerEmail: customerEmail,
        paidAmount: numericPaidAmount,
        paymentType: paymentType, // Add the payment type here
        allocatedReturns,
      };

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/payment`,
        newPayment,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onSave(response.data.payment);
      onClose();
    } catch (error) {
      console.error("Error saving payment:", error);
      if (error.response) {
        toast.error(
          `Error saving payment: ${error.response.status} - ${JSON.stringify(
            error.response.data
          )}`
        );
      } else if (error.request) {
        toast.error("Error saving payment: No response received from server");
      } else {
        toast.error(`Error saving payment: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomerChange = (selectedOption) => {
    const selectedCustomerId = selectedOption ? selectedOption.value : "";
    const selectedCustomer = customers.find(
      (customer) => customer.id === selectedCustomerId
    );

    // Set the selected customer details in state
    setSelectedCustomer(selectedCustomer);
    setCustomerId(selectedCustomerId);
    setCustomerName(selectedCustomer ? selectedCustomer.customerName : "");
    setCustomerEmail(selectedCustomer ? selectedCustomer.email : ""); // Add email field
    setReturns([]);
    setSelectedReturnNos([]); // Reset selected return numbers
  };

  const handlePaidAmountChange = (e) => {
    const newPaidAmount = e.target.value;
    setPaidAmount(newPaidAmount);

    setReturns(
      returns.map((ret) => ({
        ...ret,
        paidAmount: 0,
        isReturnCompleted: false,
      }))
    );
  };

  const handlePayFullAmount = (returnId) => {
    setReturns((prevReturns) => {
      const returnToUpdate = prevReturns.find((ret) => ret.id === returnId);
      const returnBalanceAmount = parseFloat(returnToUpdate.balanceAmount || 0);

      if (isNaN(returnBalanceAmount) || returnBalanceAmount <= 0) {
        console.error("Invalid balance amount for return:", returnToUpdate);
        return prevReturns;
      }

      const otherReturnsTotal = prevReturns.reduce(
        (sum, ret) =>
          ret.id !== returnId ? sum + (parseFloat(ret.paidAmount) || 0) : sum,
        0
      );

      if (otherReturnsTotal + returnBalanceAmount <= parseFloat(paidAmount)) {
        return prevReturns.map((ret) => {
          if (ret.id === returnId) {
            return {
              ...ret,
              paidAmount: returnBalanceAmount,
              isReturnCompleted: true,
            };
          }
          return ret;
        });
      } else {
        const remainingFunds = Math.max(
          0,
          parseFloat(paidAmount) - otherReturnsTotal
        );
        return prevReturns.map((ret) => {
          if (ret.id === returnId) {
            return {
              ...ret,
              paidAmount: remainingFunds,
              isReturnCompleted: remainingFunds === returnBalanceAmount,
            };
          }
          return ret;
        });
      }
    });
  };

  const handleReturnPaidAmountChange = (returnId, value) => {
    const newPaidAmount = parseFloat(value) || 0;

    setReturns((prevReturns) => {
      const returnToUpdate = prevReturns.find((ret) => ret.id === returnId);
      if (!returnToUpdate) {
        return prevReturns; // don't update anything
      }

      const returnBalanceAmount = parseFloat(
        returnToUpdate?.balanceAmount || 0
      );
      const actualPaidAmount = Math.min(newPaidAmount, returnBalanceAmount);

      return prevReturns.map((ret) => {
        if (ret.id === returnId) {
          return {
            ...ret,
            paidAmount: actualPaidAmount,
            isReturnCompleted: actualPaidAmount === returnBalanceAmount,
          };
        }
        return ret;
      });
    });
  };

  const allocateRemainingAmount = () => {
    if (remainingAmount <= 0) return;

    const selectedReturnIds = selectedReturnNos.map((r) => r.value);

    setReturns((prevReturns) => {
      let amountToAllocate = remainingAmount;

      return prevReturns.map((ret) => {
        if (!selectedReturnIds.includes(ret.id)) return ret;

        const returnBalanceAmount = parseFloat(ret.balanceAmount || 0);
        const currentPaid = parseFloat(ret.paidAmount) || 0;
        const remaining = returnBalanceAmount - currentPaid;

        if (remaining > 0 && amountToAllocate > 0) {
          const amountToAdd = Math.min(remaining, amountToAllocate);
          amountToAllocate -= amountToAdd;

          return {
            ...ret,
            paidAmount: currentPaid + amountToAdd,
            isReturnCompleted: currentPaid + amountToAdd >= returnBalanceAmount,
          };
        }
        return ret;
      });
    });
  };
  const distributeEvenly = () => {
    // Get IDs of selected returns
    const selectedIds = selectedReturnNos.map((sel) => sel.id || sel.value);

    // Filter only the selected returns
    const filteredReturns = returns.filter((ret) =>
      selectedIds.includes(ret.id)
    );

    if (filteredReturns.length === 0) return;

    // Convert amount to paise for precision
    const totalAmountPaise = Math.round(parseFloat(paidAmount) * 100);

    // Clone the returns array to avoid direct mutation
    const updatedReturns = returns.map((ret) => ({
      ...ret,
      paidAmount: ret.paidAmount || "0.00", // Ensure paidAmount exists
    }));

    // Calculate total remaining balance of selected returns (in paise)
    const totalBalance = filteredReturns.reduce((sum, ret) => {
      const balancePaise = Math.round(ret.balanceAmount * 100);
      const alreadyPaidPaise = Math.round(
        parseFloat(ret.paidAmount || 0) * 100
      );
      return sum + Math.max(0, balancePaise - alreadyPaidPaise);
    }, 0);

    // If total to pay exceeds total balance, cap it
    const amountToDistribute = Math.min(totalAmountPaise, totalBalance);

    // First pass: calculate how much each return should get proportionally
    let remainingAmount = amountToDistribute;
    let remainingReturns = [...filteredReturns];

    // Distribute amount in multiple passes if needed
    while (remainingAmount > 0 && remainingReturns.length > 0) {
      const evenShare = Math.floor(remainingAmount / remainingReturns.length);
      if (evenShare === 0) break;

      let distributableAmount = remainingAmount;
      let nextRemainingReturns = [];

      // For each remaining return, assign what we can
      for (const ret of remainingReturns) {
        const idx = updatedReturns.findIndex((r) => r.id === ret.id);
        if (idx === -1) continue;

        const balancePaise = Math.round(ret.balanceAmount * 100);
        const currentPaidPaise = Math.round(
          parseFloat(updatedReturns[idx].paidAmount) * 100
        );
        const remainingBalancePaise = Math.max(
          0,
          balancePaise - currentPaidPaise
        );

        // Calculate what we can assign to this return
        const assignablePaise = Math.min(evenShare, remainingBalancePaise);

        if (assignablePaise > 0) {
          // Update the return with the new paid amount
          const newPaidPaise = currentPaidPaise + assignablePaise;
          updatedReturns[idx].paidAmount = (newPaidPaise / 100).toFixed(2);

          // Mark as completed if fully paid
          updatedReturns[idx].isReturnCompleted = newPaidPaise >= balancePaise;

          // Deduct from the amount we're distributing
          distributableAmount -= assignablePaise;

          // If this return can take more, keep it for the next round
          if (newPaidPaise < balancePaise) {
            nextRemainingReturns.push(ret);
          }
        }
      }

      // Update for next iteration
      remainingAmount = distributableAmount;
      remainingReturns = nextRemainingReturns;
    }

    // Handle leftover amount (if any) by distributing to the first return that can take it
    if (remainingAmount > 0) {
      for (const ret of filteredReturns) {
        const idx = updatedReturns.findIndex((r) => r.id === ret.id);
        if (idx === -1) continue;

        const balancePaise = Math.round(ret.balanceAmount * 100);
        const currentPaidPaise = Math.round(
          parseFloat(updatedReturns[idx].paidAmount) * 100
        );
        const remainingBalancePaise = Math.max(
          0,
          balancePaise - currentPaidPaise
        );

        if (remainingBalancePaise > 0) {
          const additionalPaise = Math.min(
            remainingAmount,
            remainingBalancePaise
          );
          const newPaidPaise = currentPaidPaise + additionalPaise;
          updatedReturns[idx].paidAmount = (newPaidPaise / 100).toFixed(2);
          updatedReturns[idx].isReturnCompleted = newPaidPaise >= balancePaise;
          remainingAmount -= additionalPaise;

          if (remainingAmount === 0) break;
        }
      }
    }

    // Update state with the new values
    setReturns(updatedReturns);
  };

  const resetAllocations = () => {
    setReturns(
      returns.map((ret) => ({
        ...ret,
        paidAmount: 0,
        isReturnCompleted: false,
      }))
    );
  };

  const handleReturnNosChange = (selectedOptions) => {
    setSelectedReturnNos(selectedOptions);
  };

  const filteredReturns = returns.filter((ret) =>
    selectedReturnNos.some((selected) => selected.value === ret.id)
  );

  const customerOptionsFormatted = customers.map((customer) => ({
    value: customer.id,
    label: customer.customerName,
  }));
  const handleChange = (selectedOption) => {
    if (selectedOption) {
      setPaymentType(selectedOption.value); // Get the 'value' from the selected option
    }
  };
  const totalBalanceAmount = filteredReturns.reduce(
    (sum, ret) => sum + (ret.balanceAmount || 0),
    0
  );

  return (
    <div className="payment-edit-modal ">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="modal-title">Add Payment</h3>
        <button className="btn btn-secondary" onClick={onClose}>
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card p-3 shadow-sm">
        <div className="row mb-3">
          {/* Customer Name */}
          <div className="col-12 col-md-4">
            <label className="form-label">
              Customer Name <span className="text-danger">*</span>
            </label>
            <Select
              options={customerOptionsFormatted}
              value={
                customerOptionsFormatted.find((c) => c.value === customerId) ||
                null
              }
              onChange={handleCustomerChange}
              isDisabled={isSubmitting}
              isSearchable
              placeholder="Select Customer"
              className="basic-single"
              classNamePrefix="select"
            />
            {errors.customerName && (
              <small className="text-danger">{errors.customerName}</small>
            )}
          </div>

          {/* Paid Amount */}
          <div className="col-12 col-md-4">
            <label className="form-label">
              Paid Amount <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className="form-control"
              value={paidAmount}
              onChange={handlePaidAmountChange}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e") {
                  e.preventDefault();
                }
              }}
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
            {errors.paidAmount && (
              <small className="text-danger">{errors.paidAmount}</small>
            )}
          </div>

          {/* Payment Type (Now Aligned Properly) */}
          <div className="col-12 col-md-4">
            <label className="form-label">
              Payment Type <span className="text-danger">*</span>
            </label>
            <Select
              options={[
                { value: "Cash", label: "Cash" },
                { value: "Cheque", label: "Cheque" },
                { value: "UPI", label: "UPI" },
              ]}
              value={
                // Find the value from the paymentType state or return null if not found
                paymentType
                  ? {
                      value: paymentType,
                      label:
                        paymentType.charAt(0).toUpperCase() +
                        paymentType.slice(1),
                    }
                  : null
              }
              onChange={handleChange}
              isDisabled={isSubmitting}
              isSearchable
              placeholder="Select Payment Type"
              className="basic-single"
              classNamePrefix="select"
            />
            {errors.paymentType && (
              <small className="text-danger">{errors.paymentType}</small>
            )}
          </div>
        </div>

        {selectedCustomer && returns.length > 0 ? (
          <div className="orders-section mb-3">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-2">
              <h5 className="mb-0">Returns</h5>
              <div className="d-flex flex-wrap gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={resetAllocations}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={distributeEvenly}
                  disabled={isSubmitting}
                >
                  Distribute Evenly
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={allocateRemainingAmount}
                  disabled={isSubmitting}
                >
                  Auto-Allocate
                </Button>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Filter by Return No</label>
              <Select
                isMulti
                options={returns.map((ret) => ({
                  value: ret.id,
                  label: ret.returnNumber,
                }))}
                value={selectedReturnNos}
                onChange={handleReturnNosChange}
                placeholder="Select Return Nos..."
                isDisabled={isSubmitting}
              />
            </div>

            <div
              className={`alert ${
                remainingAmount < 0 ? "alert-danger" : "alert-info"
              } py-2 px-3`}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span>Remaining: ₹{remainingAmount.toFixed(2)}</span>
                {remainingAmount < 0 && (
                  <small className="text-danger">
                    Allocated amount exceeds paid amount
                  </small>
                )}
              </div>
            </div>

            {errors.allocation && (
              <div className="alert alert-danger py-2">{errors.allocation}</div>
            )}

            <div className="table-responsive p-2">
              <table className="table table-bordered shadow-sm">
                <thead className="table-light">
                  <tr>
                    <th>Return No</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Balance</th>
                    <th>Pay</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReturns.map((ret) => (
                    <tr key={ret.id}>
                      <td
                        style={{
                          cursor: "pointer",
                          color: "blue",
                          textDecoration: "underline",
                        }}
                        onClick={() => {
                          if (!ret?.returnNumber) {
                            console.warn(
                              "returnNumber is missing, cannot open new tab"
                            );
                            return;
                          }

                          const url = `${
                              import.meta.env.VITE_API_BASE_URL2
                            }/app/transactions/onrentreturn?returnNumber=${ret.returnNumber}`;
                          window.open(url, "_blank");
                        }}
                      >
                        {ret.returnNumber}
                      </td>
                      <td>{new Date(ret.returnDate).toLocaleDateString()}</td>
                      <td>₹{ret.totalAmount}</td>
                      <td>₹{ret.balanceAmount || 0}</td>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          min="0"
                          max={ret.balanceAmount || 0}
                          value={ret.paidAmount || 0}
                          onChange={(e) =>
                            handleReturnPaidAmountChange(
                              ret._id,
                              e.target.value
                            )
                          }
                          disabled={isSubmitting}
                          readOnly
                        />
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handlePayFullAmount(ret.id)}
                          disabled={ret.isReturnCompleted || isSubmitting}
                        >
                          Pay Full
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {/* 👇 The Total Row */}
                  <tr>
                    <td colSpan={3} className="text-end fw-bold">
                      Total Balance:
                    </td>
                    <td className="fw-bold">₹{totalBalanceAmount}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          selectedCustomer && (
            <div className="alert alert-danger py-2">No returns found</div>
          )
        )}

        <div className="d-flex gap-2 justify-content-end mt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Payment"}
          </Button>
        </div>
      </form>
    </div>
  );
};

PaymentEditModal.propTypes = {
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PaymentEditModal;
