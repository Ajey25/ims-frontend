import React from "react";

const UserMasterDetailsModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="custom-modal">
      <div className="modal-content">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>User Details</h3>
          <button className="btn btn-outline-secondary" onClick={onClose}>
            close
          </button>
        </div>

        <div className="modal-body">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <strong>First Name:</strong>
                  <p className="mt-1">{user.firstName}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Last Name:</strong>
                  <p className="mt-1">{user.lastName}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Email:</strong>
                  <p className="mt-1">{user.email}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Mobile No:</strong>
                  <p className="mt-1">{user.mobileNo}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Created By:</strong>
                  <p className="mt-1">{user.createdBy}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Created At:</strong>
                  <p className="mt-1">
                    {new Date(user.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserMasterDetailsModal;
