// EduVerify Teacher Dashboard JavaScript

// Global variables
let currentSection = 'dashboard';
let performanceChart = null;
let studentProgressChart = null;
let evaluationTrendChart = null;
let selectedStudents = new Set();
let currentStudentData = null;

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
    if (user.role !== 'teacher') {
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
        userName.textContent = user.name || 'Teacher User';
    }
    
    if (userEmail && user.email) {
        userEmail.textContent = user.email;
    }
}

async function loadDashboardData() {
    try {
        showLoading();
        
        // Load teacher performance data
        const response = await fetchWithAuth('/teacher/performance');
        if (response.ok) {
            const data = await response.json();
            updateDashboardStats(data);
        } else {
            // Use mock data if API fails
            updateDashboardStats({
                total_students: 125,
                evaluations_completed: 89,
                average_student_score: 78.5,
                completion_rate: 92.3,
                subjects: ['Mathematics', 'Physics'],
                recent_evaluations: 15
            });
        }
        
        // Load recent activities
        loadRecentActivities();
        
        // Load teacher profile
        loadTeacherProfile();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showMessage('Failed to load dashboard data', 'error');
    } finally {
        hideLoading();
    }
}

function updateDashboardStats(data) {
    // Update stat cards
    updateStatCard('totalStudents', data.total_students || 125);
    updateStatCard('evaluationsCompleted', data.evaluations_completed || 89);
    updateStatCard('averageScore', `${data.average_student_score || 78.5}%`);
    updateStatCard('completionRate', `${data.completion_rate || 92.3}%`);
    
    // Update APAR status
    const aparStatus = document.getElementById('aparStatus');
    if (aparStatus) {
        aparStatus.innerHTML = `
            <div class="flex items-center">
                <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span class="text-sm">APAR Verified</span>
            </div>
        `;
    }
    
    // Update subjects display
    const subjectsDisplay = document.getElementById('subjectsDisplay');
    if (subjectsDisplay && data.subjects) {
        subjectsDisplay.innerHTML = data.subjects.map(subject => 
            `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">${subject}</span>`
        ).join(' ');
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
                time: '5 minutes ago', 
                action: 'Student Evaluation', 
                description: 'Evaluated Rahul Sharma - Mathematics Quiz',
                icon: 'fas fa-clipboard-check',
                status: 'success',
                score: 85
            },
            { 
                time: '1 hour ago', 
                action: 'Class Assignment', 
                description: 'Created Physics Lab Assignment',
                icon: 'fas fa-tasks',
                status: 'info'
            },
            { 
                time: '3 hours ago', 
                action: 'Grade Updated', 
                description: 'Updated grades for 15 students',
                icon: 'fas fa-chart-line',
                status: 'success'
            },
            { 
                time: '1 day ago', 
                action: 'APAR Review', 
                description: 'Completed annual performance review',
                icon: 'fas fa-user-check',
                status: 'success'
            }
        ];
        
        const container = document.getElementById('recentActivitiesList');
        if (container) {
            container.innerHTML = activities.map(activity => `
                <div class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div class="flex-shrink-0">
                        <div class="w-10 h-10 bg-${getStatusColor(activity.status)}-100 rounded-full flex items-center justify-center">
                            <i class="${activity.icon} text-${getStatusColor(activity.status)}-600"></i>
                        </div>
                    </div>
                    <div class="ml-4 flex-1">
                        <p class="font-medium text-gray-900">${activity.action}</p>
                        <p class="text-sm text-gray-600">${activity.description}</p>
                        ${activity.score ? `<p class="text-xs text-green-600 font-medium">Score: ${activity.score}%</p>` : ''}
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

async function loadTeacherProfile() {
    try {
        const response = await fetchWithAuth('/auth/profile');
        if (response.ok) {
            const data = await response.json();
            populateProfileDisplay(data);
        }
    } catch (error) {
        console.error('Error loading teacher profile:', error);
    }
}

function populateProfileDisplay(data) {
    const profileSection = document.getElementById('teacherProfileDisplay');
    if (profileSection) {
        profileSection.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="text-sm font-medium text-gray-700">Full Name</label>
                    <p class="text-sm text-gray-900">${data.name || 'Not set'}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-700">Employee ID</label>
                    <p class="text-sm text-gray-900">${data.employee_id || 'Not set'}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-700">Department</label>
                    <p class="text-sm text-gray-900">${data.department || 'Not set'}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-700">Subjects</label>
                    <p class="text-sm text-gray-900">${data.subjects ? data.subjects.join(', ') : 'Not set'}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-700">APAR ID</label>
                    <p class="text-sm text-gray-900">${data.apar_id || 'Not verified'}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-700">Experience</label>
                    <p class="text-sm text-gray-900">${data.experience || 'Not set'} years</p>
                </div>
            </div>
        `;
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
        'dashboard': 'Teacher Dashboard',
        'students': 'My Students',
        'evaluations': 'Evaluations',
        'analytics': 'Performance Analytics',
        'profile': 'My Profile',
        'assignments': 'Assignments',
        'grades': 'Grade Book',
        'professional': 'Professional Development'
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
        case 'students':
            loadStudentsData();
            break;
        case 'evaluations':
            loadEvaluationsData();
            break;
        case 'analytics':
            loadAnalyticsData();
            break;
        case 'assignments':
            loadAssignmentsData();
            break;
        case 'grades':
            loadGradesData();
            break;
        default:
            break;
    }
}

