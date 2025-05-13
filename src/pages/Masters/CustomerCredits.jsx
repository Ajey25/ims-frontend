import { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Lottie from "lottie-react";
import PaymentAnimation from "../../assets/payment.json";
import Payment2 from "../../assets/payment2.json";

const CustomerCredits = () => {
  const [customers, setCustomers] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState(null);
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDateChange = (date) => {
    setPaymentDate(date);
  };

  const handleDateChangeRaw = (e) => {
    const value = e.target.value;
    const regexWithSlashes = /^(\d{2})\/(\d{2})\/(\d{4})$/; // dd/MM/yyyy format
    const regexWithoutSlashes = /^(\d{2})(\d{2})(\d{4})$/; // ddMMyyyy format

    let date = null;

    if (regexWithSlashes.test(value)) {
      const [day, month, year] = value.split("/");
      date = new Date(`${year}-${month}-${day}`);
    } else if (regexWithoutSlashes.test(value)) {
      const [day, month, year] = [
        value.slice(0, 2),
        value.slice(2, 4),
        value.slice(4),
      ];
      date = new Date(`${year}-${month}-${day}`);
    }

    if (date && !isNaN(date.getTime())) {
      setPaymentDate(date);
      setErrors((prevErrors) => ({ ...prevErrors, paymentDate: "" }));
    } else {
      setPaymentDate(null);
      setErrors((prevErrors) => ({ ...prevErrors, paymentDate: "" }));
    }
  };

  const paymentOptions = [
    { label: "Cash", value: "cash" },
    { label: "Cheque", value: "cheque" },
    { label: "UPI", value: "upi" },
  ];

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/customerMaster`
      );
      if (!response.ok) throw new Error("Failed to fetch customers");
      const data = await response.json();
      setCustomers(data);
      setCustomerOptions(
        data.map((cust) => ({
          label: cust.customerName,
          value: cust.id,
        }))
      );
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedCustomerId) newErrors.customer = "Please select a customer.";
    if (!amount || parseFloat(amount) <= 0)
      newErrors.amount = "Amount must be greater than zero.";
    if (!paymentType) newErrors.paymentType = "Please select a payment type.";
    if (!paymentDate) newErrors.paymentDate = "Please select a payment date.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const creditData = {
        customerId: selectedCustomerId,
        paymentType: paymentType.value,
        paymentDate: paymentDate.toISOString().split("T")[0],
        amount: parseFloat(amount),
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/customerCredit/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(creditData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save credit");
      }

      const result = await response.json();
      console.log("Saved credit:", result);

      setShowConfirm(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

      setSelectedCustomerId("");
      setSelectedCustomer("");
      setAmount("");
      setPaymentType(null);
      setPaymentDate(new Date());
      setErrors({});
    } catch (error) {
      console.error("Error saving credit:", error);
      alert("Something went wrong while saving credit.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mt-1 p-1">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3>Credits</h3>
      </div>

      <div className="card p-4">
        <div className="row">
          <div className="col-md-4 mb-3">
            <strong>Customer Name</strong>
            <Select
              options={customerOptions}
              value={
                selectedCustomerId
                  ? customerOptions.find((c) => c.value === selectedCustomerId)
                  : null
              }
              onChange={(selectedOption) => {
                setSelectedCustomerId(selectedOption?.value || "");
                setSelectedCustomer(selectedOption?.label || "");
              }}
              isClearable
              isSearchable
              placeholder="Select Customer"
              className={errors.customer ? "is-invalid" : ""}
            />
            {errors.customer && (
              <div className="text-danger small mt-1">{errors.customer}</div>
            )}
          </div>

          <div className="col-md-4 mb-3">
            <strong>Amount</strong>
            <input
              type="number"
              className={`form-control ${errors.amount ? "is-invalid" : ""}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
            {errors.amount && (
              <div className="invalid-feedback">{errors.amount}</div>
            )}
          </div>

          <div className="col-md-4 mb-3">
            <strong>Payment Type</strong>
            <Select
              options={paymentOptions}
              value={paymentType}
              onChange={(selected) => setPaymentType(selected)}
              isClearable
              placeholder="Select Payment Type"
              className={errors.paymentType ? "is-invalid" : ""}
            />
            {errors.paymentType && (
              <div className="text-danger small mt-1">{errors.paymentType}</div>
            )}
          </div>

          <div className="col-md-4 mb-3">
            <strong>Payment Date</strong>
            <DatePicker
              selected={paymentDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              className="form-control date"
              placeholderText="dd/mm/yyyy"
              onChangeRaw={handleDateChangeRaw}
            />
            {errors.paymentDate && (
              <div className="text-danger small mt-1">{errors.paymentDate}</div>
            )}
          </div>
        </div>

        <div className="text-center mt-2">
          <button className="btn btn-primary" onClick={handleSave}>
            Save Credits
          </button>
        </div>

        {/* Confirmation Popup */}
        {showConfirm && (
          <div
            className="payment-confirm-animation position-fixed top-50 start-50 translate-middle bg-white rounded-4 shadow-xl border p-4 w-100"
            style={{ zIndex: 9999, maxWidth: "360px", textAlign: "center" }}
          >
            <div className="payment-processing d-flex flex-column align-items-center">
              <div
                className="success-icon mb-3"
                style={{ width: "400px", maxWidth: "100%" }}
              >
                <div
                  style={{ width: "100%", height: "100px", overflow: "hidden" }}
                >
                  <Lottie
                    animationData={Payment2}
                    loop={true}
                    style={{
                      width: "100%",
                      height: "250%", // keep this a bit taller to let cropping do its thing
                      marginTop: "-75px", // adjust this to visually center the animation
                    }}
                  />
                </div>
              </div>
              <h5 className="fw-bold mb-1">Processing Payment...</h5>
              <p className="text-muted">
                Please wait while we save your payment.
              </p>
            </div>

            <div className="d-flex justify-content-center gap-3 mt-3 flex-wrap">
              <button
                className="btn btn-success px-4"
                onClick={confirmSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Yes, Save"}
              </button>
              <button
                className="btn btn-outline-secondary px-4"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Payment Success Popup */}
        {showSuccess && (
          <div
            className="payment-success-animation position-fixed top-50 start-50 translate-middle bg-white rounded-4 shadow-xl border p-4 w-100"
            style={{ zIndex: 9999, maxWidth: "360px", textAlign: "center" }}
          >
            <div className="payment-successful d-flex flex-column align-items-center">
              <div
                className="success-icon mb-0 mx-auto"
                style={{
                  width: "100%",
                  maxWidth: "200px", // make it bigger here
                  height: "150px", // container height (adjust as needed)
                  overflow: "hidden", // chop off white space
                }}
              >
                <Lottie
                  animationData={PaymentAnimation}
                  loop={true}
                  style={{
                    width: "100%",
                    height: "200px", // intentionally larger than container
                    marginTop: "-30px", // pull it up to crop padding
                  }}
                />
              </div>

              <h5 className="fw-bold mb-1">Payment Successful</h5>
              <p className="text-muted mb-0">Your payment has been recorded.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerCredits;
