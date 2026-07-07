// Users.js - Navigate to edit page
import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useHistory } from 'react-router-dom';
import './Users.css';
import baseURL from '../URL/NodeBaseURL';

function Users() {
  const history = useHistory();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/users/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users data');
      }

      const result = await response.json();
      
      if (Array.isArray(result)) {
        setUsers(result);
      } else if (result.status === 'success' && Array.isArray(result.data)) {
        setUsers(result.data);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleAddUser = () => {
    history.push('/usersform');
  };

  const handleEditUser = (user) => {
    // Pass user data to edit form via state
    history.push({
      pathname: '/usersform',
      state: { userData: user, isEditMode: true }
    });
  };

  const handleDeleteUser = (user) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete user "${user.full_name}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#667eea',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${baseURL}/api/users/${user.id}/`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            }
          });

          if (response.ok) {
            await Swal.fire({
              title: 'Deleted!',
              text: 'User has been deleted successfully.',
              icon: 'success',
              confirmButtonColor: '#667eea',
              timer: 2000,
              timerProgressBar: true
            });
            await fetchUsers();
          } else {
            const result = await response.json();
            throw new Error(result.message || 'Failed to delete user');
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          Swal.fire({
            title: 'Error!',
            text: error.message || 'Failed to delete user. Please try again.',
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
        }
      }
    });
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone_number?.includes(searchTerm)
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="users-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="users-error">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <h3>Error Loading Users</h3>
          <p>{error}</p>
          <button onClick={fetchUsers} className="btn btn-primary">
            <i className="bi bi-arrow-repeat"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <Navbar />
      
      <div className="users-content">
        <div className="container-fluid">
          {/* Header Section */}
          <div className="users-header">
            <div className="header-badge">
              <i className="bi bi-people-fill"></i>
              <span>User Management</span>
            </div>
            <h1 className="users-title">
              <i className="bi bi-person-badge-fill"></i>
              Users List
            </h1>
            <p className="users-subtitle">
              Manage and view all registered users
            </p>
          </div>

          {/* Stats Cards */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-people-fill"></i>
              </div>
              <div className="stat-info">
                <h3>{users.length}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-calendar-check-fill"></i>
              </div>
              <div className="stat-info">
                <h3>{users.filter(u => new Date(u.created_at).getMonth() === new Date().getMonth()).length}</h3>
                <p>New This Month</p>
              </div>
            </div>
          </div>

          {/* Search and Add User Row */}
          <div className="search-add-container">
            <div className="search-wrapper">
              <div className="search-input-wrapper">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name, email or phone..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                {searchTerm && (
                  <button className="clear-search" onClick={() => setSearchTerm('')}>
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                )}
              </div>
            </div>
            <button className="add-user-btn" onClick={handleAddUser}>
              <i className="bi bi-person-plus-fill"></i>
              <span>Add User</span>
            </button>
          </div>

          {/* Table View with Horizontal Scroll on Mobile */}
          <div className="table-container">
            <div className="table-responsive-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <tr key={user.id}>
                        <td data-label="S.No">
                          <span className="sno-badge">{indexOfFirstItem + index + 1}</span>
                        </td>
                        <td data-label="Full Name">
                          <div className="user-name-cell">
                            <div className="user-avatar">
                              {user.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="user-name">{user.full_name || 'N/A'}</span>
                          </div>
                        </td>
                        <td data-label="Email">
                          <a href={`mailto:${user.email}`} className="email-link">
                            <i className="bi bi-envelope-fill"></i> 
                            <span>{user.email || 'N/A'}</span>
                          </a>
                        </td>
                        <td data-label="Phone Number">
                          <a href={`tel:${user.phone_number}`} className="phone-link">
                            <i className="bi bi-telephone-fill"></i> 
                            <span>{user.phone_number || 'N/A'}</span>
                          </a>
                        </td>
                        <td data-label="Created At">
                          <div className="date-info">
                            <i className="bi bi-calendar3"></i>
                            <span>{formatDate(user.created_at)}</span>
                          </div>
                        </td>
                        <td data-label="Updated At">
                          <div className="date-info">
                            <i className="bi bi-clock-history"></i>
                            <span>{formatDate(user.updated_at)}</span>
                          </div>
                        </td>
                        <td data-label="Actions">
                          <div className="action-buttons-cell">
                            <button 
                              className="edit-btn"
                              onClick={() => handleEditUser(user)}
                              title="Edit User"
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => handleDeleteUser(user)}
                              title="Delete User"
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                            <button 
                              className="view-btn"
                              onClick={() => handleViewDetails(user)}
                              title="View Details"
                            >
                              <i className="bi bi-eye-fill"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">
                        <div className="no-data-content">
                          <i className="bi bi-inbox-fill"></i>
                          <p>No users found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <div className="page-numbers">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        className={`page-number-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => paginate(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="page-dots">...</span>
                      <button
                        className="page-number-btn"
                        onClick={() => paginate(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                <button
                  className="pagination-btn"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="bi bi-person-circle"></i>
                User Details
              </h3>
              <button className="close-modal" onClick={closeModal}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-avatar">
                <div className="large-avatar">
                  {selectedUser.full_name?.charAt(0).toUpperCase()}
                </div>
                <h4>{selectedUser.full_name || 'N/A'}</h4>
                <span className="user-id-badge">ID: #{selectedUser.id}</span>
              </div>
              
              <div className="modal-details">
                <div className="detail-group">
                  <i className="bi bi-envelope-fill"></i>
                  <div>
                    <label>Email Address</label>
                    <p>{selectedUser.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-telephone-fill"></i>
                  <div>
                    <label>Phone Number</label>
                    <p>{selectedUser.phone_number || 'N/A'}</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-calendar-plus-fill"></i>
                  <div>
                    <label>Created At</label>
                    <p>{formatDate(selectedUser.created_at)}</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-pencil-square"></i>
                  <div>
                    <label>Last Updated</label>
                    <p>{formatDate(selectedUser.updated_at)}</p>
                  </div>
                </div>
                {selectedUser.created_by_name && (
                  <div className="detail-group">
                    <i className="bi bi-person-fill"></i>
                    <div>
                      <label>Created By</label>
                      <p>{selectedUser.created_by_name}</p>
                    </div>
                  </div>
                )}
                {selectedUser.updated_by_name && (
                  <div className="detail-group">
                    <i className="bi bi-person-fill-update"></i>
                    <div>
                      <label>Updated By</label>
                      <p>{selectedUser.updated_by_name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close-modal" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;