import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function AdminDashboard({ user, setUser }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
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
        <h1>Ministry of Education - Admin Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Students</h3>
            <div className="value">{dashboardData?.overview?.totalStudents}</div>
            <p>{dashboardData?.overview?.verifiedStudents} verified</p>
          </div>
          <div className="stat-card">
            <h3>Total Teachers</h3>
            <div className="value">{dashboardData?.overview?.totalTeachers}</div>
            <p>{dashboardData?.overview?.verifiedTeachers} verified</p>
          </div>
          <div className="stat-card">
            <h3>Institutions</h3>
            <div className="value">{dashboardData?.overview?.totalInstitutions}</div>
            <p>{dashboardData?.overview?.verifiedInstitutions} verified</p>
          </div>
          <div className="stat-card">
            <h3>Active Schemes</h3>
            <div className="value">{dashboardData?.overview?.activeSchemes}</div>
            <p>Out of {dashboardData?.overview?.totalSchemes} total</p>
          </div>
        </div>

        <div className="section">
          <h2>Recent Student Registrations</h2>
          {dashboardData?.recentActivity?.students?.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Institution</th>
                  <th>Registered On</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentActivity.students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.institutionId?.name || 'N/A'}</td>
                    <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No recent student registrations</p>
          )}
        </div>

        <div className="section">
          <h2>Recent Teacher Registrations</h2>
          {dashboardData?.recentActivity?.teachers?.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Institution</th>
                  <th>Registered On</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentActivity.teachers.map((teacher) => (
                  <tr key={teacher._id}>
                    <td>{teacher.name}</td>
                    <td>{teacher.email}</td>
                    <td>{teacher.institutionId?.name || 'N/A'}</td>
                    <td>{new Date(teacher.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No recent teacher registrations</p>
          )}
        </div>

        <div className="section">
          <h2>Recent Institution Registrations</h2>
          {dashboardData?.recentActivity?.institutions?.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>AISHE Code</th>
                  <th>Registered On</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentActivity.institutions.map((institution) => (
                  <tr key={institution._id}>
                    <td>{institution.name}</td>
                    <td>{institution.type}</td>
                    <td>{institution.aisheCode}</td>
                    <td>{new Date(institution.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No recent institution registrations</p>
          )}
        </div>

        <div className="section">
          <h2>Scheme Analytics</h2>
          {dashboardData?.schemeAnalytics?.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Scheme Name</th>
                  <th>Category</th>
                  <th>Total Applicants</th>
                  <th>Approved</th>
                  <th>Approval Rate</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.schemeAnalytics.map((scheme) => (
                  <tr key={scheme._id}>
                    <td>{scheme.name}</td>
                    <td>{scheme.category}</td>
                    <td>{scheme.totalApplicants}</td>
                    <td>{scheme.approvedApplicants}</td>
                    <td>
                      {scheme.totalApplicants > 0 
                        ? `${((scheme.approvedApplicants / scheme.totalApplicants) * 100).toFixed(1)}%`
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No scheme data available</p>
          )}
        </div>

        <div className="section">
          <h2>System Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Verification Rate</h3>
              <div className="value">
                {dashboardData?.overview?.totalStudents > 0
                  ? ((dashboardData.overview.verifiedStudents / dashboardData.overview.totalStudents) * 100).toFixed(1)
                  : 0}%
              </div>
              <p>Students verified</p>
            </div>
            <div className="stat-card">
              <h3>Teacher Verification</h3>
              <div className="value">
                {dashboardData?.overview?.totalTeachers > 0
                  ? ((dashboardData.overview.verifiedTeachers / dashboardData.overview.totalTeachers) * 100).toFixed(1)
                  : 0}%
              </div>
              <p>Teachers verified</p>
            </div>
            <div className="stat-card">
              <h3>Institution Verification</h3>
              <div className="value">
                {dashboardData?.overview?.totalInstitutions > 0
                  ? ((dashboardData.overview.verifiedInstitutions / dashboardData.overview.totalInstitutions) * 100).toFixed(1)
                  : 0}%
              </div>
              <p>Institutions verified</p>
            </div>
            <div className="stat-card">
              <h3>Scheme Activation</h3>
              <div className="value">
                {dashboardData?.overview?.totalSchemes > 0
                  ? ((dashboardData.overview.activeSchemes / dashboardData.overview.totalSchemes) * 100).toFixed(1)
                  : 0}%
              </div>
              <p>Schemes active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
