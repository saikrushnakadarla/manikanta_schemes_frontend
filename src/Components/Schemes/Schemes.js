import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import Swal from 'sweetalert2';
import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Schemes.css';

function Schemes() {
  const history = useHistory();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://187.127.147.245:81/api/schemes/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch schemes data');
      }

      const result = await response.json();
      
      if (Array.isArray(result)) {
        setSchemes(result);
      } else if (result.status === 'success' && Array.isArray(result.data)) {
        setSchemes(result.data);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching schemes:', error);
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

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleViewDetails = (scheme) => {
    setSelectedScheme(scheme);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedScheme(null);
  };

  const handleAddScheme = () => {
    history.push('/schemesform');
  };

  const handleEditScheme = (scheme) => {
    history.push({
      pathname: '/schemesform',
      state: { schemeData: scheme, isEditMode: true }
    });
  };

  const handleDeleteScheme = (scheme) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete scheme "${scheme.scheme_name}". This action cannot be undone!`,
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
          const response = await fetch(`http://187.127.147.245:81/api/schemes/${scheme.scheme_id}/`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            }
          });

          if (response.ok) {
            await Swal.fire({
              title: 'Deleted!',
              text: 'Scheme has been deleted successfully.',
              icon: 'success',
              confirmButtonColor: '#667eea',
              timer: 2000,
              timerProgressBar: true
            });
            await fetchSchemes();
          } else {
            const result = await response.json();
            throw new Error(result.message || 'Failed to delete scheme');
          }
        } catch (error) {
          console.error('Error deleting scheme:', error);
          Swal.fire({
            title: 'Error!',
            text: error.message || 'Failed to delete scheme. Please try again.',
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
        }
      }
    });
  };

  // Filter schemes based on search term
  const filteredSchemes = schemes.filter(scheme =>
    scheme.scheme_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scheme.scheme_benefit_display?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSchemes = filteredSchemes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSchemes.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="schemes-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading schemes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="schemes-error">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <h3>Error Loading Schemes</h3>
          <p>{error}</p>
          <button onClick={fetchSchemes} className="btn btn-primary">
            <i className="bi bi-arrow-repeat"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="schemes-page">
      <Navbar />
      
      <div className="schemes-content">
        <div className="container-fluid">
          {/* Header Section */}
          <div className="schemes-header">
            <div className="header-badge">
              <i className="bi bi-tags-fill"></i>
              <span>Scheme Management</span>
            </div>
            <h1 className="schemes-title">
              <i className="bi bi-gem-fill"></i>
              Savings Schemes
            </h1>
            <p className="schemes-subtitle">
              Manage and view all savings schemes
            </p>
          </div>

          {/* Stats Cards */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-tags-fill"></i>
              </div>
              <div className="stat-info">
                <h3>{schemes.length}</h3>
                <p>Total Schemes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-cash-stack"></i>
              </div>
              <div className="stat-info">
                <h3>{formatCurrency(schemes.reduce((sum, s) => sum + s.scheme_installment_amount, 0))}</h3>
                <p>Total Investment</p>
              </div>
            </div>
          </div>

          {/* Search and Add Scheme Row */}
          <div className="search-add-container">
            <div className="search-wrapper">
              <div className="search-input-wrapper">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by scheme name or benefit..."
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
            <button className="add-scheme-btn" onClick={handleAddScheme}>
              <i className="bi bi-plus-circle-fill"></i>
              <span>Add Scheme</span>
            </button>
          </div>

          {/* Table View with Horizontal Scroll on Mobile */}
          <div className="table-container">
            <div className="table-responsive-wrapper">
              <table className="schemes-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Scheme Name</th>
                    <th>Maturity Period</th>
                    <th>Installment Amount</th>
                    <th>Payable Installments</th>
                    <th>Benefit</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSchemes.length > 0 ? (
                    currentSchemes.map((scheme, index) => (
                      <tr key={scheme.scheme_id}>
                        <td data-label="S.No">
                          <span className="sno-badge">{indexOfFirstItem + index + 1}</span>
                        </td>
                        <td data-label="Scheme Name">
                          <div className="scheme-name-cell">
                            <div className="scheme-icon">
                              <i className="bi bi-gem-fill"></i>
                            </div>
                            <span className="scheme-name">{scheme.scheme_name || 'N/A'}</span>
                          </div>
                        </td>
                        <td data-label="Maturity Period">
                          <div className="period-info">
                            <i className="bi bi-calendar-week"></i>
                            <span>{scheme.scheme_maturity_period} months</span>
                          </div>
                        </td>
                        <td data-label="Installment Amount">
                          <div className="amount-info">
                            <i className="bi bi-currency-rupee"></i>
                            <span>{formatCurrency(scheme.scheme_installment_amount)}</span>
                          </div>
                        </td>
                        <td data-label="Payable Installments">
                          <div className="installment-info">
                            <i className="bi bi-receipt"></i>
                            <span>{scheme.payable_installments} installments</span>
                          </div>
                        </td>
                        <td data-label="Benefit">
                          <div className="benefit-info">
                            <i className="bi bi-gift-fill"></i>
                            <span>{scheme.x_value}+{scheme.y_value} (Pay {scheme.x_value} get {scheme.y_value} free)</span>
                          </div>
                        </td>
                        <td data-label="Created At">
                          <div className="date-info">
                            <i className="bi bi-calendar3"></i>
                            <span>{formatDate(scheme.created_at)}</span>
                          </div>
                        </td>
                        <td data-label="Actions">
                          <div className="action-buttons-cell">
                            <button 
                              className="edit-btn"
                              onClick={() => handleEditScheme(scheme)}
                              title="Edit Scheme"
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => handleDeleteScheme(scheme)}
                              title="Delete Scheme"
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                            <button 
                              className="view-btn"
                              onClick={() => handleViewDetails(scheme)}
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
                      <td colSpan="8" className="no-data">
                        <div className="no-data-content">
                          <i className="bi bi-inbox-fill"></i>
                          <p>No schemes found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {filteredSchemes.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSchemes.length)} of {filteredSchemes.length} schemes
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

      {/* Scheme Details Modal */}
      {showModal && selectedScheme && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="bi bi-gem-fill"></i>
                Scheme Details
              </h3>
              <button className="close-modal" onClick={closeModal}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-header-info">
                <div className="scheme-icon-large">
                  <i className="bi bi-gem-fill"></i>
                </div>
                <h4>{selectedScheme.scheme_name}</h4>
                <span className="scheme-id-badge">ID: #{selectedScheme.scheme_id}</span>
              </div>
              
              <div className="modal-details">
                <div className="detail-group">
                  <i className="bi bi-calendar-week"></i>
                  <div>
                    <label>Maturity Period</label>
                    <p>{selectedScheme.scheme_maturity_period} months</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-currency-rupee"></i>
                  <div>
                    <label>Installment Amount</label>
                    <p>{formatCurrency(selectedScheme.scheme_installment_amount)}</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-receipt"></i>
                  <div>
                    <label>Payable Installments</label>
                    <p>{selectedScheme.payable_installments} installments</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-gift-fill"></i>
                  <div>
                    <label>Scheme Benefit</label>
                    <p>{selectedScheme.scheme_benefit_display}</p>
                    <p className="benefit-detail">Pay {selectedScheme.x_value} installments, get {selectedScheme.y_value} free</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-calendar-plus-fill"></i>
                  <div>
                    <label>Created At</label>
                    <p>{formatDate(selectedScheme.created_at)}</p>
                  </div>
                </div>
                <div className="detail-group">
                  <i className="bi bi-pencil-square"></i>
                  <div>
                    <label>Last Updated</label>
                    <p>{formatDate(selectedScheme.updated_at)}</p>
                  </div>
                </div>
                {selectedScheme.created_by_name && (
                  <div className="detail-group">
                    <i className="bi bi-person-fill"></i>
                    <div>
                      <label>Created By</label>
                      <p>{selectedScheme.created_by_name}</p>
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

export default Schemes;