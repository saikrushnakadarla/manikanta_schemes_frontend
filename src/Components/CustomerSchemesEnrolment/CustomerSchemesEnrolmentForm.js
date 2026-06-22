import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CustomerSchemesEnrolment.css';

function CustomerSchemesEnrolmentForm() {
  const history = useHistory();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [schemes, setSchemes] = useState([]);
  
  const [formData, setFormData] = useState({
    customer: '',
    scheme: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    remarks: '',
    status: 'active'
  });

  const [selectedSchemeDetails, setSelectedSchemeDetails] = useState(null);

  useEffect(() => {
    // Get customers and schemes from location state or fetch them
    if (location.state) {
      if (location.state.customers) setCustomers(location.state.customers);
      if (location.state.schemes) setSchemes(location.state.schemes);
      
      if (location.state.isEditMode && location.state.enrollmentData) {
        setIsEditMode(true);
        setEnrollmentId(location.state.enrollmentData.enrollment_id);
        setFormData({
          customer: location.state.enrollmentData.customer || '',
          scheme: location.state.enrollmentData.scheme || '',
          enrollment_date: location.state.enrollmentData.enrollment_date || new Date().toISOString().split('T')[0],
          remarks: location.state.enrollmentData.remarks || '',
          status: location.state.enrollmentData.status || 'active'
        });
        
        // Find and set scheme details
        const scheme = schemes.find(s => s.scheme_id === location.state.enrollmentData.scheme);
        if (scheme) setSelectedSchemeDetails(scheme);
      }
    }
    
    // Fetch customers and schemes if not provided
    fetchData();
  }, [location]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (customers.length === 0) {
        const customersResponse = await fetch('http://187.127.147.245:81/api/customers/', {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        if (customersResponse.ok) {
          const result = await customersResponse.json();
          setCustomers(Array.isArray(result) ? result : (result.data || []));
        }
      }
      
      if (schemes.length === 0) {
        const schemesResponse = await fetch('http://187.127.147.245:81/api/schemes/', {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        if (schemesResponse.ok) {
          const result = await schemesResponse.json();
          setSchemes(Array.isArray(result) ? result : (result.data || []));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === 'scheme') {
      const scheme = schemes.find(s => s.scheme_id === parseInt(value));
      setSelectedSchemeDetails(scheme);
    }
  };

  const calculateMaturityDate = (enrollmentDate, maturityPeriod) => {
    const date = new Date(enrollmentDate);
    date.setMonth(date.getMonth() + maturityPeriod);
    return date.toISOString().split('T')[0];
  };

  const generateEnrollmentNumber = () => {
    return 'ENR' + Date.now().toString().slice(-8);
  };

  const validateForm = () => {
    if (!formData.customer) {
      Swal.fire({ title: 'Error!', text: 'Please select a customer', icon: 'error', confirmButtonColor: '#dc3545' });
      return false;
    }
    if (!formData.scheme) {
      Swal.fire({ title: 'Error!', text: 'Please select a scheme', icon: 'error', confirmButtonColor: '#dc3545' });
      return false;
    }
    if (!formData.enrollment_date) {
      Swal.fire({ title: 'Error!', text: 'Enrollment date is required', icon: 'error', confirmButtonColor: '#dc3545' });
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
      const selectedScheme = schemes.find(s => s.scheme_id === parseInt(formData.scheme));
      const selectedCustomer = customers.find(c => c.id === parseInt(formData.customer));
      
      if (!selectedScheme || !selectedCustomer) {
        throw new Error('Invalid customer or scheme selected');
      }
      
      const maturityDate = calculateMaturityDate(formData.enrollment_date, selectedScheme.scheme_maturity_period);
      const enrollmentNumber = isEditMode ? undefined : generateEnrollmentNumber();
      
      const requestData = {
        customer: parseInt(formData.customer),
        scheme: parseInt(formData.scheme),
        enrollment_date: formData.enrollment_date,
        maturity_date: maturityDate,
        remarks: formData.remarks,
        status: formData.status,
        enrollment_number: enrollmentNumber,
        paid_installments: isEditMode ? (formData.paid_installments || 0) : 0,
        total_paid_amount: isEditMode ? (formData.total_paid_amount || 0) : 0
      };
      
      let url = 'http://187.127.147.245:81/api/customer-scheme-enrollments/';
      let method = 'POST';
      let successMessage = 'Customer enrolled in scheme successfully!';
      
      if (isEditMode) {
        url = `http://187.127.147.245:81/api/customer-scheme-enrollments/${enrollmentId}/`;
        method = 'PUT';
        successMessage = 'Enrollment updated successfully!';
      }
      
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
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Server returned: ${responseText.substring(0, 200)}`);
      }

      if (response.ok) {
        await Swal.fire({
          title: 'Success!',
          text: successMessage,
          icon: 'success',
          confirmButtonColor: '#667eea',
          timer: 2000,
          timerProgressBar: true
        });
        history.push('/customerschemesenrolment');
      } else {
        throw new Error(result.message || (isEditMode ? 'Failed to update enrollment' : 'Failed to create enrollment'));
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#dc3545'
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
        history.push('/customerschemesenrolment');
      }
    });
  };

  return (
    <div className="enrollment-form-page">
      <Navbar />
      
      <div className="enrollment-form-content">
        <div className="container-fluid">
          <div className="enrollment-form-header">
            <div className="header-badge">
              <i className={`bi ${isEditMode ? 'bi-pencil-square' : 'bi-plus-circle-fill'}`}></i>
              <span>{isEditMode ? 'Edit Enrollment' : 'New Scheme Enrollment'}</span>
            </div>
            <h1 className="enrollment-form-title">
              <i className="bi bi-journal-bookmark-fill"></i>
              {isEditMode ? 'Edit Enrollment' : 'Customer Scheme Enrollment'}
            </h1>
            <p className="enrollment-form-subtitle">
              {isEditMode ? 'Update enrollment details' : 'Enroll a customer in a savings scheme'}
            </p>
          </div>

          <div className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Customer <span className="required">*</span></label>
                <select name="customer" className="form-control" value={formData.customer} onChange={handleInputChange} required disabled={isEditMode}>
                  <option value="">-- Select Customer --</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone_number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Scheme <span className="required">*</span></label>
                <select name="scheme" className="form-control" value={formData.scheme} onChange={handleInputChange} required disabled={isEditMode}>
                  <option value="">-- Select Scheme --</option>
                  {schemes.map(scheme => (
                    <option key={scheme.scheme_id} value={scheme.scheme_id}>
                      {scheme.scheme_name} - {scheme.x_value}+{scheme.y_value} (Pay {scheme.x_value} get {scheme.y_value} free)
                    </option>
                  ))}
                </select>
              </div>

              {selectedSchemeDetails && (
                <div className="scheme-details-card">
                  <h4>Scheme Benefits</h4>
                  <div className="scheme-details-grid">
                    <div className="scheme-detail-item">
                      <label>Maturity Period:</label>
                      <span>{selectedSchemeDetails.scheme_maturity_period} months</span>
                    </div>
                    <div className="scheme-detail-item">
                      <label>Installment Amount:</label>
                      <span>₹{selectedSchemeDetails.scheme_installment_amount}</span>
                    </div>
                    <div className="scheme-detail-item">
                      <label>Payable Installments:</label>
                      <span>{selectedSchemeDetails.x_value} installments</span>
                    </div>
                    <div className="scheme-detail-item">
                      <label>Free Installments:</label>
                      <span>{selectedSchemeDetails.y_value} installments</span>
                    </div>
                    <div className="scheme-detail-item highlight">
                      <label>Total Benefit:</label>
                      <span>₹{selectedSchemeDetails.y_value * selectedSchemeDetails.scheme_installment_amount}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Enrollment Date <span className="required">*</span></label>
                  <input type="date" name="enrollment_date" className="form-control" value={formData.enrollment_date} onChange={handleInputChange} required />
                </div>
                {selectedSchemeDetails && (
                  <div className="form-group">
                    <label>Maturity Date</label>
                    <input type="date" className="form-control" value={calculateMaturityDate(formData.enrollment_date, selectedSchemeDetails.scheme_maturity_period)} disabled readOnly />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" className="form-control" value={formData.status} onChange={handleInputChange}>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label>Remarks</label>
                <textarea name="remarks" className="form-control" rows="3" placeholder="Any additional remarks" value={formData.remarks} onChange={handleInputChange}></textarea>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm"></span> Processing...</>
                  ) : (
                    <>{isEditMode ? 'Update Enrollment' : 'Enroll Customer'}</>
                  )}
                </button>
                <button type="button" className="btn-cancel" onClick={handleCancel}>
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

export default CustomerSchemesEnrolmentForm;