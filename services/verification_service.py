import hashlib
import random
import string
from datetime import datetime, timedelta

class VerificationService:
    
    @staticmethod
    def verify_aadhaar(aadhaar_id):
        """Advanced Aadhaar verification with checksum validation"""
        # Basic format validation
        if not aadhaar_id or len(aadhaar_id) != 12 or not aadhaar_id.isdigit():
            return {
                'verified': False,
                'error': 'Invalid Aadhaar format - must be 12 digits',
                'confidence_score': 0.0
            }
        
        # Verhoeff checksum algorithm validation
        if not VerificationService._verify_aadhaar_checksum(aadhaar_id):
            return {
                'verified': False,
                'error': 'Invalid Aadhaar number - checksum validation failed',
                'confidence_score': 0.0
            }
        
        # Additional pattern checks
        if VerificationService._is_sequential_number(aadhaar_id) or VerificationService._is_repeated_digits(aadhaar_id):
            return {
                'verified': False,
                'error': 'Invalid Aadhaar number - suspicious pattern detected',
                'confidence_score': 0.1
            }
        
        # Mock verification for demo (replace with actual eKYC API)
        # In production, integrate with UIDAI eKYC API
        mock_verification = VerificationService._mock_aadhaar_verification(aadhaar_id)
        
        return {
            'verified': mock_verification['verified'],
            'name': mock_verification.get('name', 'Unknown'),
            'age': mock_verification.get('age', 0),
            'address': mock_verification.get('address', ''),
            'confidence_score': mock_verification.get('confidence_score', 0.8),
            'verification_method': 'checksum_plus_mock'
        }
    
    @staticmethod
    def verify_apar_id(apar_id, aadhaar_id=None):
        """Advanced APAR ID verification with database lookup"""
        if not apar_id or len(apar_id) < 6:
            return {
                'verified': False,
                'error': 'Invalid APAR ID format - must be at least 6 characters',
                'confidence_score': 0.0
            }
        
        # Check against APAR registry
        from models.verification import APARRegistry
        apar_record = APARRegistry.query.filter_by(apar_id=apar_id).first()
        
        if not apar_record:
            return {
                'verified': False,
                'error': 'APAR ID not found in registry - requires admin verification',
                'confidence_score': 0.0,
                'requires_manual_verification': True
            }
        
        if apar_record.status != 'active':
            return {
                'verified': False,
                'error': f'APAR ID status is {apar_record.status}',
                'confidence_score': 0.2
            }
        
        if apar_record.verification_level != 'verified':
            return {
                'verified': False,
                'error': 'APAR ID pending admin verification',
                'confidence_score': 0.5,
                'requires_manual_verification': True
            }
        
        # Cross-reference with Aadhaar if provided
        confidence_score = 0.8
        if aadhaar_id:
            aadhaar_result = VerificationService.verify_aadhaar(aadhaar_id)
            if aadhaar_result.get('verified'):
                confidence_score = 0.9
            else:
                confidence_score = 0.6
        
        return {
            'verified': True,
            'teacher_name': apar_record.teacher_name,
            'designation': apar_record.designation,
            'department': apar_record.department,
            'institution': apar_record.institution_name,
            'joining_date': apar_record.joining_date.isoformat() if apar_record.joining_date else None,
            'confidence_score': confidence_score,
            'verification_method': 'registry_lookup'
        }
    
    @staticmethod
    def verify_aishe_code(aishe_code, admin_aadhaar=None):
        """Advanced AISHE code verification with database lookup"""
        if not aishe_code or len(aishe_code) < 6:
            return {
                'verified': False,
                'error': 'Invalid AISHE code format - must be at least 6 characters',
                'confidence_score': 0.0
            }
        
        # Check against AISHE registry
        from models.verification import AISHERegistry
        aishe_record = AISHERegistry.query.filter_by(aishe_code=aishe_code).first()
        
        if not aishe_record:
            return {
                'verified': False,
                'error': 'AISHE code not found in registry - requires admin verification',
                'confidence_score': 0.0,
                'requires_manual_verification': True
            }
        
        if aishe_record.status != 'active':
            return {
                'verified': False,
                'error': f'Institution status is {aishe_record.status}',
                'confidence_score': 0.2
            }
        
        if aishe_record.verification_level != 'verified':
            return {
                'verified': False,
                'error': 'AISHE code pending admin verification',
                'confidence_score': 0.5,
                'requires_manual_verification': True
            }
        
        # Cross-reference with admin Aadhaar if provided
        confidence_score = 0.8
        admin_verified = False
        if admin_aadhaar:
            aadhaar_result = VerificationService.verify_aadhaar(admin_aadhaar)
            if aadhaar_result.get('verified'):
                confidence_score = 0.9
                admin_verified = True
            else:
                confidence_score = 0.6
        
        return {
            'verified': True,
            'institution_name': aishe_record.institution_name,
            'institution_type': aishe_record.institution_type,
            'state': aishe_record.state,
            'district': aishe_record.district,
            'established_year': aishe_record.established_year,
            'accreditation_status': aishe_record.accreditation_status,
            'university_affiliation': aishe_record.university_affiliation,
            'admin_verified': admin_verified,
            'confidence_score': confidence_score,
            'verification_method': 'registry_lookup'
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
    
    @staticmethod
    def _verify_aadhaar_checksum(aadhaar_id):
        """Verify Aadhaar using Verhoeff checksum algorithm"""
        # Verhoeff checksum validation tables
        d_table = [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
            [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
            [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
            [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
            [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
            [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
            [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
            [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
            [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
        ]
        
        p_table = [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
            [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
            [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
            [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
            [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
            [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
            [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
        ]
        
        inv_table = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9]
        
        try:
            # Convert string to list of integers
            digits = [int(d) for d in aadhaar_id]
            
            # Calculate checksum
            checksum = 0
            for i, digit in enumerate(reversed(digits)):
                checksum = d_table[checksum][p_table[i % 8][digit]]
            
            return checksum == 0
        except (ValueError, IndexError):
            return False
    
    @staticmethod
    def _is_sequential_number(number_str):
        """Check if number has sequential digits (e.g., 123456789012)"""
        sequential_count = 0
        for i in range(len(number_str) - 1):
            if int(number_str[i+1]) == int(number_str[i]) + 1:
                sequential_count += 1
            else:
                sequential_count = 0
            
            # If more than 4 sequential digits, consider it suspicious
            if sequential_count >= 4:
                return True
        return False
    
    @staticmethod
    def _is_repeated_digits(number_str):
        """Check if number has too many repeated digits"""
        digit_counts = {}
        for digit in number_str:
            digit_counts[digit] = digit_counts.get(digit, 0) + 1
        
        # If any digit appears more than 6 times, consider suspicious
        max_count = max(digit_counts.values())
        return max_count > 6
    
    @staticmethod
    def _mock_aadhaar_verification(aadhaar_id):
        """Mock Aadhaar verification for demonstration"""
        # Generate mock data based on Aadhaar ID
        import hashlib
        
        # Create deterministic mock data based on Aadhaar
        hash_obj = hashlib.md5(aadhaar_id.encode())
        hash_hex = hash_obj.hexdigest()
        
        # Mock names based on hash
        names = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Singh', 'Raj Gupta', 
                'Anita Verma', 'Vikash Yadav', 'Pooja Agarwal', 'Suresh Reddy', 'Kavita Joshi']
        
        name_index = int(hash_hex[:2], 16) % len(names)
        age = 18 + (int(hash_hex[2:4], 16) % 60)  # Age between 18-77
        
        # Mock addresses
        addresses = [
            'Plot 123, Sector 45, Gurgaon, Haryana',
            'Flat 456, Green Park, New Delhi',
            'House 789, MG Road, Pune, Maharashtra',
            'Block A-12, Salt Lake, Kolkata, West Bengal',
            'Villa 321, Anna Nagar, Chennai, Tamil Nadu'
        ]
        
        address_index = int(hash_hex[4:6], 16) % len(addresses)
        
        # Higher confidence for properly formatted Aadhaar
        confidence = 0.85 if int(hash_hex[6:8], 16) % 10 > 2 else 0.75
        
        return {
            'verified': True,
            'name': names[name_index],
            'age': age,
            'address': addresses[address_index],
            'confidence_score': confidence
        }
