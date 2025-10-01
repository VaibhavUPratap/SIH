import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const navigateToDashboard = () => {
    if (user) {
      navigate(`/${user.role}/dashboard`);
    }
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="home-logo">
          <h1>🎓 UEI - Unified Education Interface</h1>
        </div>
        <div className="home-nav">
          {user ? (
            <>
              <button className="btn-primary" onClick={navigateToDashboard}>
                Dashboard
              </button>
              <button className="btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn-primary" onClick={() => navigate('/login')}>
                Login
              </button>
              <button className="btn-secondary" onClick={() => navigate('/register')}>
                Register
              </button>
            </>
          )}
        </div>
      </div>

      <div className="home-content">
        <h2>Empowering Education Through Technology</h2>
        <p>
          A centralized platform integrating student, teacher, and institutional data
          using Aadhaar, APAR, and AISHE codes for seamless verification and management.
        </p>
      </div>

      <div className="features">
        <div className="feature-card">
          <h3>🔐 Secure Verification</h3>
          <p>Aadhaar, APAR, and AISHE code integration for robust identity verification</p>
        </div>
        <div className="feature-card">
          <h3>📊 AI-Driven Analytics</h3>
          <p>Advanced analytics for performance tracking and data-driven insights</p>
        </div>
        <div className="feature-card">
          <h3>👥 Role-Based Dashboards</h3>
          <p>Customized interfaces for students, teachers, institutions, and administrators</p>
        </div>
        <div className="feature-card">
          <h3>📝 Scheme Management</h3>
          <p>Streamlined application and tracking of educational schemes and scholarships</p>
        </div>
        <div className="feature-card">
          <h3>✅ Compliance Monitoring</h3>
          <p>Real-time compliance tracking and reporting for institutions</p>
        </div>
        <div className="feature-card">
          <h3>📈 Comprehensive Reports</h3>
          <p>Generate detailed reports for informed decision-making</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
