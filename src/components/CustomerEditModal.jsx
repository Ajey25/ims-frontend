import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Form } from "react-bootstrap";
import debounce from "lodash/debounce"; // Import debounce

const CustomerEditModal = ({ customer, onSave, onClose, isSaving }) => {
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [gst, setGst] = useState("");
  const [pan, setPan] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("active");
  const [emailError, setEmailError] = useState({ message: "", color: "" });
  const [emailValid, setEmailValid] = useState(null); // true | false | null

  useEffect(() => {
    if (customer) {
      setCustomerName(customer.customerName);
      setEmail(customer.email);
      setMobile(customer.mobile);
      setGst(customer.gst);
      setPan(customer.pan);
      setAddress(customer.address || "");
      setStatus(customer.isActive ? "active" : "inactive");
    }
  }, [customer]);

  const validateCustomerName = (name) => {
    const re = /^[a-zA-Z0-9 _-]+$/; // Still allows alphanumerics, _ and -
    return re.test(name);
  };

  const startsWithNumber = (str) => /^[0-9]/.test(str);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.(com|org|net|edu|gov|in)$/i;
    return re.test(email);
  };
  const checkEmailExists = debounce(async (email) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/customerMaster/check/email?email=${email}`
      );
      const data = await response.json();
      if (data.exists) {
        setEmailError({
          message: "Email already in use",
          color: "text-danger",
        });
        setEmailValid(false);
      } else {
        setEmailError({ message: "Email is available", color: "text-success" });
        setEmailValid(true);
      }
    } catch (error) {
      setEmailError({ message: "Error checking email", color: "text-danger" });
      setEmailValid(false);
    }
  }, 500);

  const handleEmailChange = (e) => {
    const value = e.target.value.trim();
    setEmail(value);
    if (value) {
      checkEmailExists(value); // Call debounced function
    } else {
      setEmailError(""); // Clear email error if email is empty
    }
  };

  const validateMobile = (mobile) => {
    const re = /^[0-9]{10}$/;
    return re.test(mobile);
  };

  const validateGST = (gst) => {
    const re = /^[0-9A-Z]{15}$/;
    return re.test(gst);
  };

  const validatePAN = (pan) => {
    const re = /^[A-Z0-9]{10}$/;
    return re.test(pan);
  };

  const validate = () => {
    let tempErrors = {};

    if (!customerName.trim()) {
      tempErrors.customerName = "Customer Name is required";
    } else if (customerName.length < 4) {
      tempErrors.customerName =
        "Customer Name must be at least 4 characters long";
    } else if (customerName.length > 20) {
      tempErrors.customerName = "Customer Name must not exceed 20 characters.";
    } else if (!validateCustomerName(customerName)) {
      tempErrors.customerName =
        "Customer Name should not contain special characters except _ and -";
    } else if (customerName.startsWith(" ")) {
      tempErrors.customerName = "Customer Name should not start with a space";
    } else if (startsWithNumber(customerName)) {
      tempErrors.customerName = "Customer Name should not start with a number";
    }

    // Email validation
    if (!email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      tempErrors.email =
        "Please enter a valid email address (e.g. user@example.com).";
    } else if (email.startsWith(" ")) {
      tempErrors.email = "Email should not start with a space";
    }

    // Mobile validation
    if (!mobile.trim()) {
      tempErrors.mobile = "Mobile number is required";
    } else if (!validateMobile(mobile)) {
      tempErrors.mobile = "Mobile number must be 10 digits";
    }

    // GST validation
    if (gst.trim() && !validateGST(gst)) {
      tempErrors.gst =
        "GST must be 15 characters (numbers and capital letters only)";
    }

    // PAN validation
    if (pan.trim() && !validatePAN(pan)) {
      tempErrors.pan =
        "PAN must be 10 characters (numbers and capital letters only)";
    }

    // Address validation
    if (!address.trim()) {
      tempErrors.address = "Address is required";
    } else if (address.startsWith(" ")) {
      tempErrors.address = "Address should not start with a space";
    } else if (address.length < 4) {
      tempErrors.address = "Address must be at least 4 characters long";
    } else if (address.length > 40) {
      tempErrors.address = "Address must not exceed 40 characters";
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
    if (!emailValid) {
      return;
    }
    const newCustomer = {
      id: customer?.id,
      customerName,
      email,
      mobile,
      gst: gst.toUpperCase(),
      pan: pan.toUpperCase(),
      address,
      isActive: status === "active",
    };
    onSave(newCustomer);
    onClose();
  };

  // Handle input changes with validation
  const handleGSTChange = (e) => {
    const value = e.target.value.toUpperCase();
    const sanitizedValue = value.replace(/[^A-Z0-9]/g, ""); // Removes special characters and spaces
    if (sanitizedValue.length <= 15) {
      setGst(sanitizedValue);
    }
  };

  const handlePANChange = (e) => {
    const value = e.target.value.toUpperCase();
    const sanitizedValue = value.replace(/[^A-Z0-9]/g, ""); // Removes special characters and spaces
    if (sanitizedValue.length <= 10) {
      setPan(sanitizedValue);
    }
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setMobile(value);
    }
  };

  return (
    <div className="container mt-2">
      <div className="d-flex justify-content-between mb-3">
        <h3>{customer ? "Edit Customer" : "Add Customer"}</h3>
        <button className="btn btn-secondary" onClick={onClose}>
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card p-3">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">
              Customer Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              placeholder="Please enter customer name"
              className={`form-control ${
                errors.customerName ? "is-invalid" : ""
              }`}
              value={customerName}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[a-zA-Z0-9-_ ]*$/.test(value)) {
                  setCustomerName(value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === " " && e.target.value.length === 0) {
                  e.preventDefault(); // Prevent starting with space
                }
              }}
            />
            {errors.customerName && (
              <div className="invalid-feedback">{errors.customerName}</div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={email}
              placeholder="Enter email address"
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault();
                }
              }}
              onChange={handleEmailChange} // Use the debounced email change handler
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
            {emailError.message && (
              <div className={`form-text ${emailError.color}`}>
                {emailError.message}
              </div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">
              Mobile <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              placeholder="Please enter mobile number"
              className={`form-control ${errors.mobile ? "is-invalid" : ""}`}
              value={mobile}
              onChange={handleMobileChange}
              maxLength={10}
            />
            {errors.mobile && (
              <div className="invalid-feedback">{errors.mobile}</div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">GST</label>
            <input
              type="text"
              placeholder="Please enter customer GST number"
              className={`form-control ${errors.gst ? "is-invalid" : ""}`}
              value={gst}
              onChange={handleGSTChange}
              maxLength={15}
            />
            {errors.gst && <div className="invalid-feedback">{errors.gst}</div>}
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">PAN</label>
            <input
              type="text"
              placeholder="Enter PAN number"
              className={`form-control ${errors.pan ? "is-invalid" : ""}`}
              value={pan}
              onChange={handlePANChange}
              maxLength={10}
            />
            {errors.pan && <div className="invalid-feedback">{errors.pan}</div>}
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">
              Address <span className="text-danger">*</span>
            </label>
            <textarea
              placeholder="Please enter address"
              className={`form-control ${errors.address ? "is-invalid" : ""}`}
              rows="3"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            ></textarea>
            {errors.address && (
              <div className="invalid-feedback">{errors.address}</div>
            )}
          </div>

          <div className="col-12 mb-3">
            <label className="form-label d-block mb-2">Status*</label>

            <div
              className="d-flex align-items-center rounded-pill px-2 py-1 text-white shadow-sm position-relative"
              style={{
                backgroundColor: status === "active" ? "#28a745" : "#dc3545",
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

        <div className="d-flex justify-content-center gap-2">
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving
              ? customer
                ? "Updating..."
                : "Saving..."
              : customer
              ? "Update"
              : "Save Customer"}
          </button>
        </div>
      </form>
    </div>
  );
};

CustomerEditModal.propTypes = {
  customer: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CustomerEditModal;
