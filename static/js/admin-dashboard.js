// Admin Dashboard JavaScript

// Global variables
let currentSection = 'dashboard';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadDashboardData();
});

function initializeDashboard() {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    
    // Load user info
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
        window.location.href = '/login';
        return;
    }
    
    // Update user display
    updateUserDisplay(user);
}

function updateUserDisplay(user) {
    const avatar = document.querySelector('.user-avatar');
    const userName = document.querySelector('.user-info .font-weight-600');
    
    if (avatar && user.name) {
        avatar.textContent = user.name.charAt(0).toUpperCase();
    }
    
    if (userName) {
        userName.textContent = user.name || 'Admin User';
    }
}

async function loadDashboardData() {
    try {
        showLoading();
        
        // Load system overview
        const response = await fetchWithAuth('/admin/analytics');
        if (response.ok) {
            const data = await response.json();
            updateDashboardStats(data);
        }
        
        // Load recent activities
        loadRecentActivities();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showMessage('Failed to load dashboard data', 'error');
    } finally {
        hideLoading();
    }
}

function updateDashboardStats(data) {
    // Update stat cards
    updateStatCard('totalUsers', data.total_users || 0);
    updateStatCard('totalInstitutions', data.total_institutions || 0);
    updateStatCard('activeSchemes', data.active_schemes || 0);
    updateStatCard('totalApplications', data.total_applications || 0);
}

function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value.toLocaleString();
    }
}

async function loadRecentActivities() {
    try {
        // Mock recent activities for now
        const activities = [
            { time: '2 minutes ago', user: 'John Doe', action: 'Registered as Student', status: 'success' },
            { time: '5 minutes ago', user: 'ABC University', action: 'Updated NIRF Data', status: 'info' },
            { time: '10 minutes ago', user: 'Jane Smith', action: 'Applied for Scholarship', status: 'pending' },
            { time: '15 minutes ago', user: 'XYZ College', action: 'Submitted Compliance Report', status: 'success' }
        ];
        
        const tbody = document.getElementById('recentActivities');
        if (tbody) {
            tbody.innerHTML = activities.map(activity => `
                <tr>
                    <td>${activity.time}</td>
                    <td>${activity.user}</td>
                    <td>${activity.action}</td>
                    <td><span class="badge badge-${getStatusColor(activity.status)}">${activity.status}</span></td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading recent activities:', error);
    }
}

function getStatusColor(status) {
    const colors = {
        'success': 'success',
        'pending': 'warning',
        'error': 'danger',
        'info': 'primary'
    };
    return colors[status] || 'secondary';
}

// Navigation functions
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.add('hidden'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Update navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const activeNav = document.querySelector(`.nav-item[onclick="showSection('${sectionName}')"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard Overview',
        'users': 'User Management',
        'institutions': 'Institution Management',
        'schemes': 'Government Schemes',
        'analytics': 'Advanced Analytics',
        'reports': 'Reports & Export',
        'settings': 'System Settings'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = titles[sectionName] || 'Dashboard';
    }
    
    currentSection = sectionName;
    
    // Load section-specific data
    loadSectionData(sectionName);
}

async function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'users':
            loadUsersData();
            break;
        case 'schemes':
            loadSchemesData();
            break;
        case 'analytics':
            loadAnalyticsData();
            break;
        default:
            break;
    }
}

async function loadUsersData() {
    try {
        // Mock users data for now
        const users = [
            { name: 'John Doe', email: 'john@example.com', role: 'student', status: 'Active', joined: '2024-01-15' },
            { name: 'Jane Smith', email: 'jane@university.edu', role: 'teacher', status: 'Active', joined: '2024-01-10' },
            { name: 'ABC University', email: 'admin@abc.edu', role: 'institution', status: 'Active', joined: '2024-01-05' }
        ];
        
        const tbody = document.getElementById('usersTable');
        if (tbody) {
            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><span class="badge badge-primary">${user.role}</span></td>
                    <td><span class="badge badge-success">${user.status}</span></td>
                    <td>${user.joined}</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="editUser('${user.email}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.email}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading users data:', error);
    }
}

async function loadSchemesData() {
    try {
        // Mock schemes data
        const schemes = [
            { name: 'Merit Scholarship 2024', category: 'Scholarship', target: 'Students', applications: 150, status: 'Active' },
            { name: 'Infrastructure Development', category: 'Infrastructure', target: 'Institutions', applications: 25, status: 'Active' },
            { name: 'Teacher Training Program', category: 'Training', target: 'Teachers', applications: 80, status: 'Active' }
        ];
        
        // Update scheme stats
        document.getElementById('schemesTotal').textContent = schemes.length;
        document.getElementById('schemesActive').textContent = schemes.filter(s => s.status === 'Active').length;
        document.getElementById('schemesApplications').textContent = schemes.reduce((sum, s) => sum + s.applications, 0);
        document.getElementById('schemesApproved').textContent = Math.floor(schemes.reduce((sum, s) => sum + s.applications, 0) * 0.7);
        
        const tbody = document.getElementById('schemesTable');
        if (tbody) {
            tbody.innerHTML = schemes.map(scheme => `
                <tr>
                    <td>${scheme.name}</td>
                    <td><span class="badge badge-info">${scheme.category}</span></td>
                    <td>${scheme.target}</td>
                    <td>${scheme.applications}</td>
                    <td><span class="badge badge-success">${scheme.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="editScheme('${scheme.name}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="viewApplications('${scheme.name}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading schemes data:', error);
    }
}

// Utility functions
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    return fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
}

function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

function showMessage(message, type = 'info') {
    // Create a temporary message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        document.body.removeChild(messageDiv);
    }, 5000);
}

function refreshData() {
    loadDashboardData();
    loadSectionData(currentSection);
    showMessage('Data refreshed successfully', 'success');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Modal functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Placeholder functions for user actions
function editUser(email) {
    showMessage(`Edit user functionality for ${email} - Coming soon`, 'info');
}

function deleteUser(email) {
    if (confirm(`Are you sure you want to delete user ${email}?`)) {
        showMessage(`Delete user functionality - Coming soon`, 'info');
    }
}

function editScheme(name) {
    showMessage(`Edit scheme functionality for ${name} - Coming soon`, 'info');
}

function viewApplications(name) {
    showMessage(`View applications for ${name} - Coming soon`, 'info');
}

function generateReport() {
    showMessage('Report generation functionality - Coming soon', 'info');
}