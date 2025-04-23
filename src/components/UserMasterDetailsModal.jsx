import React from "react";

const UserMasterDetailsModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="custom-modal">
      <div className="modal-content">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>User Details</h3>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="modal-body">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row">
                {[
                  { label: "First Name", value: user.firstName },
                  { label: "Last Name", value: user.lastName },
                  { label: "Email", value: user.email },
                  { label: "Mobile No", value: user.mobileNo },
                  { label: "Created By", value: user.createdBy },
                  {
                    label: "Created At",
                    value: new Date(user.createdAt).toLocaleDateString("en-GB"),
                  },
                ].map(({ label, value }, index) => (
                  <div className="col-md-6 mb-4" key={index}>
                    <div className="d-flex">
                      <div style={{ minWidth: "120px", fontWeight: "bold" }}>
                        {label}
                      </div>
                      <div style={{ minWidth: "10px" }}>
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
    </div>
  );
};

export default UserMasterDetailsModal;
