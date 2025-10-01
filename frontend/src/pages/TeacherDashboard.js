import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function TeacherDashboard({ user, setUser }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/teacher/dashboard');
      setDashboardData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Teacher Dashboard - {dashboardData?.profile?.name}</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Attendance</h3>
            <div className="value">{dashboardData?.analytics?.attendancePercentage}%</div>
            <p>Your attendance</p>
          </div>
          <div className="stat-card">
            <h3>Rating</h3>
            <div className="value">{dashboardData?.analytics?.averageRating}/5</div>
            <p>Average rating</p>
          </div>
          <div className="stat-card">
            <h3>Classes</h3>
            <div className="value">{dashboardData?.analytics?.totalClasses}</div>
            <p>Assigned classes</p>
          </div>
          <div className="stat-card">
            <h3>Experience</h3>
            <div className="value">{dashboardData?.analytics?.experienceYears}</div>
            <p>Years of teaching</p>
          </div>
        </div>

        <div className="section">
          <h2>Profile Information</h2>
          <table className="table">
            <tbody>
              <tr>
                <td><strong>Name:</strong></td>
                <td>{dashboardData?.profile?.name}</td>
              </tr>
              <tr>
                <td><strong>Email:</strong></td>
                <td>{dashboardData?.profile?.email}</td>
              </tr>
              <tr>
                <td><strong>APAR Code:</strong></td>
                <td>{dashboardData?.profile?.aparCode}</td>
              </tr>
              <tr>
                <td><strong>Aadhaar:</strong></td>
                <td>{dashboardData?.profile?.aadhaarNumber}</td>
              </tr>
              <tr>
                <td><strong>Designation:</strong></td>
                <td>{dashboardData?.profile?.designation}</td>
              </tr>
              <tr>
                <td><strong>Department:</strong></td>
                <td>{dashboardData?.profile?.department}</td>
              </tr>
              <tr>
                <td><strong>Verified:</strong></td>
                <td>
                  <span className={`badge ${dashboardData?.profile?.isVerified ? 'badge-success' : 'badge-warning'}`}>
                    {dashboardData?.profile?.isVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="section">
          <h2>Assigned Classes</h2>
          {dashboardData?.classes?.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Subject</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.classes.map((cls, index) => (
                  <tr key={index}>
                    <td>{cls.class}</td>
                    <td>{cls.section}</td>
                    <td>{cls.subject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No classes assigned yet</p>
          )}
        </div>

        <div className="section">
          <h2>Recent Performance Reviews</h2>
          {dashboardData?.recentPerformance?.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Rating</th>
                  <th>Remarks</th>
                  <th>Evaluated By</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentPerformance.map((perf, index) => (
                  <tr key={index}>
                    <td>{perf.year}</td>
                    <td><span className="badge badge-info">{perf.rating}/5</span></td>
                    <td>{perf.remarks}</td>
                    <td>{perf.evaluatedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No performance reviews available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
