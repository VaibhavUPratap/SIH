// EduVerify Institution Dashboard JavaScript

// Global variables
let currentSection = 'dashboard';
let enrollmentChart = null;
let performanceChart = null;
let complianceChart = null;
let schemesChart = null;
let selectedStudents = new Set();
let selectedTeachers = new Set();
let currentReportData = null;

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
    if (user.role !== 'institution') {
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
    
    if (avatar && user.institution_name) {
        avatar.textContent = user.institution_name.charAt(0).toUpperCase();
    }
    
    if (userName) {
        userName.textContent = user.institution_name || 'Institution User';
    }
    
    if (userEmail && user.email) {
        userEmail.textContent = user.email;
    }
}

async function loadDashboardData() {
    try {
        showLoading();
        
        // Load institution analytics data
        const response = await fetchWithAuth('/institution/analytics');
        if (response.ok) {
            const data = await response.json();
            updateDashboardStats(data);
        } else {
            // Use mock data if API fails
            updateDashboardStats({
                total_students: 2547,
                total_teachers: 156,
                active_courses: 42,
                nirf_rank: 78,
                aishe_verified: true,
                compliance_score: 94.2,
                schemes_active: 8,
                graduation_rate: 87.5,
                placement_rate: 76.3,
                research_publications: 234
            });
        }
        
        // Load recent activities
        loadRecentActivities();
        
        // Load institution profile
        loadInstitutionProfile();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showMessage('Failed to load dashboard data', 'error');
    } finally {
        hideLoading();
    }
}

function updateDashboardStats(data) {
    // Update stat cards
    updateStatCard('totalStudents', data.total_students || 2547);
    updateStatCard('totalTeachers', data.total_teachers || 156);
    updateStatCard('activeCourses', data.active_courses || 42);
    updateStatCard('nirfRank', data.nirf_rank ? `#${data.nirf_rank}` : 'Not Ranked');
    updateStatCard('complianceScore', `${data.compliance_score || 94.2}%`);
    updateStatCard('graduationRate', `${data.graduation_rate || 87.5}%`);
    updateStatCard('placementRate', `${data.placement_rate || 76.3}%`);
    updateStatCard('researchPublications', data.research_publications || 234);
    
    // Update AISHE verification status
    const aisheStatus = document.getElementById('aisheStatus');
    if (aisheStatus) {
        if (data.aishe_verified) {
            aisheStatus.innerHTML = `
                <div class="flex items-center">
                    <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span class="text-sm">AISHE Verified</span>
                </div>
            `;
        } else {
            aisheStatus.innerHTML = `
                <div class="flex items-center">
                    <div class="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                    <span class="text-sm">AISHE Pending</span>
                </div>
            `;
        }
    }
    
    // Update compliance indicator
    const complianceIndicator = document.getElementById('complianceIndicator');
    if (complianceIndicator) {
        const score = data.compliance_score || 94.2;
        let colorClass = 'green';
        if (score < 70) colorClass = 'red';
        else if (score < 85) colorClass = 'yellow';
        
        complianceIndicator.className = `w-2 h-2 bg-${colorClass}-400 rounded-full mr-2`;
    }
    
    // Update schemes count
    const schemesCount = document.getElementById('schemesCount');
    if (schemesCount) {
        schemesCount.textContent = `${data.schemes_active || 8} Active Schemes`;
    }
}

function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        if (typeof value === 'number') {
            element.textContent = value.toLocaleString();
        } else {
            element.textContent = value;
        }
    }
}

