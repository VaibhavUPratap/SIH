// Main JavaScript file for Unified Education Interface

// Global utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-black' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// API utility functions
async function makeAuthenticatedRequest(url, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };
    
    try {
        const response = await fetch(url, mergedOptions);
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            return null;
        }
        
        return response;
    } catch (error) {
        console.error('Request failed:', error);
        showNotification('Request failed. Please try again.', 'error');
        return null;
    }
}

// Loading spinner utility
function showLoadingSpinner(element) {
    element.innerHTML = `
        <div class="flex justify-center items-center py-4">
            <div class="loading-spinner"></div>
        </div>
    `;
}

function hideLoadingSpinner(element, originalContent) {
    element.innerHTML = originalContent;
}

// Date formatting utility
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Form validation utilities
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateAadhaar(aadhaar) {
    return /^\d{12}$/.test(aadhaar);
}

function validateAPARId(aparId) {
    return aparId && aparId.length >= 8;
}

function validateAISHECode(aisheCode) {
    return aisheCode && aisheCode.length >= 6;
}

// Modal utilities
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        // Add escape key listener
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                closeModal(modalId);
                document.removeEventListener('keydown', escapeHandler);
            }
        });
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Token management
function checkTokenExpiration() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return false;
    }
    
    // Basic token check - in production, decode JWT and check expiration
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (payload.exp && payload.exp < currentTime) {
            localStorage.removeItem('token');
            showNotification('Session expired. Please login again.', 'warning');
            window.location.href = '/login';
            return false;
        }
    } catch (error) {
        console.warn('Token parsing failed:', error);
    }
    
    return true;
}

// Initialize common functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check token on page load for protected pages
    if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        checkTokenExpiration();
    }
    
    // Auto-refresh token periodically (every 30 minutes)
    setInterval(checkTokenExpiration, 30 * 60 * 1000);
    
    // Add click-to-close functionality for modals
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.add('hidden');
            }
        }
    });
});

// Export functions for use in other scripts
window.UEI = {
    showNotification,
    makeAuthenticatedRequest,
    showLoadingSpinner,
    hideLoadingSpinner,
    formatDate,
    validateEmail,
    validateAadhaar,
    validateAPARId,
    validateAISHECode,
    openModal,
    closeModal,
    checkTokenExpiration
};