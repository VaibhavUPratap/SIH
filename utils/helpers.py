"""
Helper utility functions.
"""
from datetime import datetime
import json
import hashlib


def generate_unique_id(prefix=''):
    """
    Generate unique ID with optional prefix.
    
    Args:
        prefix (str): Optional prefix
        
    Returns:
        str: Unique ID
    """
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S%f')
    return f"{prefix}{timestamp}"


def calculate_cgpa(performances):
    """
    Calculate CGPA from list of performances.
    
    Args:
        performances (list): List of performance records
        
    Returns:
        float: Calculated CGPA
    """
    if not performances:
        return 0.0
    
    total_credits = sum(p.get('credits_earned', 0) for p in performances)
    weighted_sum = sum(
        p.get('sgpa', 0) * p.get('credits_earned', 0) 
        for p in performances
    )
    
    if total_credits == 0:
        return 0.0
    
    return round(weighted_sum / total_credits, 2)


def calculate_percentage_from_cgpa(cgpa, scale=10):
    """
    Convert CGPA to percentage.
    
    Args:
        cgpa (float): CGPA value
        scale (int): CGPA scale (default 10)
        
    Returns:
        float: Percentage
    """
    if scale == 10:
        return round((cgpa - 0.75) * 10, 2)
    return round((cgpa / scale) * 100, 2)


def format_date(date_obj, format='%Y-%m-%d'):
    """
    Format date object to string.
    
    Args:
        date_obj: Date or datetime object
        format (str): Output format
        
    Returns:
        str: Formatted date string
    """
    if not date_obj:
        return None
    
    return date_obj.strftime(format)


def parse_date(date_string, format='%Y-%m-%d'):
    """
    Parse date string to date object.
    
    Args:
        date_string (str): Date string
        format (str): Input format
        
    Returns:
        datetime: Date object
    """
    try:
        return datetime.strptime(date_string, format)
    except ValueError:
        return None


def safe_json_loads(json_string, default=None):
    """
    Safely load JSON string.
    
    Args:
        json_string (str): JSON string
        default: Default value if parsing fails
        
    Returns:
        dict/list: Parsed JSON or default value
    """
    try:
        return json.loads(json_string)
    except (json.JSONDecodeError, TypeError):
        return default if default is not None else {}


def safe_json_dumps(data):
    """
    Safely dump data to JSON string.
    
    Args:
        data: Data to serialize
        
    Returns:
        str: JSON string
    """
    try:
        return json.dumps(data)
    except (TypeError, ValueError):
        return '{}'


def hash_sensitive_data(data):
    """
    Hash sensitive data for storage.
    
    Args:
        data (str): Data to hash
        
    Returns:
        str: Hashed data
    """
    return hashlib.sha256(data.encode()).hexdigest()


def mask_aadhaar(aadhaar):
    """
    Mask Aadhaar number for display.
    
    Args:
        aadhaar (str): 12-digit Aadhaar number
        
    Returns:
        str: Masked Aadhaar (XXXX-XXXX-1234)
    """
    if not aadhaar or len(aadhaar) != 12:
        return 'XXXX-XXXX-XXXX'
    
    return f"XXXX-XXXX-{aadhaar[-4:]}"


def get_academic_year(date=None):
    """
    Get academic year for given date.
    
    Args:
        date: Date object (default: current date)
        
    Returns:
        str: Academic year (e.g., "2023-24")
    """
    if date is None:
        date = datetime.now()
    
    year = date.year
    month = date.month
    
    if month >= 7:  # July onwards is next academic year
        return f"{year}-{str(year + 1)[-2:]}"
    else:
        return f"{year - 1}-{str(year)[-2:]}"
