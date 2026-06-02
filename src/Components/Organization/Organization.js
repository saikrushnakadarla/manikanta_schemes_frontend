import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Organization.css';

function Organization() {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDetails, setShowFullDetails] = useState(false);

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
              {organization?.name || 'Organization Details'}
            </h1>
            <p className="organization-subtitle">
              View and manage your organization's information
            </p>
          </div>

          {/* Main Card */}
          <div className="organization-card">
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
              <button className="btn btn-primary">
                <i className="bi bi-pencil-square"></i> Edit Organization
              </button>
              <button className="btn btn-outline-primary">
                <i className="bi bi-printer"></i> Print Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Organization;