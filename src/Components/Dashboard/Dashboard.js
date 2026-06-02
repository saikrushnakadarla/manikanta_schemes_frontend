import React from 'react';
import Navbar from '../Navbar/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css'; // We'll create this

function Dashboard() {
  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="welcome-card">
                <h1>Welcome to Dashboard</h1>
                <p>Your dashboard content goes here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;