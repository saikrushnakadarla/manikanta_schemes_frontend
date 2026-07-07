import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SchemesForm.css';
import baseURL from '../URL/NodeBaseURL';

function SchemesForm() {
  const history = useHistory();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [schemeId, setSchemeId] = useState(null);
  const [formData, setFormData] = useState({
    scheme_name: '',
    scheme_maturity_period: '',
    scheme_benefit: 'x_plus_y',
    scheme_installment_amount: '',
    x_value: '',
    y_value: ''
  });

  useEffect(() => {
    // Check if we are in edit mode and have scheme data
    if (location.state && location.state.isEditMode && location.state.schemeData) {
      setIsEditMode(true);
      setSchemeId(location.state.schemeData.scheme_id);
      setFormData({
        scheme_name: location.state.schemeData.scheme_name || '',
        scheme_maturity_period: location.state.schemeData.scheme_maturity_period || '',
        scheme_benefit: location.state.schemeData.scheme_benefit || 'x_plus_y',
        scheme_installment_amount: location.state.schemeData.scheme_installment_amount || '',
        x_value: location.state.schemeData.x_value || '',
        y_value: location.state.schemeData.y_value || ''
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
    if (!formData.scheme_name.trim()) {
      Swal.fire({
        title: 'Error!',
        text: 'Scheme name is required',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
      return false;
    }

    if (!formData.scheme_maturity_period) {
      Swal.fire({
        title: 'Error!',
        text: 'Maturity period is required',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
      return false;
    }

    if (parseInt(formData.scheme_maturity_period) <= 0) {
      Swal.fire({
        title: 'Error!',
        text: 'Maturity period must be greater than 0',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
      return false;
    }

    if (!formData.scheme_installment_amount) {
      Swal.fire({
        title: 'Error!',
        text: 'Installment amount is required',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
      return false;
    }

    if (parseInt(formData.scheme_installment_amount) <= 0) {
      Swal.fire({
        title: 'Error!',
        text: 'Installment amount must be greater than 0',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
      return false;
    }

    if (!formData.x_value) {
      Swal.fire({
        title: 'Error!',
        text: 'X value (payable installments) is required',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
      return false;
    }

    if (parseInt(formData.x_value) <= 0) {
      Swal.fire({
        title: 'Error!',
        text: 'X value must be greater than 0',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
      return false;
    }

    if (!formData.y_value) {
      Swal.fire({
        title: 'Error!',
        text: 'Y value (free installments) is required',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
      return false;
    }

    if (parseInt(formData.y_value) <= 0) {
      Swal.fire({
        title: 'Error!',
        text: 'Y value must be greater than 0',
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
        scheme_name: formData.scheme_name,
        scheme_maturity_period: parseInt(formData.scheme_maturity_period),
        scheme_benefit: formData.scheme_benefit,
        scheme_installment_amount: parseInt(formData.scheme_installment_amount),
        x_value: parseInt(formData.x_value),
        y_value: parseInt(formData.y_value)
      };
      
      let url = `${baseURL}/api/schemes/`;
      let method = 'POST';
      
      if (isEditMode) {
        url = `${baseURL}/api/schemes/${schemeId}/`;
        method = 'PUT';
      }
      
      console.log(`${isEditMode ? 'Updating' : 'Creating'} scheme:`, requestData);
      
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

      if (response.ok && (result.status === 'success' || result.scheme_id)) {
        await Swal.fire({
          title: 'Success!',
          text: isEditMode ? 'Scheme updated successfully!' : 'Scheme created successfully!',
          icon: 'success',
          confirmButtonColor: '#667eea',
          confirmButtonText: 'OK',
          timer: 2000,
          timerProgressBar: true
        });
        
        history.push('/schemes');
      } else {
        let errorMessage = result.message || (isEditMode ? 'Failed to update scheme' : 'Failed to create scheme');
        
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
        text: error.message || (isEditMode ? 'Failed to update scheme. Please try again.' : 'Failed to create scheme. Please try again.'),
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
        history.push('/schemes');
      }
    });
  };

  // Calculate payable installments based on x_value
  const payableInstallments = formData.x_value ? parseInt(formData.x_value) : 0;

  return (
    <div className="schemesform-page">
      <Navbar />
      
      <div className="schemesform-content">
        <div className="container-fluid">
          {/* Header Section */}
          <div className="schemesform-header">
            <div className="header-badge">
              <i className={`bi ${isEditMode ? 'bi-pencil-square' : 'bi-plus-circle-fill'}`}></i>
              <span>{isEditMode ? 'Edit Scheme' : 'Add New Scheme'}</span>
            </div>
            <h1 className="schemesform-title">
              <i className="bi bi-gem-fill"></i>
              {isEditMode ? 'Edit Savings Scheme' : 'Create Savings Scheme'}
            </h1>
            <p className="schemesform-subtitle">
              {isEditMode ? 'Update scheme information' : 'Fill in the details to add a new savings scheme'}
            </p>
          </div>

          {/* Form Card */}
          <div className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="scheme_name">
                  <i className="bi bi-tag-fill"></i>
                  Scheme Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="scheme_name"
                  name="scheme_name"
                  className="form-control"
                  placeholder="Enter scheme name (e.g., Gold Saver 10+1)"
                  value={formData.scheme_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="scheme_maturity_period">
                    <i className="bi bi-calendar-week"></i>
                    Maturity Period <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="scheme_maturity_period"
                    name="scheme_maturity_period"
                    className="form-control"
                    placeholder="Enter maturity period"
                    value={formData.scheme_maturity_period}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                  <small className="form-text text-muted">Duration in months</small>
                </div>

                <div className="form-group">
                  <label htmlFor="scheme_installment_amount">
                    <i className="bi bi-currency-rupee"></i>
                    Installment Amount <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="scheme_installment_amount"
                    name="scheme_installment_amount"
                    className="form-control"
                    placeholder="Enter installment amount"
                    value={formData.scheme_installment_amount}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                  <small className="form-text text-muted">Amount per installment (in INR)</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="x_value">
                    <i className="bi bi-receipt"></i>
                    Payable Installments (X) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="x_value"
                    name="x_value"
                    className="form-control"
                    placeholder="Enter number of installments to pay"
                    value={formData.x_value}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                  <small className="form-text text-muted">Number of installments customer needs to pay</small>
                </div>

                <div className="form-group">
                  <label htmlFor="y_value">
                    <i className="bi bi-gift-fill"></i>
                    Free Installments (Y) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="y_value"
                    name="y_value"
                    className="form-control"
                    placeholder="Enter number of free installments"
                    value={formData.y_value}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                  <small className="form-text text-muted">Number of free installments customer gets</small>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="scheme_benefit">
                  <i className="bi bi-graph-up"></i>
                  Scheme Benefit Type <span className="required">*</span>
                </label>
                <select
                  id="scheme_benefit"
                  name="scheme_benefit"
                  className="form-control"
                  value={formData.scheme_benefit}
                  onChange={handleInputChange}
                  required
                >
                  <option value="x_plus_y">X+Y Installments (Pay X + Get Y Free)</option>
                  <option value="no_wastage">No Wastage</option>
                </select>
              </div>

              {/* Summary Card */}
              <div className="summary-card">
                <h4>
                  <i className="bi bi-info-circle-fill"></i>
                  Scheme Summary
                </h4>
                <div className="summary-details">
                  <div className="summary-item">
                    <span className="summary-label">Scheme Name:</span>
                    <span className="summary-value">{formData.scheme_name || 'Not specified'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total Duration:</span>
                    <span className="summary-value">{formData.scheme_maturity_period || '0'} months</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Installment Amount:</span>
                    <span className="summary-value">₹{formData.scheme_installment_amount || '0'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Payable Installments:</span>
                    <span className="summary-value">{payableInstallments} installments</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Free Installments:</span>
                    <span className="summary-value">{formData.y_value || '0'} installments</span>
                  </div>
                  <div className="summary-item highlight">
                    <span className="summary-label">Total Payment:</span>
                    <span className="summary-value">₹{payableInstallments * (parseInt(formData.scheme_installment_amount) || 0)}</span>
                  </div>
                  <div className="summary-item highlight">
                    <span className="summary-label">Total Benefit:</span>
                    <span className="summary-value">₹{(parseInt(formData.y_value) || 0) * (parseInt(formData.scheme_installment_amount) || 0)}</span>
                  </div>
                </div>
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
                      {isEditMode ? 'Update Scheme' : 'Create Scheme'}
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

export default SchemesForm;