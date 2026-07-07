import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import Swal from 'sweetalert2';
import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CustomerSchemesEnrolment.css';
import baseURL from '../URL/NodeBaseURL';

function CustomerSchemesEnrolment() {
  const history = useHistory();
  const [enrollments, setEnrollments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch enrollments
      const enrollmentsResponse = await fetch(`${baseURL}/api/customer-scheme-enrollments/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      if (!enrollmentsResponse.ok) {
        throw new Error('Failed to fetch enrollments data');
      }

      const enrollmentsResult = await enrollmentsResponse.json();
      
      if (Array.isArray(enrollmentsResult)) {
        setEnrollments(enrollmentsResult);
      } else if (enrollmentsResult.status === 'success' && Array.isArray(enrollmentsResult.data)) {
        setEnrollments(enrollmentsResult.data);
      }

      // Fetch customers for dropdown
      const customersResponse = await fetch(`${baseURL}/api/customers/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      if (customersResponse.ok) {
        const customersResult = await customersResponse.json();
        if (Array.isArray(customersResult)) {
          setCustomers(customersResult);
        } else if (customersResult.status === 'success' && Array.isArray(customersResult.data)) {
          setCustomers(customersResult.data);
        }
      }

      // Fetch schemes for dropdown
      const schemesResponse = await fetch(`${baseURL}/api/schemes/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      if (schemesResponse.ok) {
        const schemesResult = await schemesResponse.json();
        if (Array.isArray(schemesResult)) {
          setSchemes(schemesResult);
        } else if (schemesResult.status === 'success' && Array.isArray(schemesResult.data)) {
          setSchemes(schemesResult.data);
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
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
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleViewDetails = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEnrollment(null);
  };

  const handleAddEnrollment = () => {
    history.push('/customerschemesenrolmentform', { customers, schemes });
  };

  const handleEditEnrollment = (enrollment) => {
    history.push({
      pathname: '/customerschemesenrolmentform',
      state: { enrollmentData: enrollment, isEditMode: true, customers, schemes }
    });
  };

  const handleDeleteEnrollment = (enrollment) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete enrollment "${enrollment.enrollment_number}". This action cannot be undone!`,
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
          const response = await fetch(`${baseURL}/api/customer-scheme-enrollments/${enrollment.enrollment_id}/`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            }
          });

          if (response.ok) {
            await Swal.fire({
              title: 'Deleted!',
              text: 'Enrollment has been deleted successfully.',
              icon: 'success',
              confirmButtonColor: '#667eea',
              timer: 2000,
              timerProgressBar: true
            });
            await fetchAllData();
          } else {
            const result = await response.json();
            throw new Error(result.message || 'Failed to delete enrollment');
          }
        } catch (error) {
          console.error('Error deleting enrollment:', error);
          Swal.fire({
            title: 'Error!',
            text: error.message || 'Failed to delete enrollment. Please try again.',
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
        }
      }
    });
  };

  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.scheme_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.enrollment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEnrollments = filteredEnrollments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="enrollments-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading enrollments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="enrollments-error">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <h3>Error Loading Enrollments</h3>
          <p>{error}</p>
          <button onClick={fetchAllData} className="btn btn-primary">
            <i className="bi bi-arrow-repeat"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="enrollments-page">
      <Navbar />
      
      <div className="enrollments-content">
        <div className="container-fluid">
          <div className="enrollments-header">
            <div className="header-badge">
              <i className="bi bi-journal-bookmark-fill"></i>
              <span>Scheme Enrollment</span>
            </div>
            <h1 className="enrollments-title">
              <i className="bi bi-person-plus-fill"></i>
              Customer Scheme Enrollments
            </h1>
            <p className="enrollments-subtitle">
              Manage customer scheme enrollments and track payments
            </p>
          </div>

          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-journal-bookmark-fill"></i>
              </div>
              <div className="stat-info">
                <h3>{enrollments.length}</h3>
                <p>Total Enrollments</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <div className="stat-info">
                <h3>{enrollments.filter(e => e.status === 'active').length}</h3>
                <p>Active Enrollments</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-cash-stack"></i>
              </div>
              <div className="stat-info">
                <h3>{formatCurrency(enrollments.reduce((sum, e) => sum + parseFloat(e.total_paid_amount || 0), 0))}</h3>
                <p>Total Collections</p>
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
                  placeholder="Search by customer, scheme, enrollment number..."
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
            <button className="add-enrollment-btn" onClick={handleAddEnrollment}>
              <i className="bi bi-plus-circle-fill"></i>
              <span>New Enrollment</span>
            </button>
          </div>

          <div className="table-container">
            <div className="table-responsive-wrapper">
              <table className="enrollments-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Enrollment No</th>
                    <th>Customer Name</th>
                    <th>Scheme Name</th>
                    <th>Enrollment Date</th>
                    <th>Maturity Date</th>
                    <th>Installment Amount</th>
                    <th>Paid/Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEnrollments.length > 0 ? (
                    currentEnrollments.map((enrollment, index) => (
                      <tr key={enrollment.enrollment_id}>
                        <td data-label="S.No">
                          <span className="sno-badge">{indexOfFirstItem + index + 1}</span>
                        </td>
                        <td data-label="Enrollment No">
                          <div className="enrollment-number">
                            <i className="bi bi-upc-scan"></i>
                            <span>{enrollment.enrollment_number}</span>
                          </div>
                        </td>
                        <td data-label="Customer Name">
                          <div className="customer-name-cell">
                            <div className="customer-avatar">
                              {enrollment.customer_name?.charAt(0).toUpperCase()}
                            </div>
                            <span>{enrollment.customer_name || 'N/A'}</span>
                          </div>
                        </td>
                        <td data-label="Scheme Name">
                          <div className="scheme-info">
                            <i className="bi bi-gem-fill"></i>
                            <span>{enrollment.scheme_name || 'N/A'}</span>
                          </div>
                        </td>
                        <td data-label="Enrollment Date">
                          <div className="date-info">
                            <i className="bi bi-calendar-check"></i>
                            <span>{formatDate(enrollment.enrollment_date)}</span>
                          </div>
                        </td>
                        <td data-label="Maturity Date">
                          <div className="date-info">
                            <i className="bi bi-calendar-week"></i>
                            <span>{formatDate(enrollment.maturity_date)}</span>
                          </div>
                        </td>
                        <td data-label="Installment Amount">
                          <div className="amount-info">
                            <i className="bi bi-currency-rupee"></i>
                            <span>{formatCurrency(enrollment.installment_amount)}</span>
                          </div>
                        </td>
                        <td data-label="Paid/Total">
                          <div className="progress-info">
                            <span className="installment-count">{enrollment.paid_installments}/{enrollment.total_installments}</span>
                            <div className="progress-bar-custom">
                              <div className="progress-fill" style={{ width: `${(enrollment.paid_installments / enrollment.total_installments) * 100}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td data-label="Status">
                          <span className={`status-badge ${getStatusBadgeClass(enrollment.status)}`}>
                            {enrollment.status || 'active'}
                          </span>
                        </td>
                        <td data-label="Actions">
                          <div className="action-buttons-cell">
                            <button 
                              className="edit-btn"
                              onClick={() => handleEditEnrollment(enrollment)}
                              title="Edit Enrollment"
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => handleDeleteEnrollment(enrollment)}
                              title="Delete Enrollment"
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                            <button 
                              className="view-btn"
                              onClick={() => handleViewDetails(enrollment)}
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
                      <td colSpan="10" className="no-data">
                        <div className="no-data-content">
                          <i className="bi bi-inbox-fill"></i>
                          <p>No enrollments found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {filteredEnrollments.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEnrollments.length)} of {filteredEnrollments.length} enrollments
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

      {/* Enrollment Details Modal */}
      {showModal && selectedEnrollment && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="bi bi-journal-bookmark-fill"></i>
                Enrollment Details
              </h3>
              <button className="close-modal" onClick={closeModal}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-header-info">
                <div className="enrollment-icon-large">
                  <i className="bi bi-upc-scan"></i>
                </div>
                <h4>{selectedEnrollment.enrollment_number}</h4>
                <span className="enrollment-id-badge">ID: #{selectedEnrollment.enrollment_id}</span>
              </div>
              
              <div className="modal-details">
                <div className="detail-group">
                  <i className="bi bi-person-fill"></i>
                  <div>
                    <label>Customer Name</label>
                    <p>{selectedEnrollment.customer_name}</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-gem-fill"></i>
                  <div>
                    <label>Scheme Name</label>
                    <p>{selectedEnrollment.scheme_name}</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-calendar-check"></i>
                  <div>
                    <label>Enrollment Date</label>
                    <p>{formatDate(selectedEnrollment.enrollment_date)}</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-calendar-week"></i>
                  <div>
                    <label>Maturity Date</label>
                    <p>{formatDate(selectedEnrollment.maturity_date)}</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-currency-rupee"></i>
                  <div>
                    <label>Installment Amount</label>
                    <p>{formatCurrency(selectedEnrollment.installment_amount)}</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-receipt"></i>
                  <div>
                    <label>Installments</label>
                    <p>Paid: {selectedEnrollment.paid_installments} / Total: {selectedEnrollment.total_installments}</p>
                    <p>Pending: {selectedEnrollment.pending_installments}</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-cash-stack"></i>
                  <div>
                    <label>Total Paid Amount</label>
                    <p>{formatCurrency(selectedEnrollment.total_paid_amount)}</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-chat-text"></i>
                  <div>
                    <label>Remarks</label>
                    <p>{selectedEnrollment.remarks || 'No remarks'}</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-info-circle"></i>
                  <div>
                    <label>Status</label>
                    <p className={`status-text ${selectedEnrollment.status}`}>{selectedEnrollment.status}</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-clock-history"></i>
                  <div>
                    <label>Created At</label>
                    <p>{formatDate(selectedEnrollment.created_at)}</p>
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

export default CustomerSchemesEnrolment;