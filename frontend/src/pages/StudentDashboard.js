import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function StudentDashboard({ user, setUser }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    fetchSchemes();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/student/dashboard');
      setDashboardData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const fetchSchemes = async () => {
    try {
      const response = await api.get('/student/schemes');
      setSchemes(response.data);
    } catch (err) {
      console.error('Failed to load schemes');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const applyForScheme = async (schemeId) => {
    try {
      await api.post('/student/apply-scheme', { schemeId });
      alert('Application submitted successfully!');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply for scheme');
    }
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
        <h1>Student Dashboard - {dashboardData?.profile?.name}</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Attendance</h3>
            <div className="value">{dashboardData?.analytics?.attendancePercentage}%</div>
            <p>Overall attendance</p>
          </div>
          <div className="stat-card">
            <h3>Average Marks</h3>
            <div className="value">{dashboardData?.analytics?.averageMarks}</div>
            <p>Across all subjects</p>
          </div>
          <div className="stat-card">
            <h3>Subjects</h3>
            <div className="value">{dashboardData?.analytics?.totalSubjects}</div>
            <p>Total subjects</p>
          </div>
          <div className="stat-card">
            <h3>Schemes</h3>
            <div className="value">{dashboardData?.analytics?.approvedSchemes}/{dashboardData?.analytics?.appliedSchemes}</div>
            <p>Approved/Applied</p>
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
                <td><strong>Aadhaar:</strong></td>
                <td>{dashboardData?.profile?.aadhaarNumber}</td>
              </tr>
              <tr>
                <td><strong>Class:</strong></td>
                <td>{dashboardData?.profile?.class} - {dashboardData?.profile?.section}</td>
              </tr>
              <tr>
                <td><strong>Roll Number:</strong></td>
                <td>{dashboardData?.profile?.rollNumber}</td>
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
          <h2>Recent Performance</h2>
          {dashboardData?.recentPerformance?.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Grade</th>
                  <th>Semester</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentPerformance.map((perf, index) => (
                  <tr key={index}>
                    <td>{perf.subject}</td>
                    <td>{perf.marks}</td>
                    <td><span className="badge badge-info">{perf.grade}</span></td>
                    <td>{perf.semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No performance data available</p>
          )}
        </div>

        <div className="section">
          <h2>Applied Schemes</h2>
          {dashboardData?.schemes?.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Scheme Name</th>
                  <th>Category</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.schemes.map((scheme, index) => (
                  <tr key={index}>
                    <td>{scheme.schemeId?.name || 'N/A'}</td>
                    <td>{scheme.schemeId?.category || 'N/A'}</td>
                    <td>{new Date(scheme.appliedDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${
                        scheme.status === 'Approved' ? 'badge-success' :
                        scheme.status === 'Rejected' ? 'badge-danger' :
                        scheme.status === 'Pending' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {scheme.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No schemes applied yet</p>
          )}
        </div>

        <div className="section">
          <h2>Available Schemes</h2>
          {schemes.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Benefits</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {schemes.map((scheme) => (
                  <tr key={scheme._id}>
                    <td>{scheme.name}</td>
                    <td>{scheme.category}</td>
                    <td>₹{scheme.benefits?.amount || 'N/A'}</td>
                    <td>
                      <button 
                        className="btn-primary" 
                        onClick={() => applyForScheme(scheme._id)}
                        disabled={dashboardData?.schemes?.some(s => s.schemeId?._id === scheme._id)}
                      >
                        {dashboardData?.schemes?.some(s => s.schemeId?._id === scheme._id) ? 'Applied' : 'Apply'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No schemes available at the moment</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
