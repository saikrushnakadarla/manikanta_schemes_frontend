// Organization.js
import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Organization.css';

function Organization() {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone_number: '',
    mobile_number: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postal_code: '',
    gst_no: '',
    is_active: true
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://187.127.147.245:81/api/organization/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch organization data');
      }

      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        setOrganization(result.data);
        // Initialize edit form with current data
        setEditFormData({
          name: result.data.name || '',
          phone_number: result.data.phone_number || '',
          mobile_number: result.data.mobile_number || '',
          email: result.data.email || '',
          address1: result.data.address1 || '',
          address2: result.data.address2 || '',
          city: result.data.city || '',
          state: result.data.state || '',
          postal_code: result.data.postal_code || '',
          gst_no: result.data.gst_no || '',
          is_active: result.data.is_active !== undefined ? result.data.is_active : true
        });
      } else {
        throw new Error(result.message || 'No organization data found');
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrganization = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Prepare data for PUT request
      const updateData = {
        name: editFormData.name,
        phone_number: parseInt(editFormData.phone_number) || 0,
        mobile_number: parseInt(editFormData.mobile_number) || 0,
        email: editFormData.email,
        address1: editFormData.address1,
        address2: editFormData.address2,
        city: editFormData.city,
        state: editFormData.state,
        postal_code: editFormData.postal_code,
        gst_no: editFormData.gst_no,
        is_active: editFormData.is_active
      };

      const response = await fetch('http://187.127.147.245:81/api/organization/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        // Show success SweetAlert
        Swal.fire({
          title: 'Success!',
          text: 'Organization details updated successfully!',
          icon: 'success',
          confirmButtonColor: '#667eea',
          confirmButtonText: 'OK',
          timer: 3000,
          timerProgressBar: true,
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          }
        });
        
        // Refresh organization data
        await fetchOrganization();
        // Close edit mode after successful update
        setIsEditing(false);
      } else {
        throw new Error(result.message || 'Failed to update organization');
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      // Show error SweetAlert
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to update organization. Please try again.',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Try Again',
        showClass: {
          popup: 'animate__animated animate__shakeX'
        }
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const cancelEdit = () => {
    // Show confirmation before canceling if there are unsaved changes
    const hasChanges = JSON.stringify(editFormData) !== JSON.stringify({
      name: organization?.name || '',
      phone_number: organization?.phone_number || '',
      mobile_number: organization?.mobile_number || '',
      email: organization?.email || '',
      address1: organization?.address1 || '',
      address2: organization?.address2 || '',
      city: organization?.city || '',
      state: organization?.state || '',
      postal_code: organization?.postal_code || '',
      gst_no: organization?.gst_no || '',
      is_active: organization?.is_active !== undefined ? organization?.is_active : true
    });

    if (hasChanges) {
      Swal.fire({
        title: 'Unsaved Changes',
        text: 'You have unsaved changes. Are you sure you want to cancel?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#667eea',
        cancelButtonColor: '#dc3545',
        confirmButtonText: 'Yes, cancel',
        cancelButtonText: 'No, stay'
      }).then((result) => {
        if (result.isConfirmed) {
          // Reset form data to current organization data
          if (organization) {
            setEditFormData({
              name: organization.name || '',
              phone_number: organization.phone_number || '',
              mobile_number: organization.mobile_number || '',
              email: organization.email || '',
              address1: organization.address1 || '',
              address2: organization.address2 || '',
              city: organization.city || '',
              state: organization.state || '',
              postal_code: organization.postal_code || '',
              gst_no: organization.gst_no || '',
              is_active: organization.is_active !== undefined ? organization.is_active : true
            });
          }
          setIsEditing(false);
        }
      });
    } else {
      setIsEditing(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    // Smooth scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="organization-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading organization details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="organization-error">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <h3>Error Loading Organization</h3>
          <p>{error}</p>
          <button onClick={fetchOrganization} className="btn btn-primary">
            <i className="bi bi-arrow-repeat"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="organization-page">
      <Navbar />
      
      <div className="organization-content">
        <div className="container-fluid">
          {/* Header Section */}
          <div className="organization-header">
            <div className="header-badge">
              <i className="bi bi-building"></i>
              <span>Organization Profile</span>
            </div>
            <h1 className="organization-title">
              <i className="bi bi-buildings-fill"></i>
              {isEditing ? 'Edit Organization' : (organization?.name || 'Organization Details')}
            </h1>
            <p className="organization-subtitle">
              {isEditing ? 'Update your organization\'s information' : 'View and manage your organization\'s information'}
            </p>
          </div>

          {/* Main Card */}
          <div className="organization-card">
            {!isEditing ? (
              // View Mode
              <>
                {/* Status Badge */}
                <div className="status-badge">
                  <span className={`badge ${organization?.is_active ? 'bg-success' : 'bg-danger'}`}>
                    <i className={`bi ${organization?.is_active ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
                    {organization?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Organization Name */}
                <div className="org-name-section">
                  <h2>{organization?.name}</h2>
                  <p className="org-id">ID: #{organization?.id}</p>
                </div>

                {/* Contact Information */}
                <div className="info-section">
                  <h3 className="section-title">
                    <i className="bi bi-envelope-paper-fill"></i>
                    Contact Information
                  </h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <i className="bi bi-telephone-fill"></i>
                      <div className="info-details">
                        <label>Phone Number</label>
                        <p>{organization?.phone_number || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <i className="bi bi-phone-fill"></i>
                      <div className="info-details">
                        <label>Mobile Number</label>
                        <p>{organization?.mobile_number || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <i className="bi bi-envelope-fill"></i>
                      <div className="info-details">
                        <label>Email Address</label>
                        <p>{organization?.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="info-section">
                  <h3 className="section-title">
                    <i className="bi bi-geo-alt-fill"></i>
                    Address Information
                  </h3>
                  <div className="address-card">
                    <div className="address-line">
                      <i className="bi bi-house-door-fill"></i>
                      <span>{organization?.address1}</span>
                    </div>
                    {organization?.address2 && (
                      <div className="address-line">
                        <i className="bi bi-building"></i>
                        <span>{organization?.address2}</span>
                      </div>
                    )}
                    <div className="address-line">
                      <i className="bi bi-geo-alt"></i>
                      <span>{organization?.city}, {organization?.state} - {organization?.postal_code}</span>
                    </div>
                  </div>
                </div>

                {/* GST Information */}
                <div className="info-section">
                  <h3 className="section-title">
                    <i className="bi bi-receipt"></i>
                    Tax Information
                  </h3>
                  <div className="gst-card">
                    <i className="bi bi-qr-code"></i>
                    <div className="gst-details">
                      <label>GST Number</label>
                      <p>{organization?.gst_no || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Information - Collapsible */}
                <div className="info-section">
                  <button 
                    className="toggle-details-btn"
                    onClick={() => setShowFullDetails(!showFullDetails)}
                  >
                    <i className={`bi bi-chevron-${showFullDetails ? 'up' : 'down'}`}></i>
                    {showFullDetails ? 'Hide' : 'Show'} Additional Details
                  </button>
                  
                  {showFullDetails && (
                    <div className="additional-details">
                      <div className="detail-item">
                        <label>Created At:</label>
                        <p>{formatDate(organization?.created_at)}</p>
                      </div>
                      <div className="detail-item">
                        <label>Created By:</label>
                        <p>{organization?.created_by_name || 'System'}</p>
                      </div>
                      <div className="detail-item">
                        <label>Last Updated:</label>
                        <p>{formatDate(organization?.updated_at)}</p>
                      </div>
                      <div className="detail-item">
                        <label>Updated By:</label>
                        <p>{organization?.updated_by_name || 'System'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                  <button className="btn btn-primary" onClick={handleEditClick}>
                    <i className="bi bi-pencil-square"></i> Edit Organization
                  </button>
                  <button className="btn btn-outline-primary" onClick={handlePrint}>
                    <i className="bi bi-printer"></i> Print Details
                  </button>
                </div>
              </>
            ) : (
              // Edit Mode
              <form onSubmit={handleUpdateOrganization} className="edit-form">
                <div className="edit-form-section">
                  <h3 className="section-title">
                    <i className="bi bi-building"></i>
                    Basic Information
                  </h3>
                  
                  <div className="form-group">
                    <label htmlFor="name">Organization Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>

                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      className="form-check-input"
                      checked={editFormData.is_active}
                      onChange={handleEditInputChange}
                    />
                    <label className="form-check-label" htmlFor="is_active">
                      Active Status
                    </label>
                  </div>
                </div>

                <div className="edit-form-section">
                  <h3 className="section-title">
                    <i className="bi bi-envelope-paper-fill"></i>
                    Contact Information
                  </h3>
                  
                  <div className="form-group">
                    <label htmlFor="phone_number">Phone Number</label>
                    <input
                      type="number"
                      id="phone_number"
                      name="phone_number"
                      className="form-control"
                      value={editFormData.phone_number}
                      onChange={handleEditInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="mobile_number">Mobile Number</label>
                    <input
                      type="number"
                      id="mobile_number"
                      name="mobile_number"
                      className="form-control"
                      value={editFormData.mobile_number}
                      onChange={handleEditInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      value={editFormData.email}
                      onChange={handleEditInputChange}
                    />
                  </div>
                </div>

                <div className="edit-form-section">
                  <h3 className="section-title">
                    <i className="bi bi-geo-alt-fill"></i>
                    Address Information
                  </h3>
                  
                  <div className="form-group">
                    <label htmlFor="address1">Address Line 1</label>
                    <input
                      type="text"
                      id="address1"
                      name="address1"
                      className="form-control"
                      value={editFormData.address1}
                      onChange={handleEditInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address2">Address Line 2</label>
                    <input
                      type="text"
                      id="address2"
                      name="address2"
                      className="form-control"
                      value={editFormData.address2}
                      onChange={handleEditInputChange}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        className="form-control"
                        value={editFormData.city}
                        onChange={handleEditInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="state">State</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        className="form-control"
                        value={editFormData.state}
                        onChange={handleEditInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="postal_code">Postal Code</label>
                      <input
                        type="text"
                        id="postal_code"
                        name="postal_code"
                        className="form-control"
                        value={editFormData.postal_code}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="edit-form-section">
                  <h3 className="section-title">
                    <i className="bi bi-receipt"></i>
                    Tax Information
                  </h3>
                  
                  <div className="form-group">
                    <label htmlFor="gst_no">GST Number</label>
                    <input
                      type="text"
                      id="gst_no"
                      name="gst_no"
                      className="form-control"
                      value={editFormData.gst_no}
                      onChange={handleEditInputChange}
                    />
                  </div>
                </div>

                <div className="action-buttons">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg"></i> Update Organization
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={cancelEdit}
                    disabled={updateLoading}
                  >
                    <i className="bi bi-x-lg"></i> Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Organization;