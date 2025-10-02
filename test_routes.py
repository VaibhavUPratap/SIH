#!/usr/bin/env python3
"""
Route testing script for the UEI System
"""

import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_routes():
    """Test basic application routes"""
    print("Testing UEI System Routes...")
    
    # Test if server is running
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        print(f"✓ Server is running (Status: {response.status_code})")
    except requests.exceptions.ConnectionError:
        print("✗ Server is not running")
        return False
    except requests.exceptions.Timeout:
        print("✗ Server timeout")
        return False
    
    # Test registration endpoint
    try:
        test_user = {
            "name": "Test User",
            "email": "test@example.com",
            "password": "testpass123",
            "role": "student",
            "aadhaar_id": "123456789012",
            "enrollment_no": "ST2025001"
        }
        
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json=test_user,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 201:
            print("✓ Registration endpoint working")
        elif response.status_code == 400:
            result = response.json()
            if "already exists" in str(result):
                print("✓ Registration endpoint working (user already exists)")
            else:
                print(f"⚠ Registration endpoint returned 400: {result}")
        else:
            print(f"⚠ Registration endpoint returned {response.status_code}: {response.text}")
    
    except Exception as e:
        print(f"✗ Registration test failed: {e}")
    
    # Test login endpoint
    try:
        login_data = {
            "email": "test@example.com",
            "password": "testpass123"
        }
        
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            print("✓ Login endpoint working")
        else:
            print(f"⚠ Login endpoint returned {response.status_code}: {response.text}")
    
    except Exception as e:
        print(f"✗ Login test failed: {e}")
    
    return True

if __name__ == "__main__":
    test_routes()