async function loadStudentsData() {
    try {
        // Mock students data
        const students = [
            {
                id: '1',
                name: 'Rahul Sharma',
                email: 'rahul@example.com',
                roll_number: 'CS2021001',
                course: 'Computer Science',
                year: '3rd Year',
                current_score: 85.5,
                attendance: 92,
                status: 'active',
                last_evaluated: '2024-01-15'
            },
            {
                id: '2',
                name: 'Priya Patel',
                email: 'priya@example.com',
                roll_number: 'CS2021002',
                course: 'Computer Science',
                year: '3rd Year',
                current_score: 78.2,
                attendance: 88,
                status: 'active',
                last_evaluated: '2024-01-14'
            },
            {
                id: '3',
                name: 'Amit Kumar',
                email: 'amit@example.com',
                roll_number: 'CS2021003',
                course: 'Computer Science',
                year: '3rd Year',
                current_score: 91.7,
                attendance: 95,
                status: 'active',
                last_evaluated: '2024-01-13'
            }
        ];
        
        const tbody = document.getElementById('studentsTable');
        if (tbody) {
            tbody.innerHTML = students.map(student => `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" class="rounded student-checkbox" data-id="${student.id}" onchange="toggleStudentSelection('${student.id}')">
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10">
                                <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span class="text-sm font-medium text-blue-600">${student.name.charAt(0)}</span>
                                </div>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${student.name}</div>
                                <div class="text-sm text-gray-500">${student.email}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${student.roll_number}</div>
                        <div class="text-sm text-gray-500">${student.course}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${student.year}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-1">
                                <div class="text-sm font-medium text-gray-900">${student.current_score}%</div>
                                <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                                    <div class="bg-${student.current_score >= 80 ? 'green' : student.current_score >= 60 ? 'yellow' : 'red'}-600 h-2 rounded-full" style="width: ${student.current_score}%"></div>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${student.attendance}%
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ${student.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex space-x-2">
                            <button onclick="viewStudentDetails('${student.id}')" class="text-blue-600 hover:text-blue-900" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="evaluateStudent('${student.id}')" class="text-green-600 hover:text-green-900" title="Evaluate">
                                <i class="fas fa-clipboard-check"></i>
                            </button>
                            <button onclick="messageStudent('${student.id}')" class="text-purple-600 hover:text-purple-900" title="Message">
                                <i class="fas fa-envelope"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
        
        // Update student count
        const studentCount = document.getElementById('studentCount');
        if (studentCount) {
            studentCount.textContent = `${students.length} students`;
        }
        
    } catch (error) {
        console.error('Error loading students data:', error);
    }
}

async function loadEvaluationsData() {
    try {
        // Mock evaluations data
        const evaluations = [
            {
                id: '1',
                student_name: 'Rahul Sharma',
                subject: 'Mathematics',
                type: 'Quiz',
                score: 85,
                max_score: 100,
                date: '2024-01-15',
                feedback: 'Good performance in calculus',
                status: 'completed'
            },
            {
                id: '2',
                student_name: 'Priya Patel',
                subject: 'Physics',
                type: 'Lab Report',
                score: 78,
                max_score: 100,
                date: '2024-01-14',
                feedback: 'Needs improvement in experimental analysis',
                status: 'completed'
            },
            {
                id: '3',
                student_name: 'Amit Kumar',
                subject: 'Mathematics',
                type: 'Assignment',
                score: 0,
                max_score: 100,
                date: '2024-01-13',
                feedback: '',
                status: 'pending'
            }
        ];
        
        const tbody = document.getElementById('evaluationsTable');
        if (tbody) {
            tbody.innerHTML = evaluations.map(evaluation => `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${evaluation.student_name}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${evaluation.subject}</div>
                        <div class="text-sm text-gray-500">${evaluation.type}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${evaluation.status === 'completed' ? 
                            `<div class="text-sm font-medium text-gray-900">${evaluation.score}/${evaluation.max_score}</div>
                             <div class="text-sm text-gray-500">${Math.round((evaluation.score/evaluation.max_score)*100)}%</div>` :
                            `<span class="text-sm text-yellow-600">Pending</span>`
                        }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${evaluation.date}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${evaluation.status === 'completed' ? 'green' : 'yellow'}-100 text-${evaluation.status === 'completed' ? 'green' : 'yellow'}-800">
                            ${evaluation.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex space-x-2">
                            ${evaluation.status === 'pending' ?
                                `<button onclick="completeEvaluation('${evaluation.id}')" class="text-green-600 hover:text-green-900" title="Complete">
                                    <i class="fas fa-check"></i>
                                </button>` :
                                `<button onclick="editEvaluation('${evaluation.id}')" class="text-blue-600 hover:text-blue-900" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>`
                            }
                            <button onclick="viewEvaluationDetails('${evaluation.id}')" class="text-purple-600 hover:text-purple-900" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading evaluations data:', error);
    }
}

// Chart initialization
function initializeCharts() {
    initializePerformanceChart();
    initializeStudentProgressChart();
    initializeEvaluationTrendChart();
}

function initializePerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    performanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'],
            datasets: [{
                label: 'Average Student Score',
                data: [85, 78, 82, 79, 88],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(34, 197, 94, 0.6)',
                    'rgba(251, 191, 36, 0.6)',
                    'rgba(168, 85, 247, 0.6)',
                    'rgba(239, 68, 68, 0.6)'
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(34, 197, 94)',
                    'rgb(251, 191, 36)',
                    'rgb(168, 85, 247)',
                    'rgb(239, 68, 68)'
                ],
                borderWidth: 2
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
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function initializeStudentProgressChart() {
    const ctx = document.getElementById('studentProgressChart');
    if (!ctx) return;
    
    studentProgressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
            datasets: [{
                label: 'Class Average',
                data: [75, 78, 82, 85, 83, 87],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Top Performer',
                data: [85, 88, 92, 95, 93, 97],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 60,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function initializeEvaluationTrendChart() {
    const ctx = document.getElementById('evaluationTrendChart');
    if (!ctx) return;
    
    evaluationTrendChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending', 'In Review'],
            datasets: [{
                data: [75, 15, 10],
                backgroundColor: [
                    'rgb(34, 197, 94)',
                    'rgb(251, 191, 36)',
                    'rgb(59, 130, 246)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Student management functions
function toggleStudentSelection(id) {
    if (selectedStudents.has(id)) {
        selectedStudents.delete(id);
    } else {
        selectedStudents.add(id);
    }
    
    updateBulkActionsVisibility();
}

function updateBulkActionsVisibility() {
    const bulkActions = document.getElementById('bulkActions');
    if (bulkActions) {
        if (selectedStudents.size > 0) {
            bulkActions.classList.remove('hidden');
        } else {
            bulkActions.classList.add('hidden');
        }
    }
}

function viewStudentDetails(studentId) {
    // Mock student details
    const studentDetails = {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        roll_number: 'CS2021001',
        course: 'Computer Science',
        year: '3rd Year',
        current_score: 85.5,
        attendance: 92,
        assignments_completed: 15,
        assignments_total: 18,
        recent_scores: [85, 78, 92, 88, 76]
    };
    
    const modalContent = document.getElementById('studentModalContent');
    if (modalContent) {
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="flex items-center space-x-4">
                    <div class="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <span class="text-xl font-medium text-blue-600">${studentDetails.name.charAt(0)}</span>
                    </div>
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">${studentDetails.name}</h3>
                        <p class="text-sm text-gray-500">${studentDetails.email}</p>
                        <p class="text-sm text-gray-500">${studentDetails.roll_number}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-sm font-medium text-gray-700">Current Score</div>
                        <div class="text-2xl font-bold text-blue-600">${studentDetails.current_score}%</div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-sm font-medium text-gray-700">Attendance</div>
                        <div class="text-2xl font-bold text-green-600">${studentDetails.attendance}%</div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-sm font-medium text-gray-700">Assignments</div>
                        <div class="text-2xl font-bold text-purple-600">${studentDetails.assignments_completed}/${studentDetails.assignments_total}</div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-sm font-medium text-gray-700">Course</div>
                        <div class="text-lg font-medium text-gray-900">${studentDetails.course}</div>
                        <div class="text-sm text-gray-500">${studentDetails.year}</div>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-medium text-gray-900 mb-2">Recent Scores Trend</h4>
                    <div class="flex items-end space-x-2 h-24">
                        ${studentDetails.recent_scores.map((score, index) => `
                            <div class="flex flex-col items-center">
                                <div class="bg-blue-500 rounded-t" style="height: ${score}px; width: 20px;"></div>
                                <div class="text-xs text-gray-500 mt-1">${score}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    currentStudentData = studentDetails;
    openModal('studentModal');
}

function evaluateStudent(studentId) {
    // Pre-fill evaluation form with student data
    document.getElementById('evalStudentId').value = studentId;
    openModal('evaluationModal');
}

async function submitEvaluation(event) {
    if (event) event.preventDefault();
    
    try {
        const formData = {
            student_id: document.getElementById('evalStudentId').value,
            subject: document.getElementById('evalSubject').value,
            type: document.getElementById('evalType').value,
            score: document.getElementById('evalScore').value,
            max_score: document.getElementById('evalMaxScore').value,
            feedback: document.getElementById('evalFeedback').value,
            date: document.getElementById('evalDate').value
        };
        
        const response = await fetchWithAuth('/teacher/evaluate_student', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showMessage('Evaluation submitted successfully', 'success');
            closeModal('evaluationModal');
            loadEvaluationsData();
            document.getElementById('evaluationForm').reset();
        } else {
            showMessage('Failed to submit evaluation', 'error');
        }
    } catch (error) {
        console.error('Error submitting evaluation:', error);
        showMessage('Failed to submit evaluation', 'error');
    }
}

// Profile functions
async function updateProfile(event) {
    if (event) event.preventDefault();
    
    try {
        const formData = {
            name: document.getElementById('teacherName').value,
            employee_id: document.getElementById('employeeId').value,
            department: document.getElementById('department').value,
            subjects: document.getElementById('subjects').value.split(',').map(s => s.trim()),
            phone: document.getElementById('phone').value,
            experience: document.getElementById('experience').value,
            qualifications: document.getElementById('qualifications').value
        };
        
        const response = await fetchWithAuth('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showMessage('Profile updated successfully', 'success');
            loadTeacherProfile();
        } else {
            showMessage('Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('Failed to update profile', 'error');
    }
}

// Utility functions
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    const defaultHeaders = {
        'Authorization': `Bearer ${token}`
    };
    
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
        'info': 'blue',
        'pending': 'yellow',
        'completed': 'green'
    };
    return colors[status] || 'gray';
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

function messageStudent(studentId) {
    showMessage('Student messaging feature - Coming soon', 'info');
}

function exportStudentData() {
    showMessage('Student data export feature - Coming soon', 'info');
}

function bulkEvaluate() {
    if (selectedStudents.size === 0) {
        showMessage('Please select students to evaluate', 'warning');
        return;
    }
    showMessage('Bulk evaluation feature - Coming soon', 'info');
}

function sendBulkMessage() {
    if (selectedStudents.size === 0) {
        showMessage('Please select students to message', 'warning');
        return;
    }
    showMessage('Bulk messaging feature - Coming soon', 'info');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// Add form submit handlers
document.addEventListener('DOMContentLoaded', function() {
    const evaluationForm = document.getElementById('evaluationForm');
    if (evaluationForm) {
        evaluationForm.addEventListener('submit', submitEvaluation);
    }
    
    const profileForm = document.getElementById('teacherProfileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', updateProfile);
    }
});