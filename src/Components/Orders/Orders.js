import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import './Orders.css';
import baseURL from '../URL/NodeBaseURL';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  const [fetchingCustomers, setFetchingCustomers] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || '';
      
      const response = await fetch(`${baseURL}/api/payment-transactions/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data || []);
        setSummary(data.summary);
        
        // Fetch customer details for each unique customer
        const uniqueCustomerIds = [...new Set(data.data.map(order => order.customer_id))];
        console.log('Unique Customer IDs:', uniqueCustomerIds);
        await fetchCustomerDetails(uniqueCustomerIds);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (customerIds) => {
    try {
      setFetchingCustomers(true);
      const token = localStorage.getItem('token') || '';
      const customerData = {};
      
      for (const customerId of customerIds) {
        try {
          console.log(`Fetching customer details for ID: ${customerId}`);
          // Added trailing slash to the URL
          const response = await fetch(`${baseURL}/api/customers/${customerId}/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`Customer ${customerId} data:`, data);
            customerData[customerId] = data;
          } else {
            console.error(`Failed to fetch customer ${customerId}:`, response.status);
            // Try without trailing slash as fallback
            try {
              const fallbackResponse = await fetch(`${baseURL}/api/customers/${customerId}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
              });
              if (fallbackResponse.ok) {
                const data = await fallbackResponse.json();
                console.log(`Customer ${customerId} data (fallback):`, data);
                customerData[customerId] = data;
              }
            } catch (fallbackErr) {
              console.error(`Fallback failed for customer ${customerId}:`, fallbackErr);
            }
          }
        } catch (err) {
          console.error(`Error fetching customer ${customerId}:`, err);
        }
      }
      
      console.log('All customer details:', customerData);
      setCustomerDetails(customerData);
    } catch (err) {
      console.error('Error fetching customer details:', err);
    } finally {
      setFetchingCustomers(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      success: 'success-badge',
      paid: 'success-badge',
      pending: 'pending-badge',
      failed: 'failed-badge',
      refunded: 'refunded-badge'
    };
    return colors[status?.toLowerCase()] || 'default-badge';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const toggleCustomerOrders = (customerId) => {
    setSelectedCustomer(selectedCustomer === customerId ? null : customerId);
  };

  const toggleOrderDetails = (orderId, e) => {
    e.stopPropagation();
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Get customer name with proper fallback
  const getCustomerName = (customerId) => {
    const customer = customerDetails[customerId];
    if (customer) {
      // Try print_name first, then account_name, then fallback
      const name = customer.print_name || customer.account_name || null;
      if (name) {
        return name;
      }
    }
    return `Customer #${customerId}`;
  };

  // Get customer email with fallback
  const getCustomerEmail = (customerId) => {
    const customer = customerDetails[customerId];
    return customer?.email || null;
  };

  // Get customer mobile with fallback
  const getCustomerMobile = (customerId) => {
    const customer = customerDetails[customerId];
    return customer?.mobile || null;
  };

  // Get customer phone with fallback
  const getCustomerPhone = (customerId) => {
    const customer = customerDetails[customerId];
    return customer?.phone || null;
  };

  // Group orders by customer
  const groupOrdersByCustomer = () => {
    const grouped = {};
    orders.forEach(order => {
      if (!grouped[order.customer_id]) {
        grouped[order.customer_id] = [];
      }
      grouped[order.customer_id].push(order);
    });
    return grouped;
  };

  const groupedOrders = groupOrdersByCustomer();

  if (loading) {
    return (
      <div className="orders-container">
        <Navbar />
        <div className="orders-loading">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <Navbar />
        <div className="orders-error">
          <div className="error-icon">⚠️</div>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button onClick={fetchOrders} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <Navbar />
      
      <div className="orders-content">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p className="orders-subtitle">Track and manage your orders</p>
        </div>

        {summary && (
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-card-icon">📦</div>
              <div className="summary-card-content">
                <span className="summary-card-value">{summary.total_transactions || 0}</span>
                <span className="summary-card-label">Total Orders</span>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-card-icon">💰</div>
              <div className="summary-card-content">
                <span className="summary-card-value">{formatCurrency(summary.total_amount || 0)}</span>
                <span className="summary-card-label">Total Amount</span>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-card-icon">👤</div>
              <div className="summary-card-content">
                <span className="summary-card-value">{Object.keys(groupedOrders).length}</span>
                <span className="summary-card-label">Customers</span>
              </div>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">🛒</div>
            <h3>No Orders Found</h3>
            <p>You haven't placed any orders yet.</p>
            <button className="shop-now-btn" onClick={() => window.location.href = '/dashboard'}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="customers-list">
            {Object.entries(groupedOrders).map(([customerId, customerOrders]) => {
              const isExpanded = selectedCustomer === parseInt(customerId);
              const totalAmount = customerOrders.reduce((sum, order) => sum + parseFloat(order.amount), 0);
              const customerName = getCustomerName(parseInt(customerId));
              const customerEmail = getCustomerEmail(parseInt(customerId));
              const customerMobile = getCustomerMobile(parseInt(customerId));
              const customerPhone = getCustomerPhone(parseInt(customerId));
              
              return (
                <div key={customerId} className="customer-card">
                  <div 
                    className="customer-card-header"
                    onClick={() => toggleCustomerOrders(parseInt(customerId))}
                  >
                    <div className="customer-info">
                      <div className="customer-avatar">
                        {customerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="customer-details">
                        <div className="customer-name">
                          {customerName}
                        </div>
                        <div className="customer-meta">
                          <span className="meta-item">
                            <i className="bi bi-person"></i>
                            ID: {customerId}
                          </span>
                          {customerEmail && (
                            <span className="meta-item">
                              <i className="bi bi-envelope"></i>
                              {customerEmail}
                            </span>
                          )}
                          {(customerMobile || customerPhone) && (
                            <span className="meta-item">
                              <i className="bi bi-phone"></i>
                              {customerMobile || customerPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="customer-stats">
                      <div className="stat-item">
                        <span className="stat-value">{customerOrders.length}</span>
                        <span className="stat-label">Orders</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{formatCurrency(totalAmount)}</span>
                        <span className="stat-label">Total</span>
                      </div>
                      <div className="expand-icon">
                        {isExpanded ? '▲' : '▼'}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="customer-orders">
                      {customerOrders.map((order, index) => (
                        <div key={order.payment_transaction_id} className="order-item">
                          <div 
                            className="order-item-header"
                            onClick={(e) => toggleOrderDetails(order.payment_transaction_id, e)}
                          >
                            <div className="order-item-left">
                              <span className="order-number-badge">#{index + 1}</span>
                              <span className="order-number-text">{order.order_number}</span>
                            </div>
                            <div className="order-item-right">
                              <span className="order-amount-small">{formatCurrency(order.amount)}</span>
                              <div className={`status-badge ${getStatusBadge(order.transaction_status)}`}>
                                {order.transaction_status || 'Pending'}
                              </div>
                              <div className="expand-icon-small">
                                {expandedOrders[order.payment_transaction_id] ? '▲' : '▼'}
                              </div>
                            </div>
                          </div>

                          {expandedOrders[order.payment_transaction_id] && (
                            <div className="order-item-details">
                              <div className="order-detail-grid">
                                <div className="order-detail-row">
                                  <span className="detail-label">Order ID</span>
                                  <span className="detail-value">{order.order_id}</span>
                                </div>
                                <div className="order-detail-row">
                                  <span className="detail-label">Date</span>
                                  <span className="detail-value">{formatDate(order.created_at)}</span>
                                </div>
                                <div className="order-detail-row">
                                  <span className="detail-label">Payment Method</span>
                                  <span className="detail-value">{order.payment_method || 'N/A'}</span>
                                </div>
                                <div className="order-detail-row">
                                  <span className="detail-label">Payment Mode</span>
                                  <span className="detail-value">{order.payment_mode || 'N/A'}</span>
                                </div>
                                <div className="order-detail-row">
                                  <span className="detail-label">Payment Status</span>
                                  <span className="detail-value">{order.payment_status || 'N/A'}</span>
                                </div>
                                <div className="order-detail-row">
                                  <span className="detail-label">Currency</span>
                                  <span className="detail-value">{order.currency || 'INR'}</span>
                                </div>
                                {order.razorpay_order_id && (
                                  <div className="order-detail-row">
                                    <span className="detail-label">Razorpay Order ID</span>
                                    <span className="detail-value">{order.razorpay_order_id}</span>
                                  </div>
                                )}
                                {order.razorpay_payment_id && (
                                  <div className="order-detail-row">
                                    <span className="detail-label">Razorpay Payment ID</span>
                                    <span className="detail-value">{order.razorpay_payment_id}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;