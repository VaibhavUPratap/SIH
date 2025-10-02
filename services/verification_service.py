import hashlib
import random
import string
from datetime import datetime, timedelta

class VerificationService:
    
    @staticmethod
    def verify_aadhaar(aadhaar_id):
        """Mock Aadhaar verification (replace with actual eKYC API)"""
        # Basic validation
        if not aadhaar_id or len(aadhaar_id) != 12 or not aadhaar_id.isdigit():
            return {
                'verified': False,
                'error': 'Invalid Aadhaar format'
            }
        
        # Mock verification logic
        # In production, integrate with actual Aadhaar eKYC API
        return {
            'verified': True,
            'name': 'Mock User',
            'age': 25,
            'address': 'Mock Address, India'
        }
    
    @staticmethod
    def verify_apar_id(apar_id, aadhaar_id):
        """Mock APAR ID verification"""
        if not apar_id or len(apar_id) < 8:
            return {
                'verified': False,
                'error': 'Invalid APAR ID format'
            }
        
        # Mock verification with Aadhaar cross-reference
        aadhaar_result = VerificationService.verify_aadhaar(aadhaar_id)
        if not aadhaar_result.get('verified'):
            return aadhaar_result
        
        return {
            'verified': True,
            'teacher_name': aadhaar_result['name'],
            'department': 'Mock Department',
            'institution': 'Mock Institution'
        }
    
    @staticmethod
    def verify_aishe_code(aishe_code, admin_aadhaar):
        """Mock AISHE code verification"""
        if not aishe_code or len(aishe_code) < 6:
            return {
                'verified': False,
                'error': 'Invalid AISHE code format'
            }
        
        # Verify admin Aadhaar
        aadhaar_result = VerificationService.verify_aadhaar(admin_aadhaar)
        if not aadhaar_result.get('verified'):
            return aadhaar_result
        
        return {
            'verified': True,
            'institution_name': 'Mock University',
            'established_year': 1950,
            'location': 'Mock City, India',
            'admin_verified': True
        }
    
    @staticmethod
    def generate_otp():
        """Generate 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=6))
    
    @staticmethod
    def verify_otp(stored_otp, entered_otp, generated_time):
        """Verify OTP with expiration check"""
        # Check if OTP is expired (5 minutes)
        if datetime.utcnow() - generated_time > timedelta(minutes=5):
            return {
                'verified': False,
                'error': 'OTP expired'
            }
        
        if stored_otp != entered_otp:
            return {
                'verified': False,
                'error': 'Invalid OTP'
            }
        
        return {
            'verified': True,
            'message': 'OTP verified successfully'
        }
    
    @staticmethod
    def hash_sensitive_data(data):
        """Hash sensitive data like Aadhaar for storage"""
        return hashlib.sha256(data.encode()).hexdigest()
    
    @staticmethod
    def verify_govt_email(email):
        """Verify government email domain"""
        govt_domains = ['gov.in', 'nic.in', 'mhrd.gov.in', 'education.gov.in']
        domain = email.split('@')[-1].lower()
        
        return {
            'verified': domain in govt_domains,
            'domain': domain
        }