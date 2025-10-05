// EduVerify Student Dashboard JavaScript

// Global variables
let currentSection = 'dashboard';
let academicProgressChart = null;
let selectedDocumentFile = null;

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
    if (user.role !== 'student') {
        window.location.href = '/login';
        return;
    }
    
    // Update user display
    updateUserDisplay(user);
}

function updateUserDisplay(user) {
    const avatar = document.querySelector('.user-avatar');
    const userName = document.querySelector('.user-info .font-weight-600');
    const userEmail = document.querySelector('.user-info .text-xs');
    
    if (avatar && user.name) {
        avatar.textContent = user.name.charAt(0).toUpperCase();
    }
    
    if (userName) {
        userName.textContent = user.name || 'Student User';
    }
    
    if (userEmail && user.email) {
        userEmail.textContent = user.email;
    }
}

async function loadDashboardData() {
    try {
        showLoading();
        
        // Load student performance data
        const response = await fetchWithAuth('/student/performance');
        if (response.ok) {
            const data = await response.json();
            updateDashboardStats(data);
        } else {
            // Use mock data if API fails
            updateDashboardStats({
                verification_progress: 75,
                academic_progress: 8.5,
                active_applications: 3,
                certificates_count: 5
            });
        }
        
        // Load recent activities
        loadRecentActivities();
        
        // Load documents if in verification section
        if (currentSection === 'verification') {
            loadUploadedDocuments();
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showMessage('Failed to load dashboard data', 'error');
    } finally {
        hideLoading();
    }
}

function updateDashboardStats(data) {
    // Update stat cards
    updateStatCard('verificationStatusText', `${data.verification_progress || 75}% Complete`);
    updateStatCard('academicProgress', data.academic_progress ? `${data.academic_progress} CGPA` : '8.5 CGPA');
    updateStatCard('activeApplications', data.active_applications || 3);
    updateStatCard('certificateCount', data.certificates_count || 5);
    
    // Update verification badges
    const verificationBadge = document.getElementById('verificationBadge');
    const profileStatusBadge = document.getElementById('profileStatusBadge');
    
    if (data.verification_progress >= 100) {
        if (verificationBadge) verificationBadge.className = 'ml-auto w-2 h-2 bg-green-400 rounded-full';
        if (profileStatusBadge) {
            profileStatusBadge.className = 'ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800';
            profileStatusBadge.textContent = 'Complete';
        }
    } else if (data.verification_progress >= 50) {
        if (verificationBadge) verificationBadge.className = 'ml-auto w-2 h-2 bg-yellow-400 rounded-full';
    }
}

function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

async function loadRecentActivities() {
    try {
        // Mock recent activities data
        const activities = [
            { 
                time: '2 minutes ago', 
                action: 'Document Uploaded', 
                description: 'Income Certificate uploaded successfully',
                icon: 'fas fa-upload',
                status: 'success'
            },
            { 
                time: '1 hour ago', 
                action: 'Scholarship Application', 
                description: 'Applied for Merit Scholarship 2024',
                icon: 'fas fa-award',
                status: 'info'
            },
            { 
                time: '2 hours ago', 
                action: 'Profile Updated', 
                description: 'Academic information updated',
                icon: 'fas fa-user-edit',
                status: 'success'
            },
            { 
                time: '1 day ago', 
                action: 'Verification', 
                description: 'Aadhaar verification completed',
                icon: 'fas fa-shield-check',
                status: 'success'
            }
        ];
        
        const container = document.getElementById('recentActivitiesList');
        if (container) {
            container.innerHTML = activities.map(activity => `
                <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div class="flex-shrink-0">
                        <div class="w-10 h-10 bg-${getStatusColor(activity.status)}-100 rounded-full flex items-center justify-center">
                            <i class="${activity.icon} text-${getStatusColor(activity.status)}-600"></i>
                        </div>
                    </div>
                    <div class="ml-4 flex-1">
                        <p class="font-medium text-gray-900">${activity.action}</p>
                        <p class="text-sm text-gray-600">${activity.description}</p>
                    </div>
                    <div class="flex-shrink-0 text-sm text-gray-500">
                        ${activity.time}
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading recent activities:', error);
    }
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
        'profile': 'My Profile',
        'verification': 'Document Verification',
        'academics': 'Academic Records',
        'scholarships': 'Scholarships',
        'progress': 'Progress Tracking',
        'documents': 'Documents',
        'support': 'Support'
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
        case 'verification':
            loadUploadedDocuments();
            break;
        case 'profile':
            loadProfileData();
            break;
        default:
            break;
    }
}

async function loadProfileData() {
    try {
        const response = await fetchWithAuth('/student/profile');
        if (response.ok) {
            const data = await response.json();
            populateProfileForm(data);
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}

function populateProfileForm(data) {
    const fields = ['fullName', 'email', 'phone', 'dob', 'gender', 'aadhaar', 
                   'institution', 'course', 'yearOfStudy', 'rollNumber'];
    
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element && data[field]) {
            element.value = data[field];
        }
    });
}

async function loadUploadedDocuments() {
    try {
        // Mock uploaded documents data
        const documents = [
            {
                id: '1',
                name: 'Aadhaar_Card.pdf',
                type: 'Identity',
                upload_date: '2024-01-15',
                status: 'verified',
                size: '2.1 MB'
            },
            {
                id: '2',
                name: 'Academic_Transcript.pdf',
                type: 'Academic',
                upload_date: '2024-01-14',
                status: 'pending',
                size: '1.8 MB'
            },
            {
                id: '3',
                name: 'Income_Certificate.pdf',
                type: 'Financial',
                upload_date: '2024-01-13',
                status: 'verified',
                size: '1.2 MB'
            }
        ];
        
        const tbody = document.getElementById('documentsTable');
        if (tbody) {
            tbody.innerHTML = documents.map(doc => `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10">
                                <div class="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <i class="fas fa-file-pdf text-red-500"></i>
                                </div>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${doc.name}</div>
                                <div class="text-sm text-gray-500">${doc.size}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ${doc.type}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${doc.upload_date}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getDocumentStatusColor(doc.status)}-100 text-${getDocumentStatusColor(doc.status)}-800">
                            ${doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex space-x-2">
                            <button onclick="viewDocument('${doc.id}')" class="text-blue-600 hover:text-blue-900">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="downloadDocument('${doc.id}')" class="text-green-600 hover:text-green-900">
                                <i class="fas fa-download"></i>
                            </button>
                            <button onclick="deleteDocument('${doc.id}')" class="text-red-600 hover:text-red-900">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

// Chart initialization
function initializeCharts() {
    initializeAcademicProgressChart();
}

function initializeAcademicProgressChart() {
    const ctx = document.getElementById('academicProgressChart');
    if (!ctx) return;
    
    academicProgressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
            datasets: [{
                label: 'CGPA',
                data: [7.8, 8.2, 8.5, 8.3, 8.7, 8.9],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 6,
                    max: 10,
                    ticks: {
                        stepSize: 0.5
                    }
                }
            }
        }
    });
}

// Profile functions
async function saveProfile(event) {
    if (event) event.preventDefault();
    
    try {
        const formData = {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            dob: document.getElementById('dob').value,
            gender: document.getElementById('gender').value,
            institution: document.getElementById('institution').value,
            course: document.getElementById('course').value,
            yearOfStudy: document.getElementById('yearOfStudy').value,
            rollNumber: document.getElementById('rollNumber').value
        };
        
        const response = await fetchWithAuth('/student/profile', {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showMessage('Profile updated successfully', 'success');
        } else {
            showMessage('Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        showMessage('Failed to update profile', 'error');
    }
}

function resetProfile() {
    const form = document.getElementById('profileForm');
    if (form) {
        form.reset();
        loadProfileData(); // Reload original data
    }
}

function uploadPhoto() {
    showMessage('Photo upload feature - Coming soon', 'info');
}

// Document functions
function selectDocument() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.png,.jpg,.jpeg';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                showMessage('File size should be less than 10MB', 'error');
                return;
            }
            selectedDocumentFile = file;
            showMessage(`Selected: ${file.name}`, 'success');
        }
    };
    input.click();
}

async function submitDocument() {
    if (!selectedDocumentFile) {
        showMessage('Please select a document to upload', 'error');
        return;
    }
    
    const documentType = document.getElementById('documentType').value;
    if (!documentType) {
        showMessage('Please select document type', 'error');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('document', selectedDocumentFile);
        formData.append('type', documentType);
        
        const response = await fetchWithAuth('/student/upload_document', {
            method: 'POST',
            body: formData,
            headers: {} // Don't set Content-Type for FormData
        });
        
        if (response.ok) {
            showMessage('Document uploaded successfully', 'success');
            selectedDocumentFile = null;
            document.getElementById('documentType').value = '';
            loadUploadedDocuments();
        } else {
            showMessage('Failed to upload document', 'error');
        }
    } catch (error) {
        console.error('Error uploading document:', error);
        showMessage('Failed to upload document', 'error');
    }
}

function viewDocument(documentId) {
    showMessage(`View document feature for ID: ${documentId} - Coming soon`, 'info');
}

function downloadDocument(documentId) {
    showMessage(`Download document feature for ID: ${documentId} - Coming soon`, 'info');
}

function deleteDocument(documentId) {
    if (confirm('Are you sure you want to delete this document?')) {
        showMessage(`Delete document feature for ID: ${documentId} - Coming soon`, 'info');
    }
}

function uploadIncomeDocument() {
    document.getElementById('documentType').value = 'income_certificate';
    selectDocument();
}

// Quick action functions
function startVerification() {
    showSection('verification');
}

function applyScholarship() {
    showSection('scholarships');
}

function uploadDocuments() {
    showSection('verification');
}

// Utility functions
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    const defaultHeaders = {
        'Authorization': `Bearer ${token}`
    };
    
    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
        defaultHeaders['Content-Type'] = 'application/json';
    }
    
    return fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
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
    const messageDiv = document.createElement('div');
    const colorClass = {
        'success': 'bg-green-100 text-green-800 border-green-200',
        'error': 'bg-red-100 text-red-800 border-red-200',
        'warning': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'info': 'bg-blue-100 text-blue-800 border-blue-200'
    }[type] || 'bg-blue-100 text-blue-800 border-blue-200';
    
    messageDiv.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${colorClass}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (document.body.contains(messageDiv)) {
            document.body.removeChild(messageDiv);
        }
    }, 5000);
}

function getStatusColor(status) {
    const colors = {
        'success': 'green',
        'error': 'red',
        'warning': 'yellow',
        'info': 'blue'
    };
    return colors[status] || 'gray';
}

function getDocumentStatusColor(status) {
    const colors = {
        'verified': 'green',
        'pending': 'yellow',
        'rejected': 'red',
        'expired': 'red'
    };
    return colors[status] || 'gray';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// Add form submit handler
document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', saveProfile);
    }
});