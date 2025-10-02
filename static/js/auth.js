// Handle role-specific field visibility
document.getElementById('role').addEventListener('change', function(e) {
    const role = e.target.value;
    
    // Hide all role-specific fields
    document.getElementById('studentFields').classList.add('hidden');
    document.getElementById('teacherFields').classList.add('hidden');
    document.getElementById('institutionFields').classList.add('hidden');
    
    // Show relevant fields
    if (role === 'student') {
        document.getElementById('studentFields').classList.remove('hidden');
    } else if (role === 'teacher') {
        document.getElementById('teacherFields').classList.remove('hidden');
    } else if (role === 'institution') {
        document.getElementById('institutionFields').classList.remove('hidden');
    }
});

function showRegister() {
    document.getElementById('registerForm').classList.remove('hidden');
}

function hideRegister() {
    document.getElementById('registerForm').classList.add('hidden');
}

async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
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
            redirectToDashboard(data.user.role);
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('Login failed. Please try again.', 'error');
    }
}

async function register() {
    const role = document.getElementById('role').value;
    const name = document.getElementById('reg_name').value;
    const email = document.getElementById('reg_email').value;
    const password = document.getElementById('reg_password').value;
    
    const userData = {
        name,
        email,
        password,
        role,
        aadhaar_id: '123456789012' // In real app, collect this properly
    };
    
    // Add role-specific data
    if (role === 'student') {
        userData.enrollment_no = document.getElementById('enrollment_no').value;
    } else if (role === 'teacher') {
        userData.apar_id = document.getElementById('apar_id').value;
        userData.subject = document.getElementById('subject').value;
    } else if (role === 'institution') {
        userData.aishe_code = document.getElementById('aishe_code').value;
        userData.institution_name = document.getElementById('institution_name').value;
    }
    
    try {
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
            showMessage('Registration successful!', 'success');
            setTimeout(() => {
                redirectToDashboard(data.user.role);
            }, 2000);
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('Registration failed. Please try again.', 'error');
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
    messageDiv.textContent = message;
    messageDiv.className = `mt-4 p-3 rounded-md ${type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
    messageDiv.classList.remove('hidden');
    
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 5000);
}