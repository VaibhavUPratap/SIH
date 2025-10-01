import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function InstitutionDashboard({ user, setUser }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/institution/dashboard');
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
        <h1>Institution Dashboard - {dashboardData?.profile?.name}</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Students</h3>
            <div className="value">{dashboardData?.statistics?.totalStudents}</div>
            <p>{dashboardData?.statistics?.verifiedStudents} verified</p>
          </div>
          <div className="stat-card">
            <h3>Total Teachers</h3>
            <div className="value">{dashboardData?.statistics?.totalTeachers}</div>
            <p>{dashboardData?.statistics?.verifiedTeachers} verified</p>
          </div>
          <div className="stat-card">
            <h3>Compliance</h3>
            <div className="value">{dashboardData?.statistics?.compliancePercentage}%</div>
            <p>Overall compliance</p>
          </div>
          <div className="stat-card">
            <h3>Departments</h3>
            <div className="value">{dashboardData?.departments?.length || 0}</div>
            <p>Active departments</p>
          </div>
        </div>

        <div className="section">
          <h2>Institution Profile</h2>
          <table className="table">
            <tbody>
              <tr>
                <td><strong>Name:</strong></td>
                <td>{dashboardData?.profile?.name}</td>
              </tr>
              <tr>
                <td><strong>AISHE Code:</strong></td>
                <td>{dashboardData?.profile?.aisheCode}</td>
              </tr>
              <tr>
                <td><strong>Type:</strong></td>
                <td>{dashboardData?.profile?.type}</td>
              </tr>
              <tr>
                <td><strong>Email:</strong></td>
                <td>{dashboardData?.profile?.email}</td>
              </tr>
              <tr>
                <td><strong>Established:</strong></td>
                <td>{dashboardData?.profile?.establishedYear}</td>
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
          <h2>Infrastructure</h2>
          {dashboardData?.infrastructure ? (
            <table className="table">
              <tbody>
                <tr>
                  <td><strong>Classrooms:</strong></td>
                  <td>{dashboardData.infrastructure.totalClassrooms || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Laboratories:</strong></td>
                  <td>{dashboardData.infrastructure.totalLabs || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Libraries:</strong></td>
                  <td>{dashboardData.infrastructure.totalLibraries || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Playgrounds:</strong></td>
                  <td>{dashboardData.infrastructure.playgrounds || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Total Area:</strong></td>
                  <td>{dashboardData.infrastructure.totalArea || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p>Infrastructure details not available</p>
          )}
        </div>

        <div className="section">
          <h2>Departments</h2>
          {dashboardData?.departments?.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Head of Department</th>
                  <th>Courses</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.departments.map((dept, index) => (
                  <tr key={index}>
                    <td>{dept.name}</td>
                    <td>{dept.headOfDepartment}</td>
                    <td>{dept.courses?.join(', ') || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No departments added yet</p>
          )}
        </div>

        <div className="section">
          <h2>Compliance Status</h2>
          {dashboardData?.compliance?.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Requirement</th>
                  <th>Status</th>
                  <th>Last Checked</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.compliance.map((comp, index) => (
                  <tr key={index}>
                    <td>{comp.requirement}</td>
                    <td>
                      <span className={`badge ${
                        comp.status === 'Compliant' ? 'badge-success' :
                        comp.status === 'Non-Compliant' ? 'badge-danger' :
                        'badge-warning'
                      }`}>
                        {comp.status}
                      </span>
                    </td>
                    <td>{new Date(comp.lastChecked).toLocaleDateString()}</td>
                    <td>{comp.remarks || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No compliance records available</p>
          )}
        </div>

        <div className="section">
          <h2>Performance History</h2>
          {dashboardData?.recentPerformance?.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Pass %</th>
                  <th>Average Grade</th>
                  <th>Ranking</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentPerformance.map((perf, index) => (
                  <tr key={index}>
                    <td>{perf.academicYear}</td>
                    <td>{perf.passPercentage}%</td>
                    <td><span className="badge badge-info">{perf.averageGrade}</span></td>
                    <td>{perf.ranking || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No performance history available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstitutionDashboard;
