// EduVerify Admin Dashboard JavaScript

// Global variables
let currentSection = 'dashboard';
let verificationTrendsChart = null;
let userDistributionChart = null;
let selectedVerifications = new Set();
let currentVerificationItem = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadDashboardData();
    initializeCharts();
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
    // Update stat cards with enhanced verification data
    updateStatCard('totalUsers', data.total_users || 0);
    updateStatCard('verifiedUsers', data.verified_users || 0);
    updateStatCard('pendingVerifications', data.pending_verifications || 0);
    
    // Update pending count in sidebar
    const pendingCount = document.getElementById('pendingCount');
    if (pendingCount) {
        pendingCount.textContent = data.pending_verifications || 0;
    }
    
    // Update verification status indicator
    const statusIndicator = document.getElementById('verificationStatus');
    const statusText = document.getElementById('verificationStatusText');
    
    if (data.verification_service_health > 0.9) {
        statusIndicator.className = 'w-2 h-2 bg-green-400 rounded-full mr-2';
        statusText.textContent = 'Verification Services Healthy';
    } else if (data.verification_service_health > 0.7) {
        statusIndicator.className = 'w-2 h-2 bg-yellow-400 rounded-full mr-2';
        statusText.textContent = 'Verification Services Warning';
    } else {
        statusIndicator.className = 'w-2 h-2 bg-red-400 rounded-full mr-2';
        statusText.textContent = 'Verification Services Issues';
    }
}

function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value.toLocaleString();
    }
}

async function loadRecentActivities() {
    try {
        const response = await fetchWithAuth('/admin/verification_logs?limit=10');
        let activities = [];
        
        if (response.ok) {
            const data = await response.json();
            activities = data.logs || [];
        } else {
            // Fallback to mock data
            activities = [
                { 
                    time: '2 minutes ago', 
                    user: 'Rahul Sharma', 
                    action: 'Aadhaar Verification', 
                    status: 'success',
                    confidence: 0.95
                },
                { 
                    time: '5 minutes ago', 
                    user: 'IIT Delhi', 
                    action: 'AISHE Verification', 
                    status: 'pending',
                    confidence: 0.0
                },
                { 
                    time: '8 minutes ago', 
                    user: 'Dr. Priya Patel', 
                    action: 'APAR Verification', 
                    status: 'success',
                    confidence: 0.88
                },
                { 
                    time: '12 minutes ago', 
                    user: 'Sneha Singh', 
                    action: 'Profile Verification', 
                    status: 'manual_review',
                    confidence: 0.65
                }
            ];
        }
        
        const container = document.getElementById('recentActivitiesList');
        if (container) {
            container.innerHTML = activities.map(activity => `
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-4">
                        <div class="w-10 h-10 bg-${getStatusBgColor(activity.status)}-100 rounded-full flex items-center justify-center">
                            <i class="fas ${getStatusIcon(activity.status)} text-${getStatusColor(activity.status)}-600"></i>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900">${activity.user}</p>
                            <p class="text-sm text-gray-600">${activity.action}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusBgColor(activity.status)}-100 text-${getStatusColor(activity.status)}-800">
                            ${formatStatus(activity.status)}
                        </span>
                        ${activity.confidence ? `<p class="text-xs text-gray-500 mt-1">${Math.round(activity.confidence * 100)}% confidence</p>` : ''}
                        <p class="text-xs text-gray-500">${activity.time}</p>
                    </div>
                </div>
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

// Chart initialization
function initializeCharts() {
    initializeVerificationTrendsChart();
    initializeUserDistributionChart();
}

function initializeVerificationTrendsChart() {
    const ctx = document.getElementById('verificationTrendsChart');
    if (!ctx) return;
    
    verificationTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [{
                label: 'Successful Verifications',
                data: [12, 19, 15, 25, 22, 30, 28],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4
            }, {
                label: 'Pending Verifications',
                data: [8, 12, 10, 15, 8, 12, 10],
                borderColor: 'rgb(251, 191, 36)',
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                tension: 0.4
            }, {
                label: 'Failed Verifications',
                data: [2, 3, 4, 2, 1, 3, 2],
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initializeUserDistributionChart() {
    const ctx = document.getElementById('userDistributionChart');
    if (!ctx) return;
    
    userDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Students', 'Teachers', 'Institutions', 'Admins'],
            datasets: [{
                data: [60, 25, 12, 3],
                backgroundColor: [
                    'rgb(59, 130, 246)',
                    'rgb(34, 197, 94)',
                    'rgb(251, 191, 36)',
                    'rgb(168, 85, 247)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: false
                }
            }
        }
    });
}

// Enhanced helper functions
function getStatusColor(status) {
    const colors = {
        'success': 'green',
        'pending': 'yellow',
        'failed': 'red',
        'rejected': 'red',
        'manual_review': 'blue',
        'info': 'blue'
    };
    return colors[status] || 'gray';
}

function getStatusBgColor(status) {
    return getStatusColor(status);
}

function getStatusIcon(status) {
    const icons = {
        'success': 'fa-check-circle',
        'pending': 'fa-clock',
        'failed': 'fa-times-circle',
        'rejected': 'fa-times-circle',
        'manual_review': 'fa-eye',
        'info': 'fa-info-circle'
    };
    return icons[status] || 'fa-question-circle';
}

function formatStatus(status) {
    const statusMap = {
        'success': 'Verified',
        'pending': 'Pending',
        'failed': 'Failed',
        'rejected': 'Rejected',
        'manual_review': 'Manual Review',
        'info': 'Info'
    };
    return statusMap[status] || status;
}

// Verification Panel Functions
function loadVerificationQueue() {
    // Mock verification queue data
    const verifications = [
        {
            id: '1',
            user: 'Rahul Sharma',
            email: 'rahul@example.com',
            role: 'student',
            type: 'aadhaar',
            status: 'pending',
            confidence: 0.85,
            submitted: '2024-01-15 10:30 AM',
            aadhaar: '****-****-1234'
        },
        {
            id: '2',
            user: 'IIT Delhi',
            email: 'admin@iitd.ac.in',
            role: 'institution',
            type: 'aishe',
            status: 'manual_review',
            confidence: 0.65,
            submitted: '2024-01-15 09:15 AM',
            aishe_code: 'U-0005'
        },
        {
            id: '3',
            user: 'Dr. Priya Patel',
            email: 'priya@university.edu',
            role: 'teacher',
            type: 'apar',
            status: 'rejected',
            confidence: 0.30,
            submitted: '2024-01-15 08:45 AM',
            apar_id: 'APAR-2024-001'
        }
    ];
    
    const tbody = document.getElementById('verificationQueue');
    if (tbody) {
        tbody.innerHTML = verifications.map(verification => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" class="rounded verification-checkbox" data-id="${verification.id}" onchange="toggleVerificationSelection('${verification.id}')">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <i class="fas fa-user text-gray-500"></i>
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${verification.user}</div>
                            <div class="text-sm text-gray-500">${verification.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ${verification.role}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${verification.type.toUpperCase()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusBgColor(verification.status)}-100 text-${getStatusColor(verification.status)}-800">
                        ${formatStatus(verification.status)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div class="bg-${verification.confidence > 0.7 ? 'green' : verification.confidence > 0.4 ? 'yellow' : 'red'}-600 h-2 rounded-full" style="width: ${verification.confidence * 100}%"></div>
                        </div>
                        <span class="text-sm text-gray-900">${Math.round(verification.confidence * 100)}%</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${verification.submitted}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="viewVerificationDetails('${verification.id}')" class="text-blue-600 hover:text-blue-900">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="approveVerification('${verification.id}')" class="text-green-600 hover:text-green-900">
                            <i class="fas fa-check"></i>
                        </button>
                        <button onclick="rejectVerification('${verification.id}')" class="text-red-600 hover:text-red-900">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    // Update queue count
    const queueCount = document.getElementById('queueCount');
    if (queueCount) {
        queueCount.textContent = `${verifications.length} items pending`;
    }
}

function toggleVerificationSelection(id) {
    if (selectedVerifications.has(id)) {
        selectedVerifications.delete(id);
    } else {
        selectedVerifications.add(id);
    }
}

function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.verification-checkbox');
    
    if (selectAll.checked) {
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            selectedVerifications.add(checkbox.dataset.id);
        });
    } else {
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            selectedVerifications.delete(checkbox.dataset.id);
        });
    }
}

function viewVerificationDetails(id) {
    // Mock verification details
    const details = {
        user: 'Rahul Sharma',
        email: 'rahul@example.com',
        role: 'student',
        aadhaar: '1234-5678-9012',
        verification_attempts: [
            {
                timestamp: '2024-01-15 10:30 AM',
                type: 'aadhaar',
                result: 'checksum_valid',
                confidence: 0.95
            },
            {
                timestamp: '2024-01-15 10:31 AM',
                type: 'pattern_check',
                result: 'no_suspicious_patterns',
                confidence: 0.85
            }
        ]
    };
    
    const modalContent = document.getElementById('verificationModalContent');
    if (modalContent) {
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-3">User Information</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-sm font-medium text-gray-700">Name</label>
                            <p class="text-sm text-gray-900">${details.user}</p>
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-700">Email</label>
                            <p class="text-sm text-gray-900">${details.email}</p>
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-700">Role</label>
                            <p class="text-sm text-gray-900">${details.role}</p>
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-700">Aadhaar</label>
                            <p class="text-sm text-gray-900">${details.aadhaar}</p>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold text-gray-900 mb-3">Verification Attempts</h4>
                    <div class="space-y-3">
                        ${details.verification_attempts.map(attempt => `
                            <div class="border border-gray-200 rounded-lg p-4">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-medium text-gray-900">${attempt.type.toUpperCase()} Check</p>
                                        <p class="text-sm text-gray-600">${attempt.timestamp}</p>
                                    </div>
                                    <div class="text-right">
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            ${attempt.result}
                                        </span>
                                        <p class="text-sm text-gray-600 mt-1">${Math.round(attempt.confidence * 100)}% confidence</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    currentVerificationItem = id;
    const modal = document.getElementById('verificationModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function approveSelected() {
    if (selectedVerifications.size === 0) {
        showMessage('Please select at least one verification to approve', 'warning');
        return;
    }
    
    const count = selectedVerifications.size;
    if (confirm(`Are you sure you want to approve ${count} selected verification${count > 1 ? 's' : ''}?`)) {
        showMessage(`${count} verification${count > 1 ? 's' : ''} approved successfully`, 'success');
        selectedVerifications.clear();
        loadVerificationQueue();
    }
}

function approveVerification(id = null) {
    const verificationId = id || currentVerificationItem;
    if (!verificationId) return;
    
    showMessage('Verification approved successfully', 'success');
    closeModal('verificationModal');
    loadVerificationQueue();
}

function rejectVerification(id = null) {
    const verificationId = id || currentVerificationItem;
    if (!verificationId) return;
    
    if (confirm('Are you sure you want to reject this verification?')) {
        showMessage('Verification rejected', 'warning');
        closeModal('verificationModal');
        loadVerificationQueue();
    }
}

function filterVerifications(filter) {
    // This would filter the verification queue based on the selected filter
    console.log('Filtering verifications by:', filter);
    loadVerificationQueue();
}

function showBulkVerification() {
    showMessage('Bulk verification feature - Coming soon', 'info');
}

function updateTrendChart(days) {
    console.log('Updating trend chart for', days, 'days');
    // This would update the chart with new data
}
