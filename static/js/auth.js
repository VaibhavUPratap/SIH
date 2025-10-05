// Global variables
let isRegistrationMode = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {
    // Handle role-specific field visibility
    const roleSelect = document.getElementById('role');
    if (roleSelect) {
        roleSelect.addEventListener('change', handleRoleChange);
    }
    
    // Check for authentication token
    const token = localStorage.getItem('token');
    if (token && isValidToken(token)) {
        // Redirect to dashboard if already logged in
        const userRole = getUserRoleFromToken(token);
        if (userRole) {
            redirectToDashboard(userRole);
        }
    }
}

function handleRoleChange(e) {
    const role = e.target.value;
    
    // Hide all role-specific fields
    const fieldGroups = ['studentFields', 'teacherFields', 'institutionFields'];
    fieldGroups.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.classList.add('hidden');
        }
    });
    
    // Show relevant fields
    if (role === 'student') {
        showElement('studentFields');
    } else if (role === 'teacher') {
        showElement('teacherFields');
    } else if (role === 'institution') {
        showElement('institutionFields');
    }
}

function showRegister() {
    const modal = document.getElementById('registrationModal');
    if (modal) {
        modal.classList.remove('hidden');
        isRegistrationMode = true;
        // Reset form
        const form = modal.querySelector('form');
        if (form) form.reset();
        // Trigger role change to show correct fields
        handleRoleChange({ target: { value: 'student' } });
    }
}

function hideRegister() {
    const modal = document.getElementById('registrationModal');
    if (modal) {
        modal.classList.add('hidden');
        isRegistrationMode = false;
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const eyeIcon = document.getElementById(inputId + '-eye');
    
    if (input && eyeIcon) {
        if (input.type === 'password') {
            input.type = 'text';
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
        }
    }
}

function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('hidden');
    }
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('hidden');
    }
}

function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.remove('hidden');
    }
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
}

async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn.innerHTML;
    
    try {
        // Show loading state
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Signing In...';
        loginBtn.disabled = true;
        showLoading();
        
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showMessage('Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                redirectToDashboard(data.user.role);
            }, 1000);
        } else {
            showMessage(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Login failed. Please check your connection and try again.', 'error');
    } finally {
        // Reset button state
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
        hideLoading();
    }
}

async function register(event) {
    event.preventDefault();
    
    const role = document.getElementById('role').value;
    const name = document.getElementById('reg_name').value.trim();
    const email = document.getElementById('reg_email').value.trim();
    const password = document.getElementById('reg_password').value;
    const aadhaar_id = document.getElementById('aadhaar_id').value.trim();
    
    // Validation
    if (!name || !email || !password || !aadhaar_id) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    if (!isValidAadhaar(aadhaar_id)) {
        showMessage('Please enter a valid 12-digit Aadhaar number', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
    }
    
    const userData = {
        name,
        email,
        password,
        role,
        aadhaar_id
    };
    
    // Add role-specific data with validation
    if (role === 'student') {
        const enrollment_no = document.getElementById('enrollment_no').value.trim();
        if (!enrollment_no) {
            showMessage('Enrollment number is required for students', 'error');
            return;
        }
        userData.enrollment_no = enrollment_no;
    } else if (role === 'teacher') {
        const apar_id = document.getElementById('apar_id').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const department = document.getElementById('department').value.trim();
        
        if (!apar_id) {
            showMessage('APAR ID is required for teachers', 'error');
            return;
        }
        
        userData.apar_id = apar_id;
        userData.subject = subject || '';
        userData.department = department || '';
    } else if (role === 'institution') {
        const aishe_code = document.getElementById('aishe_code').value.trim();
        const institution_name = document.getElementById('institution_name').value.trim();
        const institution_type = document.getElementById('institution_type').value;
        
        if (!aishe_code || !institution_name) {
            showMessage('AISHE code and institution name are required', 'error');
            return;
        }
        
        userData.aishe_code = aishe_code;
        userData.institution_name = institution_name;
        userData.institution_type = institution_type;
    }
    
    const registerBtn = document.getElementById('registerBtn');
    const originalText = registerBtn.innerHTML;
    
    try {
        // Show loading state
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Registering...';
        registerBtn.disabled = true;
        showLoading();
        
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showMessage('Registration successful! Redirecting...', 'success');
            
            setTimeout(() => {
                hideRegister();
                redirectToDashboard(data.user.role);
            }, 1500);
        } else {
            showMessage(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Registration failed. Please check your connection and try again.', 'error');
    } finally {
        // Reset button state
        registerBtn.innerHTML = originalText;
        registerBtn.disabled = false;
        hideLoading();
    }
}

function redirectToDashboard(role) {
    switch(role) {
        case 'student':
            window.location.href = '/student/dashboard';
            break;
        case 'teacher':
            window.location.href = '/teacher/dashboard';
            break;
        case 'institution':
            window.location.href = '/institution/dashboard';
            break;
        case 'admin':
            window.location.href = '/admin/dashboard';
            break;
        default:
            window.location.href = '/';
    }
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    const messageText = document.getElementById('messageText');
    
    if (messageDiv && messageText) {
        messageText.textContent = message;
        
        // Update styling based on type
        const iconClass = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
        const colorClass = type === 'error' ? 'border-red-500' : 'border-green-500';
        const bgClass = type === 'error' ? 'bg-red-50' : 'bg-green-50';
        const textClass = type === 'error' ? 'text-red-800' : 'text-green-800';
        
        const icon = messageDiv.querySelector('i');
        if (icon) {
            icon.className = `fas ${iconClass} ${type === 'error' ? 'text-red-500' : 'text-green-500'} mr-3`;
        }
        
        const container = messageDiv.querySelector('div');
        if (container) {
            container.className = `${bgClass} border-l-4 ${colorClass} rounded-lg shadow-lg p-4 max-w-md`;
            messageText.className = textClass;
        }
        
        messageDiv.classList.remove('hidden');
        
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    }
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidAadhaar(aadhaar) {
    return /^[0-9]{12}$/.test(aadhaar);
}

function isValidToken(token) {
    if (!token) return false;
    
    try {
        // Basic token validation (in production, verify signature)
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        
        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        return payload.exp > currentTime;
    } catch (error) {
        return false;
    }
}

function getUserRoleFromToken(token) {
    try {
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        const user = JSON.parse(localStorage.getItem('user'));
        return user ? user.role : null;
    } catch (error) {
        return null;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Handle page visibility to check token validity
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        const token = localStorage.getItem('token');
        if (token && !isValidToken(token)) {
            logout();
        }
    }
});

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        hideRegister();
    }
});
