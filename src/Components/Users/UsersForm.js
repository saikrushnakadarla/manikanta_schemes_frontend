// UsersForm.js - Handles both Add and Edit
import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import './UsersForm.css';

function UsersForm() {
  const history = useHistory();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: ''
  });

  useEffect(() => {
    // Check if we are in edit mode and have user data
    if (location.state && location.state.isEditMode && location.state.userData) {
      setIsEditMode(true);
      setUserId(location.state.userData.id);
      setFormData({
        full_name: location.state.userData.full_name || '',
        email: location.state.userData.email || '',
        phone_number: location.state.userData.phone_number || '',
        password: '' // Password is empty for security, user can optionally change it
      });
    }
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      Swal.fire({
        title: 'Error!',
        text: 'Full name is required',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
      return false;
    }

    if (!formData.email.trim()) {
      Swal.fire({
        title: 'Error!',
        text: 'Email is required',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        title: 'Error!',
        text: 'Please enter a valid email address',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
      return false;
    }

    if (!formData.phone_number.trim()) {
      Swal.fire({
        title: 'Error!',
        text: 'Phone number is required',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
      return false;
    }

    if (formData.phone_number.length < 10) {
      Swal.fire({
        title: 'Error!',
        text: 'Phone number must be at least 10 digits',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
      return false;
    }

    // Only validate password for new user creation, not for edit
    if (!isEditMode && !formData.password.trim()) {
      Swal.fire({
        title: 'Error!',
        text: 'Password is required',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
      return false;
    }

    if (!isEditMode && formData.password.length < 6) {
      Swal.fire({
        title: 'Error!',
        text: 'Password must be at least 6 characters long',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Prepare data for API
      const requestData = {
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number
      };
      
      // Only include password if it's provided (for edit) or always for new user
      if (formData.password) {
        requestData.password = formData.password;
      }
      
      let url = 'http://187.127.147.245:81/api/users/';
      let method = 'POST';
      
      if (isEditMode) {
        url = `http://187.127.147.245:81/api/users/${userId}/`;
        method = 'PUT';
      }
      
      console.log(`${isEditMode ? 'Updating' : 'Creating'} user:`, requestData);
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(requestData)
      });

      const responseText = await response.text();
      console.log('API Response:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON Parse Error:', e);
        throw new Error(`Server returned: ${responseText.substring(0, 100)}`);
      }

      if (response.ok && (result.status === 'success' || result.id)) {
        await Swal.fire({
          title: 'Success!',
          text: isEditMode ? 'User updated successfully!' : 'User created successfully!',
          icon: 'success',
          confirmButtonColor: '#667eea',
          confirmButtonText: 'OK',
          timer: 2000,
          timerProgressBar: true
        });
        
        history.push('/users');
      } else {
        let errorMessage = result.message || (isEditMode ? 'Failed to update user' : 'Failed to create user');
        
        if (result.errors) {
          const errorList = Object.values(result.errors).flat();
          errorMessage = errorList.join('\n');
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || (isEditMode ? 'Failed to update user. Please try again.' : 'Failed to create user. Please try again.'),
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: 'Cancel?',
      text: 'Are you sure you want to cancel? Any unsaved changes will be lost.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'No, stay'
    }).then((result) => {
      if (result.isConfirmed) {
        history.push('/users');
      }
    });
  };

  return (
    <div className="usersform-page">
      <Navbar />
      
      <div className="usersform-content">
        <div className="container-fluid">
          {/* Header Section */}
          <div className="usersform-header">
            <div className="header-badge">
              <i className={`bi ${isEditMode ? 'bi-pencil-square' : 'bi-person-plus-fill'}`}></i>
              <span>{isEditMode ? 'Edit User' : 'Add New User'}</span>
            </div>
            <h1 className="usersform-title">
              <i className="bi bi-person-badge-fill"></i>
              {isEditMode ? 'Edit User Account' : 'Create User Account'}
            </h1>
            <p className="usersform-subtitle">
              {isEditMode ? 'Update user information' : 'Fill in the details to add a new user'}
            </p>
          </div>

          {/* Form Card */}
          <div className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="full_name">
                  <i className="bi bi-person-fill"></i>
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  className="form-control"
                  placeholder="Enter full name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <i className="bi bi-envelope-fill"></i>
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone_number">
                  <i className="bi bi-telephone-fill"></i>
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  className="form-control"
                  placeholder="Enter phone number (10+ digits)"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  required
                />
                <small className="form-text text-muted">
                  Enter at least 10 digits (numbers only)
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <i className="bi bi-lock-fill"></i>
                  Password {!isEditMode && <span className="required">*</span>}
                  {isEditMode && <span className="optional">(Optional - leave blank to keep current)</span>}
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="form-control"
                    placeholder={isEditMode ? "Enter new password (optional)" : "Enter password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!isEditMode}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi bi-${showPassword ? 'eye-slash' : 'eye'}-fill`}></i>
                  </button>
                </div>
                {isEditMode ? (
                  <small className="form-text text-muted">
                    Only enter a password if you want to change it
                  </small>
                ) : (
                  <small className="form-text text-muted">
                    Password must be at least 6 characters long
                  </small>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg"></i>
                      {isEditMode ? 'Update User' : 'Create User'}
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <i className="bi bi-x-lg"></i>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsersForm;