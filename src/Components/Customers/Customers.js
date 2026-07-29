import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useHistory } from 'react-router-dom';
import './Customers.css';
import baseURL from '../URL/NodeBaseURL';

function Customers() {
  const history = useHistory();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/customers/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers data');
      }

      const result = await response.json();

      // Handle both array and object responses
      let customersData = [];
      if (Array.isArray(result)) {
        customersData = result;
      } else if (result.status === 'success' && Array.isArray(result.data)) {
        customersData = result.data;
      } else if (result.data && Array.isArray(result.data)) {
        customersData = result.data;
      } else {
        throw new Error('Invalid data format received');
      }

      // Transform the data to match expected structure
      const transformedCustomers = customersData.map(customer => ({
        id: customer.account_id,
        name: customer.account_name || customer.print_name || 'N/A',
        print_name: customer.print_name,
        account_group: customer.account_group,
        email: customer.email || 'N/A',
        phone_number: customer.phone || customer.mobile || 'N/A',
        mobile: customer.mobile,
        city: customer.city || 'N/A',
        pincode: customer.pincode || 'N/A',
        state: customer.state || 'N/A',
        address: customer.address1 || customer.address2 || 'N/A',
        address1: customer.address1,
        address2: customer.address2,
        aadhaar_number: customer.aadhar_card || 'N/A',
        pan_number: customer.pan_card || 'N/A',
        kyc_status: customer.kyc_status || 'pending',
        customer_status: customer.account_group === 'Customers' ? 'active' : 'active',
        join_date: customer.joining_date || customer.created_at || null,
        created_at: customer.created_at,
        anniversary: customer.anniversary,
        birthday: customer.birthday,
        // Additional fields
        op_bal: customer.op_bal,
        metal_balance: customer.metal_balance,
        dr_cr: customer.dr_cr,
        state_code: customer.state_code,
        contact_person: customer.contact_person,
        bank_account_no: customer.bank_account_no,
        bank_name: customer.bank_name,
        ifsc_code: customer.ifsc_code,
        branch: customer.branch,
        gst_in: customer.gst_in,
        religion: customer.religion,
        images: customer.images,
        aadhaar_document: customer.aadhaar_document,
        pan_document: customer.pan_document,
        verified_by: customer.verified_by,
        rejection_reason: customer.rejection_reason,
        referred_person_name: customer.referred_person_name,
        referred_person_id: customer.referred_person_id,
        referred_person_referral_code: customer.referred_person_referral_code,
        customer_referral_code: customer.customer_referral_code,
        nominee_name: customer.nominee_name,
        nominee_email: customer.nominee_email,
        nominee_phone_number: customer.nominee_phone_number,
        relationship: customer.relationship,
        nominee_aadhaar_number: customer.nominee_aadhaar_number,
        nominee_pan_number: customer.nominee_pan_number,
        remarks: customer.remarks
      }));

      setCustomers(transformedCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'status-default';
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'pending': return 'status-pending';
      default: return 'status-default';
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };

  const handleAddCustomer = () => {
    history.push('/customersform');
  };

  const handleEditCustomer = (customer) => {
    history.push({
      pathname: '/customersform',
      state: { customerData: customer, isEditMode: true }
    });
  };

  // Add this function to handle navigation to schemes page
  const handleViewSchemes = (customer) => {
    // Store customer ID in localStorage for the schemes page to use
    localStorage.setItem('selectedCustomerId', customer.id);
    localStorage.setItem('selectedCustomerName', customer.name);

    // Navigate to schemes page with customer data
    history.push({
      pathname: '/customer_schemes',
      state: {
        customerId: customer.id,
        customerName: customer.name,
        customerData: customer
      }
    });
  };


  const handleDeleteCustomer = (customer) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete customer "${customer.name}". This action cannot be undone!`,
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
          const response = await fetch(`${baseURL}/api/customers/${customer.id}/`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            }
          });

          if (response.ok) {
            await Swal.fire({
              title: 'Deleted!',
              text: 'Customer has been deleted successfully.',
              icon: 'success',
              confirmButtonColor: '#667eea',
              timer: 2000,
              timerProgressBar: true
            });
            await fetchCustomers();
          } else {
            const result = await response.json();
            throw new Error(result.message || 'Failed to delete customer');
          }
        } catch (error) {
          console.error('Error deleting customer:', error);
          Swal.fire({
            title: 'Error!',
            text: error.message || 'Failed to delete customer. Please try again.',
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
        }
      }
    });
  };

  const handleUpdateCustomer = async (customer) => {
    Swal.fire({
      title: 'Update Customer',
      text: `Update information for "${customer.name}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Yes, edit',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        handleEditCustomer(customer);
      }
    });
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone_number?.includes(searchTerm) ||
      customer.city?.toLowerCase().includes(searchLower) ||
      customer.state?.toLowerCase().includes(searchLower) ||
      customer.print_name?.toLowerCase().includes(searchLower)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="customers-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="customers-error">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <h3>Error Loading Customers</h3>
          <p>{error}</p>
          <button onClick={fetchCustomers} className="btn btn-primary">
            <i className="bi bi-arrow-repeat"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customers-page">
      <Navbar />

      <div className="customers-content">
        <div className="container-fluid">
          <div className="customers-header">
            <div className="header-badge">
              <i className="bi bi-people-fill"></i>
              <span>Customer Management</span>
            </div>
            <h1 className="customers-title">
              <i className="bi bi-person-badge-fill"></i>
              Customers List
            </h1>
            <p className="customers-subtitle">
              Manage and view all registered customers
            </p>
          </div>

          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-people-fill"></i>
              </div>
              <div className="stat-info">
                <h3>{customers.length}</h3>
                <p>Total Customers</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <div className="stat-info">
                <h3>{customers.filter(c => c.customer_status === 'active').length}</h3>
                <p>Active Customers</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-hourglass-split"></i>
              </div>
              <div className="stat-info">
                <h3>{customers.filter(c => c.kyc_status === 'pending').length}</h3>
                <p>KYC Pending</p>
              </div>
            </div>
          </div>

          <div className="search-add-container">
            <div className="search-wrapper">
              <div className="search-input-wrapper">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name, email, phone or city..."
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
            <button className="add-customer-btn" onClick={handleAddCustomer}>
              <i className="bi bi-person-plus-fill"></i>
              <span>Add Customer</span>
            </button>
          </div>

          <div className="table-container">
            <div className="table-responsive-wrapper">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>KYC Status</th>
                    <th>Customer Status</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCustomers.length > 0 ? (
                    currentCustomers.map((customer, index) => (
                      <tr key={customer.id}>
                        <td data-label="S.No">
                          <span className="sno-badge">{indexOfFirstItem + index + 1}</span>
                        </td>
                        <td data-label="Name">
                          <div className="customer-name-cell">
                            <div className="customer-avatar">
                              {customer.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <span className="customer-name">{customer.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td data-label="Email">
                          <a href={`mailto:${customer.email}`} className="email-link">
                            <i className="bi bi-envelope-fill"></i>
                            <span>{customer.email || 'N/A'}</span>
                          </a>
                        </td>
                        <td data-label="Phone">
                          <a href={`tel:${customer.phone_number}`} className="phone-link">
                            <i className="bi bi-telephone-fill"></i>
                            <span>{customer.phone_number || 'N/A'}</span>
                          </a>
                        </td>
                        <td data-label="City">
                          <div className="city-info">
                            <i className="bi bi-geo-alt-fill"></i>
                            <span>{customer.city || 'N/A'}</span>
                          </div>
                        </td>
                        <td data-label="KYC Status">
                          <span className={`kyc-status-badge ${customer.kyc_status || 'pending'}`}>
                            {customer.kyc_status || 'pending'}
                          </span>
                        </td>
                        <td data-label="Customer Status">
                          <span className={`customer-status-badge ${getStatusBadgeClass(customer.customer_status)}`}>
                            {customer.customer_status || 'active'}
                          </span>
                        </td>
                        <td data-label="Join Date">
                          <div className="date-info">
                            <i className="bi bi-calendar3"></i>
                            <span>{formatDate(customer.join_date || customer.created_at)}</span>
                          </div>
                        </td>
                        <td data-label="Actions">
                          <div className="action-buttons-cell">
                            <button
                              className="edit-btn"
                              onClick={() => handleUpdateCustomer(customer)}
                              title="Edit Customer"
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteCustomer(customer)}
                              title="Delete Customer"
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                            <button
                              className="view-btn"
                              onClick={() => handleViewDetails(customer)}
                              title="View Details"
                            >
                              <i className="bi bi-eye-fill"></i>
                            </button>

                            <button
                              className="schemes-btn"
                              onClick={() => handleViewSchemes(customer)}
                              title="View Enrolled Schemes"
                            >
                              <i className="bi bi-journal-bookmark-fill"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="no-data">
                        <div className="no-data-content">
                          <i className="bi bi-inbox-fill"></i>
                          <p>No customers found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {filteredCustomers.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length} customers
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

      {/* Customer Details Modal */}
      {showModal && selectedCustomer && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="bi bi-person-circle"></i>
                Customer Details
              </h3>
              <button className="close-modal" onClick={closeModal}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-avatar">
                <div className="large-avatar">
                  {selectedCustomer.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <h4>{selectedCustomer.name || 'N/A'}</h4>
                <span className="customer-id-badge">ID: #{selectedCustomer.id}</span>
              </div>

              <div className="modal-details">
                <div className="detail-group">
                  <i className="bi bi-envelope-fill"></i>
                  <div>
                    <label>Email Address</label>
                    <p>{selectedCustomer.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-telephone-fill"></i>
                  <div>
                    <label>Phone Number</label>
                    <p>{selectedCustomer.phone_number || 'N/A'}</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-geo-alt-fill"></i>
                  <div>
                    <label>Address</label>
                    <p>{selectedCustomer.address || 'N/A'}</p>
                    {selectedCustomer.city && selectedCustomer.pincode && (
                      <p>{selectedCustomer.city}, {selectedCustomer.state} - {selectedCustomer.pincode}</p>
                    )}
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-credit-card"></i>
                  <div>
                    <label>Aadhaar Number</label>
                    <p>{selectedCustomer.aadhaar_number || 'N/A'}</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-card-list"></i>
                  <div>
                    <label>PAN Number</label>
                    <p>{selectedCustomer.pan_number || 'N/A'}</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-shield-check"></i>
                  <div>
                    <label>KYC Status</label>
                    <p className={`status-text ${selectedCustomer.kyc_status || 'pending'}`}>
                      {selectedCustomer.kyc_status || 'pending'}
                    </p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-person-check"></i>
                  <div>
                    <label>Customer Status</label>
                    <p className={`status-text ${selectedCustomer.customer_status || 'active'}`}>
                      {selectedCustomer.customer_status || 'active'}
                    </p>
                  </div>
                </div>
                {selectedCustomer.join_date && (
                  <div className="detail-group">
                    <i className="bi bi-calendar-plus-fill"></i>
                    <div>
                      <label>Join Date</label>
                      <p>{formatDate(selectedCustomer.join_date)}</p>
                    </div>
                  </div>
                )}
                {selectedCustomer.anniversary && (
                  <div className="detail-group">
                    <i className="bi bi-heart-fill"></i>
                    <div>
                      <label>Anniversary</label>
                      <p>{formatDate(selectedCustomer.anniversary)}</p>
                    </div>
                  </div>
                )}
                {selectedCustomer.birthday && (
                  <div className="detail-group">
                    <i className="bi bi-gift-fill"></i>
                    <div>
                      <label>Birthday</label>
                      <p>{formatDate(selectedCustomer.birthday)}</p>
                    </div>
                  </div>
                )}
                <div className="detail-group">
                  <i className="bi bi-clock-history"></i>
                  <div>
                    <label>Created At</label>
                    <p>{formatDate(selectedCustomer.created_at)}</p>
                  </div>
                </div>
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

export default Customers;