async function loadRecentActivities() {
    try {
        // Mock recent activities data
        const activities = [
            { 
                time: '10 minutes ago', 
                action: 'Student Enrollment', 
                description: 'New student batch enrolled - 45 students',
                icon: 'fas fa-user-plus',
                status: 'success',
                count: 45
            },
            { 
                time: '1 hour ago', 
                action: 'NIRF Submission', 
                description: 'Annual NIRF data submitted successfully',
                icon: 'fas fa-file-upload',
                status: 'success'
            },
            { 
                time: '3 hours ago', 
                action: 'Faculty Hired', 
                description: '3 new faculty members joined',
                icon: 'fas fa-chalkboard-teacher',
                status: 'info',
                count: 3
            },
            { 
                time: '1 day ago', 
                action: 'Research Grant', 
                description: 'Received ₹50L research grant',
                icon: 'fas fa-award',
                status: 'success',
                amount: '₹50L'
            },
            { 
                time: '2 days ago', 
                action: 'Compliance Review', 
                description: 'Passed UGC compliance audit',
                icon: 'fas fa-shield-check',
                status: 'success'
            }
        ];
        
        const container = document.getElementById('recentActivitiesList');
        if (container) {
            container.innerHTML = activities.map(activity => `
                <div class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div class="flex-shrink-0">
                        <div class="w-12 h-12 bg-${getStatusColor(activity.status)}-100 rounded-full flex items-center justify-center">
                            <i class="${activity.icon} text-${getStatusColor(activity.status)}-600"></i>
                        </div>
                    </div>
                    <div class="ml-4 flex-1">
                        <p class="font-medium text-gray-900">${activity.action}</p>
                        <p class="text-sm text-gray-600">${activity.description}</p>
                        ${activity.count ? `<p class="text-xs text-blue-600 font-medium">Count: ${activity.count}</p>` : ''}
                        ${activity.amount ? `<p class="text-xs text-green-600 font-medium">Amount: ${activity.amount}</p>` : ''}
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

async function loadInstitutionProfile() {
    try {
        const response = await fetchWithAuth('/auth/profile');
        if (response.ok) {
            const data = await response.json();
            populateInstitutionProfile(data);
        }
    } catch (error) {
        console.error('Error loading institution profile:', error);
    }
}

function populateInstitutionProfile(data) {
    const profileSection = document.getElementById('institutionProfileDisplay');
    if (profileSection) {
        profileSection.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="text-sm font-medium text-gray-700">Institution Name</label>
                    <p class="text-sm text-gray-900">${data.institution_name || 'Not set'}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-700">AISHE Code</label>
                    <p class="text-sm text-gray-900">${data.aishe_code || 'Not verified'}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-700">University Type</label>
                    <p class="text-sm text-gray-900">${data.university_type || 'Not set'}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-700">Established Year</label>
                    <p class="text-sm text-gray-900">${data.established_year || 'Not set'}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-700">Address</label>
                    <p class="text-sm text-gray-900">${data.address || 'Not set'}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-700">Contact</label>
                    <p class="text-sm text-gray-900">${data.contact || 'Not set'}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-700">Website</label>
                    <p class="text-sm text-gray-900">${data.website || 'Not set'}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-700">Accreditation</label>
                    <p class="text-sm text-gray-900">${data.accreditation || 'Not set'}</p>
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
        'dashboard': 'Institution Dashboard',
        'students': 'Student Management',
        'teachers': 'Faculty Management',
        'courses': 'Course Management',
        'analytics': 'Analytics & Reports',
        'compliance': 'Compliance & Accreditation',
        'schemes': 'Government Schemes',
        'profile': 'Institution Profile',
        'research': 'Research & Development'
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
        case 'teachers':
            loadTeachersData();
            break;
        case 'courses':
            loadCoursesData();
            break;
        case 'analytics':
            loadAnalyticsData();
            break;
        case 'compliance':
            loadComplianceData();
            break;
        case 'schemes':
            loadSchemesData();
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
                email: 'rahul@student.edu',
                roll_number: 'CS2021001',
                course: 'Computer Science',
                year: '3rd Year',
                batch: '2021-2025',
                cgpa: 8.5,
                status: 'active',
                fees_status: 'paid',
                documents_verified: true
            },
            {
                id: '2',
                name: 'Priya Patel',
                email: 'priya@student.edu',
                roll_number: 'EC2021002',
                course: 'Electronics',
                year: '2nd Year',
                batch: '2022-2026',
                cgpa: 7.8,
                status: 'active',
                fees_status: 'pending',
                documents_verified: false
            },
            {
                id: '3',
                name: 'Amit Kumar',
                email: 'amit@student.edu',
                roll_number: 'ME2020003',
                course: 'Mechanical Engineering',
                year: '4th Year',
                batch: '2020-2024',
                cgpa: 9.1,
                status: 'active',
                fees_status: 'paid',
                documents_verified: true
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
                        <div class="text-sm text-gray-500">${student.batch}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${student.course}</div>
                        <div class="text-sm text-gray-500">${student.year}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${student.cgpa}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${student.fees_status === 'paid' ? 'green' : 'red'}-100 text-${student.fees_status === 'paid' ? 'green' : 'red'}-800">
                            ${student.fees_status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${student.documents_verified ? 'green' : 'yellow'}-100 text-${student.documents_verified ? 'green' : 'yellow'}-800">
                            ${student.documents_verified ? 'verified' : 'pending'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex space-x-2">
                            <button onclick="viewStudentDetails('${student.id}')" class="text-blue-600 hover:text-blue-900" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="editStudent('${student.id}')" class="text-green-600 hover:text-green-900" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="generateStudentReport('${student.id}')" class="text-purple-600 hover:text-purple-900" title="Report">
                                <i class="fas fa-chart-line"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading students data:', error);
    }
}

async function loadTeachersData() {
    try {
        // Mock teachers data
        const teachers = [
            {
                id: '1',
                name: 'Dr. Sarah Johnson',
                email: 'sarah@faculty.edu',
                employee_id: 'EMP001',
                department: 'Computer Science',
                designation: 'Professor',
                experience: 15,
                qualification: 'Ph.D.',
                apar_status: 'verified',
                courses_assigned: 3,
                research_papers: 25
            },
            {
                id: '2',
                name: 'Prof. Rajesh Kumar',
                email: 'rajesh@faculty.edu',
                employee_id: 'EMP002',
                department: 'Electronics',
                designation: 'Associate Professor',
                experience: 12,
                qualification: 'Ph.D.',
                apar_status: 'pending',
                courses_assigned: 2,
                research_papers: 18
            },
            {
                id: '3',
                name: 'Dr. Meera Singh',
                email: 'meera@faculty.edu',
                employee_id: 'EMP003',
                department: 'Mechanical',
                designation: 'Assistant Professor',
                experience: 8,
                qualification: 'Ph.D.',
                apar_status: 'verified',
                courses_assigned: 4,
                research_papers: 12
            }
        ];
        
        const tbody = document.getElementById('teachersTable');
        if (tbody) {
            tbody.innerHTML = teachers.map(teacher => `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" class="rounded teacher-checkbox" data-id="${teacher.id}" onchange="toggleTeacherSelection('${teacher.id}')">
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10">
                                <div class="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <span class="text-sm font-medium text-green-600">${teacher.name.charAt(0)}</span>
                                </div>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${teacher.name}</div>
                                <div class="text-sm text-gray-500">${teacher.email}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${teacher.employee_id}</div>
                        <div class="text-sm text-gray-500">${teacher.qualification}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${teacher.department}</div>
                        <div class="text-sm text-gray-500">${teacher.designation}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${teacher.experience} years
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${teacher.courses_assigned}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${teacher.apar_status === 'verified' ? 'green' : 'yellow'}-100 text-${teacher.apar_status === 'verified' ? 'green' : 'yellow'}-800">
                            ${teacher.apar_status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex space-x-2">
                            <button onclick="viewTeacherDetails('${teacher.id}')" class="text-blue-600 hover:text-blue-900" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="editTeacher('${teacher.id}')" class="text-green-600 hover:text-green-900" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="assignCourses('${teacher.id}')" class="text-purple-600 hover:text-purple-900" title="Assign Courses">
                                <i class="fas fa-tasks"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading teachers data:', error);
    }
}

async function loadSchemesData() {
    try {
        // Mock schemes data
        const schemes = [
            {
                id: '1',
                name: 'PM USHA Scholarship',
                category: 'Student Scholarship',
                target_audience: 'Undergraduate Students',
                budget_allocated: '₹50,00,000',
                applications_received: 245,
                applications_approved: 180,
                deadline: '2024-03-31',
                status: 'active'
            },
            {
                id: '2',
                name: 'Research Infrastructure Grant',
                category: 'Infrastructure',
                target_audience: 'Institution',
                budget_allocated: '₹2,00,00,000',
                applications_received: 1,
                applications_approved: 0,
                deadline: '2024-04-15',
                status: 'pending'
            },
            {
                id: '3',
                name: 'Faculty Development Program',
                category: 'Professional Development',
                target_audience: 'Faculty',
                budget_allocated: '₹25,00,000',
                applications_received: 35,
                applications_approved: 28,
                deadline: '2024-02-28',
                status: 'active'
            }
        ];
        
        const tbody = document.getElementById('schemesTable');
        if (tbody) {
            tbody.innerHTML = schemes.map(scheme => `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${scheme.name}</div>
                        <div class="text-sm text-gray-500">${scheme.category}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${scheme.target_audience}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${scheme.budget_allocated}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${scheme.applications_received} received</div>
                        <div class="text-sm text-gray-500">${scheme.applications_approved} approved</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${scheme.deadline}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${scheme.status === 'active' ? 'green' : 'yellow'}-100 text-${scheme.status === 'active' ? 'green' : 'yellow'}-800">
                            ${scheme.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex space-x-2">
                            <button onclick="viewSchemeDetails('${scheme.id}')" class="text-blue-600 hover:text-blue-900" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="manageApplications('${scheme.id}')" class="text-green-600 hover:text-green-900" title="Manage Applications">
                                <i class="fas fa-tasks"></i>
                            </button>
                            <button onclick="generateSchemeReport('${scheme.id}')" class="text-purple-600 hover:text-purple-900" title="Report">
                                <i class="fas fa-chart-bar"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading schemes data:', error);
    }
}

// Chart initialization
function initializeCharts() {
    initializeEnrollmentChart();
    initializePerformanceChart();
    initializeComplianceChart();
    initializeSchemesChart();
}

function initializeEnrollmentChart() {
    const ctx = document.getElementById('enrollmentChart');
    if (!ctx) return;
    
    enrollmentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
            datasets: [{
                label: 'Total Enrollment',
                data: [2100, 2250, 2400, 2380, 2520, 2547],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Graduation Rate',
                data: [82, 85, 87, 84, 86, 87.5],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                yAxisID: 'y1'
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
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 0,
                    max: 100,
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

function initializePerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    performanceChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Academic', 'Research', 'Placement', 'Infrastructure', 'Faculty', 'Innovation'],
            datasets: [{
                label: 'Current Score',
                data: [85, 78, 76, 92, 88, 82],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(59, 130, 246)'
            }, {
                label: 'Target Score',
                data: [90, 85, 80, 95, 90, 88],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                pointBackgroundColor: 'rgb(34, 197, 94)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(34, 197, 94)'
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
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function initializeComplianceChart() {
    const ctx = document.getElementById('complianceChart');
    if (!ctx) return;
    
    complianceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Compliant', 'Pending', 'Non-Compliant'],
            datasets: [{
                data: [85, 12, 3],
                backgroundColor: [
                    'rgb(34, 197, 94)',
                    'rgb(251, 191, 36)',
                    'rgb(239, 68, 68)'
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

function initializeSchemesChart() {
    const ctx = document.getElementById('schemesChart');
    if (!ctx) return;
    
    schemesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Student Schemes', 'Faculty Schemes', 'Infrastructure', 'Research Grants'],
            datasets: [{
                label: 'Applications',
                data: [245, 35, 5, 8],
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2
            }, {
                label: 'Approved',
                data: [180, 28, 3, 6],
                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 2
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
                    beginAtZero: true
                }
            }
        }
    });
}

// Management functions
function toggleStudentSelection(id) {
    if (selectedStudents.has(id)) {
        selectedStudents.delete(id);
    } else {
        selectedStudents.add(id);
    }
    updateBulkStudentActions();
}

function toggleTeacherSelection(id) {
    if (selectedTeachers.has(id)) {
        selectedTeachers.delete(id);
    } else {
        selectedTeachers.add(id);
    }
    updateBulkTeacherActions();
}

function updateBulkStudentActions() {
    const bulkActions = document.getElementById('bulkStudentActions');
    if (bulkActions) {
        if (selectedStudents.size > 0) {
            bulkActions.classList.remove('hidden');
        } else {
            bulkActions.classList.add('hidden');
        }
    }
}

function updateBulkTeacherActions() {
    const bulkActions = document.getElementById('bulkTeacherActions');
    if (bulkActions) {
        if (selectedTeachers.size > 0) {
            bulkActions.classList.remove('hidden');
        } else {
            bulkActions.classList.add('hidden');
        }
    }
}

// Modal and detail view functions
function viewStudentDetails(studentId) {
    showMessage(`Student details for ID: ${studentId} - Feature coming soon`, 'info');
}

function viewTeacherDetails(teacherId) {
    showMessage(`Teacher details for ID: ${teacherId} - Feature coming soon`, 'info');
}

function viewSchemeDetails(schemeId) {
    showMessage(`Scheme details for ID: ${schemeId} - Feature coming soon`, 'info');
}

function editStudent(studentId) {
    showMessage(`Edit student for ID: ${studentId} - Feature coming soon`, 'info');
}

function editTeacher(teacherId) {
    showMessage(`Edit teacher for ID: ${teacherId} - Feature coming soon`, 'info');
}

function assignCourses(teacherId) {
    showMessage(`Assign courses for teacher ID: ${teacherId} - Feature coming soon`, 'info');
}

function manageApplications(schemeId) {
    showMessage(`Manage applications for scheme ID: ${schemeId} - Feature coming soon`, 'info');
}

// Report generation functions
function generateStudentReport(studentId) {
    showMessage(`Generating student report for ID: ${studentId}`, 'info');
}

function generateSchemeReport(schemeId) {
    showMessage(`Generating scheme report for ID: ${schemeId}`, 'info');
}

function generateInstitutionReport() {
    showMessage('Generating comprehensive institution report', 'info');
}

function exportStudentData() {
    if (selectedStudents.size === 0) {
        showMessage('Please select students to export', 'warning');
        return;
    }
    showMessage(`Exporting data for ${selectedStudents.size} students`, 'info');
}

function exportTeacherData() {
    if (selectedTeachers.size === 0) {
        showMessage('Please select teachers to export', 'warning');
        return;
    }
    showMessage(`Exporting data for ${selectedTeachers.size} teachers`, 'info');
}

// Profile management
async function updateInstitutionProfile(event) {
    if (event) event.preventDefault();
    
    try {
        const formData = {
            institution_name: document.getElementById('institutionName').value,
            aishe_code: document.getElementById('aisheCode').value,
            university_type: document.getElementById('universityType').value,
            established_year: document.getElementById('establishedYear').value,
            address: document.getElementById('address').value,
            contact: document.getElementById('contact').value,
            website: document.getElementById('website').value,
            accreditation: document.getElementById('accreditation').value
        };
        
        const response = await fetchWithAuth('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showMessage('Institution profile updated successfully', 'success');
            loadInstitutionProfile();
        } else {
            showMessage('Failed to update institution profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('Failed to update institution profile', 'error');
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
        'active': 'green',
        'verified': 'green'
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

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// Add form submit handlers
document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('institutionProfileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', updateInstitutionProfile);
    }
});