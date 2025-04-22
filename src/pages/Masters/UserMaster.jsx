import { useState, useEffect } from "react";
import UserMasterDetailsModal from "../../components/UserMasterDetailsModal";
import UserMasterEditModal from "../../components/UserMasterEditModal";
import { FaEye, FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import Pagination from "../../components/Pagination";
import axios from "axios";

const UserMaster = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const updateRowsPerPage = () => {
      setRowsPerPage(window.innerWidth <= 768 ? 10 : 10);
    };
    updateRowsPerPage();
    window.addEventListener("resize", updateRowsPerPage);
    return () => window.removeEventListener("resize", updateRowsPerPage);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/userMaster`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const handleAddUser = async (newUser) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/userMaster`,
        newUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUsers();
      setShowEditForm(false);
      toast.success("User added successfully");
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user maybe gmail already exists");
    }
  };

  const handleEditUser = async (updatedUser) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/userMaster/${updatedUser.id}`,
        updatedUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
      setShowEditForm(false);
      setSelectedUser(null);
      toast.success("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const filteredUsers = users.filter((user) =>
    [user?.firstName, user?.lastName, user?.email, user?.mobileNo]
      .map((str) => str?.toLowerCase() || "")
      .some((str) => str.includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredUsers
    .reverse()
    .slice(startIndex, startIndex + rowsPerPage);

  if (showEditForm) {
    return (
      <UserMasterEditModal
        user={selectedUser}
        onSave={selectedUser ? handleEditUser : handleAddUser}
        onClose={() => {
          setShowEditForm(false);
          setSelectedUser(null);
        }}
      />
    );
  }

  if (showDetailsView && selectedUser) {
    return (
      <UserMasterDetailsModal
        user={selectedUser}
        onClose={() => {
          setShowDetailsView(false);
          setSelectedUser(null);
        }}
      />
    );
  }

  return (
    <div className="responsive-container px-0">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4>User Master</h4>
        <button
          className="btn animated-btn"
          onClick={() => {
            setSelectedUser(null);
            setShowEditForm(true);
          }}
        >
          <span> +Add User</span>
        </button>
      </div>

      <div className="d-flex justify-content-end mb-2">
        <input
          type="text"
          className="form-control"
          style={{ width: "250px" }}
          placeholder="Search User..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-responsive" style={{ minHeight: "395px" }}>
        <table className="table table-sm table-bordered table-striped text-center">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Mobile No</th>
              <th>Created By</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{startIndex + index + 1}</td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.mobileNo}</td>
                  <td>{user.createdBy}</td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDetailsView(true);
                        }}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn btn-outline-warning btn-sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditForm(true);
                        }}
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default UserMaster;
