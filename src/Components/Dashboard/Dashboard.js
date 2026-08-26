import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
// import Footer from '../';
import baseURL from '../URL/NodeBaseURL';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    products: { total: 0, sold: 0, available: 0 },
    customers: 0,
    orders: 0,
    schemes: 0,
    payments: { totalAmount: 0, count: 0 }
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products
      const productsRes = await fetch(`${baseURL}/api/opening-tags/`);
      const productsData = await productsRes.json();
      
      // Count products by status
      const productStatusCount = productsData.data?.reduce((acc, item) => {
        const status = item.status || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      const totalProducts = productsData.data?.length || 0;
      const soldProducts = productStatusCount?.Sold || 0;
      const availableProducts = productStatusCount?.Available || 0;

      // Fetch customers
      const customersRes = await fetch(`${baseURL}/api/customers/`);
      const customersData = await customersRes.json();
      const totalCustomers = Array.isArray(customersData) ? customersData.length : 0;

      // Fetch orders
      const ordersRes = await fetch(`${baseURL}/api/orders/`);
      const ordersData = await ordersRes.json();
      const totalOrders = Array.isArray(ordersData) ? ordersData.length : 0;
      const recent = Array.isArray(ordersData) ? ordersData.slice(0, 5) : [];

      // Fetch schemes
      const schemesRes = await fetch(`${baseURL}/api/schemes/`);
      const schemesData = await schemesRes.json();
      const totalSchemes = Array.isArray(schemesData) ? schemesData.length : 0;

      // Fetch payments
      const paymentsRes = await fetch(`${baseURL}/api/payment-transactions/`);
      const paymentsData = await paymentsRes.json();
      const totalPayments = paymentsData?.summary?.total_transactions || 0;
      const totalAmount = parseFloat(paymentsData?.summary?.total_amount || 0);

      setDashboardData({
        products: { total: totalProducts, sold: soldProducts, available: availableProducts },
        customers: totalCustomers,
        orders: totalOrders,
        schemes: totalSchemes,
        payments: { totalAmount, count: totalPayments }
      });
      
      setRecentOrders(recent);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Pending': 'status-pending',
      'Processing': 'status-processing',
      'Shipped': 'status-shipped',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-cancelled',
      'Completed': 'status-completed',
      'Sold': 'status-sold',
      'Available': 'status-available'
    };
    return statusMap[status] || 'status-default';
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
        {/* <Footer /> */}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <Navbar />
        <div className="dashboard-error">
          <span className="error-icon">⚠️</span>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">
            Retry
          </button>
        </div>
        {/* <Footer /> */}
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="admin-dashboard">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Overview of your e-commerce store</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card stat-products">
            <div className="stat-icon">💎</div>
            <div className="stat-info">
              <span className="stat-number">{dashboardData.products.total}</span>
              <span className="stat-label">Total Products</span>
              <div className="stat-sub">
                <span>Available: {dashboardData.products.available}</span>
                <span>Sold: {dashboardData.products.sold}</span>
              </div>
            </div>
          </div>

          <div className="stat-card stat-customers">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <span className="stat-number">{dashboardData.customers}</span>
              <span className="stat-label">Customers</span>
            </div>
          </div>

          <div className="stat-card stat-orders">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <span className="stat-number">{dashboardData.orders}</span>
              <span className="stat-label">Orders</span>
            </div>
          </div>

          <div className="stat-card stat-payments">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <span className="stat-number">{formatCurrency(dashboardData.payments.totalAmount)}</span>
              <span className="stat-label">Total Payments</span>
              <span className="stat-sub">{dashboardData.payments.count} transactions</span>
            </div>
          </div>

          <div className="stat-card stat-schemes">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <span className="stat-number">{dashboardData.schemes}</span>
              <span className="stat-label">Active Schemes</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Recent Orders
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              {/* Quick Stats Cards */}
              <div className="quick-stats">
                <div className="quick-stat-item">
                  <span className="qs-icon">📊</span>
                  <div>
                    <span className="qs-value">{dashboardData.products.total}</span>
                    <span className="qs-label">Total Products</span>
                  </div>
                </div>
                <div className="quick-stat-item">
                  <span className="qs-icon">👤</span>
                  <div>
                    <span className="qs-value">{dashboardData.customers}</span>
                    <span className="qs-label">Total Customers</span>
                  </div>
                </div>
                <div className="quick-stat-item">
                  <span className="qs-icon">📋</span>
                  <div>
                    <span className="qs-value">{dashboardData.orders}</span>
                    <span className="qs-label">Total Orders</span>
                  </div>
                </div>
                <div className="quick-stat-item">
                  <span className="qs-icon">💵</span>
                  <div>
                    <span className="qs-value">{formatCurrency(dashboardData.payments.totalAmount)}</span>
                    <span className="qs-label">Total Revenue</span>
                  </div>
                </div>
              </div>

              {/* Product Status Distribution */}
              <div className="product-status-card">
                <h3>Product Status</h3>
                <div className="status-bars">
                  <div className="status-bar-item">
                    <span className="status-bar-label">Available</span>
                    <div className="status-bar-track">
                      <div 
                        className="status-bar-fill available" 
                        style={{ 
                          width: dashboardData.products.total > 0 
                            ? `${(dashboardData.products.available / dashboardData.products.total) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                    <span className="status-bar-count">{dashboardData.products.available}</span>
                  </div>
                  <div className="status-bar-item">
                    <span className="status-bar-label">Sold</span>
                    <div className="status-bar-track">
                      <div 
                        className="status-bar-fill sold" 
                        style={{ 
                          width: dashboardData.products.total > 0 
                            ? `${(dashboardData.products.sold / dashboardData.products.total) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                    <span className="status-bar-count">{dashboardData.products.sold}</span>
                  </div>
                </div>
              </div>

              {/* Schemes List */}
              <div className="schemes-card">
                <h3>Active Schemes</h3>
                <div className="schemes-list">
                  <div className="scheme-item">
                    <span className="scheme-name">Gold Saver 10+1</span>
                    <span className="scheme-detail">₹1000 × 10 installments</span>
                    <span className="scheme-benefit">Get 1 month free</span>
                  </div>
                  <div className="scheme-item">
                    <span className="scheme-name">Silver</span>
                    <span className="scheme-detail">₹500 × 11 installments</span>
                    <span className="scheme-benefit">Get 1 month free</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-tab">
              {recentOrders.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📦</span>
                  <h3>No Orders Yet</h3>
                  <p>Orders will appear here once customers start placing them.</p>
                </div>
              ) : (
                <div className="orders-list">
                  {recentOrders.map((order) => (
                    <div key={order.order_id} className="order-card">
                      <div className="order-header">
                        <div>
                          <span className="order-number">Order #{order.order_number?.slice(0, 15)}</span>
                          <span className="order-date">{formatDate(order.placed_at)}</span>
                        </div>
                        <span className={`order-status ${getStatusBadgeClass(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </div>
                      
                      <div className="order-items">
                        {order.items?.slice(0, 2).map((item) => (
                          <div key={item.order_item_id} className="order-item">
                            <div className="order-item-info">
                              <span className="item-name">
                                {item.product_details?.sub_category || 'Product'}
                              </span>
                              <span className="item-qty">Qty: {item.quantity}</span>
                            </div>
                            <span className="item-price">₹{parseFloat(item.unit_price).toFixed(0)}</span>
                          </div>
                        ))}
                        {order.items?.length > 2 && (
                          <div className="order-more-items">
                            +{order.items.length - 2} more items
                          </div>
                        )}
                      </div>
                      
                      <div className="order-footer">
                        <span className="order-total">Total: ₹{parseFloat(order.grand_total).toFixed(0)}</span>
                        <span className="payment-method">{order.payment_method}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Dashboard;