import React, { useState, useEffect } from "react";

const UserMasterEditModal = ({ user, onSave, onClose, isSaving }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNo: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        mobileNo: user.mobileNo || "",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        mobileNo: "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const validate = () => {
    let newErrors = {};

    if (!formData.firstName || formData.firstName.length < 3) {
      newErrors.firstName = "First Name must be at least 3 characters long.";
    }
    if (!formData.lastName || formData.lastName.length < 3) {
      newErrors.lastName = "Last Name must be at least 3 characters long.";
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!formData.mobileNo || !/^[0-9]{10}$/.test(formData.mobileNo)) {
      newErrors.mobileNo =
        "Mobile number must be exactly 10 digits and contain only numbers.";
    }
    if (!user) {
      if (!formData.password || formData.password.length < 4) {
        newErrors.password = "Password must be at least 4 characters long.";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobileNo") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prevData) => ({ ...prevData, [name]: numericValue }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const { confirmPassword, ...dataToSave } = formData;
      onSave(dataToSave);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h3>{user ? "Edit User" : "Add User"}</h3>
        <button className="btn btn-secondary" onClick={onClose}>
          Back
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              {[
                { label: "First Name", name: "firstName", type: "text" },
                { label: "Last Name", name: "lastName", type: "text" },
                { label: "Email", name: "email", type: "email" },
                { label: "Mobile No", name: "mobileNo", type: "text" },
              ].map(({ label, name, type }) => (
                <div className="col-md-6 mb-3" key={name}>
                  <label className="form-label">
                    {label} <span className="text-danger">*</span>
                  </label>
                  <input
                    type={type}
                    name={name}
                    className="form-control"
                    value={formData[name] || ""}
                    onChange={handleChange}
                  />
                  {errors[name] && (
                    <div className="text-danger small">{errors[name]}</div>
                  )}
                </div>
              ))}

              {!user && (
                <>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {errors.password && (
                      <div className="text-danger small">{errors.password}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Confirm Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmPassword && (
                      <div className="text-danger small">
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </form>
        </div>

        <div className=" text-end p-3">
          <button
            type="button"
            className="btn btn-secondary me-2"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving
              ? user
                ? "Updating..."
                : "Saving..."
              : user
              ? "Update"
              : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserMasterEditModal;
