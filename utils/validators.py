"""
Validation utilities for data validation.
"""
import re
from datetime import datetime


def validate_email(email):
    """
    Validate email format.
    
    Args:
        email (str): Email address
        
    Returns:
        bool: True if valid
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_phone(phone):
    """
    Validate Indian phone number format.
    
    Args:
        phone (str): Phone number
        
    Returns:
        bool: True if valid
    """
    pattern = r'^[6-9]\d{9}$'
    return re.match(pattern, phone) is not None


def validate_aadhaar(aadhaar):
    """
    Validate Aadhaar number format.
    
    Args:
        aadhaar (str): 12-digit Aadhaar number
        
    Returns:
        bool: True if valid
    """
    if not aadhaar or len(aadhaar) != 12:
        return False
    
    return aadhaar.isdigit()


def validate_date(date_string, format='%Y-%m-%d'):
    """
    Validate date string.
    
    Args:
        date_string (str): Date string
        format (str): Expected date format
        
    Returns:
        bool: True if valid
    """
    try:
        datetime.strptime(date_string, format)
        return True
    except ValueError:
        return False


def validate_pincode(pincode):
    """
    Validate Indian pincode.
    
    Args:
        pincode (str): 6-digit pincode
        
    Returns:
        bool: True if valid
    """
    pattern = r'^\d{6}$'
    return re.match(pattern, pincode) is not None


def validate_ifsc(ifsc_code):
    """
    Validate IFSC code format.
    
    Args:
        ifsc_code (str): IFSC code
        
    Returns:
        bool: True if valid
    """
    pattern = r'^[A-Z]{4}0[A-Z0-9]{6}$'
    return re.match(pattern, ifsc_code) is not None


def sanitize_string(text, max_length=None):
    """
    Sanitize input string.
    
    Args:
        text (str): Input text
        max_length (int): Maximum length
        
    Returns:
        str: Sanitized text
    """
    if not text:
        return ''
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    # Trim to max length if specified
    if max_length and len(text) > max_length:
        text = text[:max_length]
    
    return text
