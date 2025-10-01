# UEI Setup Guide

## Prerequisites

Before setting up the UEI system, ensure you have the following installed:

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB** (v4.0 or higher)
   - Download from: https://www.mongodb.com/try/download/community
   - Verify installation: `mongod --version`

3. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/VaibhavUPratap/SIH.git
cd SIH
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Environment Variables
Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/uei
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
NODE_ENV=development
```

**Important:** Change the `JWT_SECRET` to a secure random string in production!

#### Start MongoDB
```bash
# On Linux/Mac
sudo systemctl start mongod

# On Windows (if installed as service)
net start MongoDB

# Or run manually
mongod --dbpath /path/to/your/data/directory
```

#### Seed Initial Admin User
```bash
npm run seed-admin
```

This creates an admin account:
- Email: `admin@uei.gov.in`
- Password: `admin123`

**⚠️ IMPORTANT:** Change this password immediately after first login!

#### Start the Backend Server
```bash
npm start
```

The backend server will start on http://localhost:5000

You should see:
```
UEI Server running on port 5000
MongoDB Connected: localhost
```

### 3. Frontend Setup

Open a new terminal window/tab:

```bash
cd frontend
npm install
```

**Note:** If you encounter any peer dependency warnings, you can safely ignore them or use:
```bash
npm install --legacy-peer-deps
```

#### Start the Frontend Development Server
```bash
npm start
```

The frontend will start on http://localhost:3000 and automatically open in your browser.

## Verification

### 1. Test Backend API
Open your browser or use curl to test:

```bash
curl http://localhost:5000/
```

You should see:
```json
{
  "message": "Welcome to UEI (Unified Education Interface) API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "student": "/api/student",
    "teacher": "/api/teacher",
    "institution": "/api/institution",
    "admin": "/api/admin"
  }
}
```

### 2. Test Admin Login
1. Go to http://localhost:3000
2. Click "Login"
3. Select "Administrator" role
4. Enter:
   - Email: `admin@uei.gov.in`
   - Password: `admin123`
5. You should be redirected to the Admin Dashboard

## Creating Test Users

### Create a Test Student
1. Go to http://localhost:3000/register
2. Select "Student"
3. Fill in the form:
   - Name: Test Student
   - Email: student@test.com
   - Password: password123
   - Aadhaar: 123456789012 (12 digits)
   - Date of Birth: 2005-01-01
   - Gender: Select one
   - Phone: 9876543210

### Create a Test Teacher
1. Go to http://localhost:3000/register
2. Select "Teacher"
3. Fill in the form:
   - Name: Test Teacher
   - Email: teacher@test.com
   - Password: password123
   - APAR Code: APAR123456
   - Aadhaar: 123456789013
   - Date of Birth: 1985-01-01
   - Gender: Select one
   - Phone: 9876543211

### Create a Test Institution
1. Go to http://localhost:3000/register
2. Select "Institution"
3. Fill in the form:
   - Name: Test College
   - Email: college@test.com
   - Password: password123
   - AISHE Code: C-12345
   - Type: College
   - Phone: 0123456789

## Troubleshooting

### MongoDB Connection Issues

**Problem:** Cannot connect to MongoDB

**Solution:**
1. Make sure MongoDB is running: `ps aux | grep mongod`
2. Check MongoDB URI in `.env` file
3. Try connecting manually: `mongo`
4. Check MongoDB logs for errors

### Port Already in Use

**Problem:** Port 5000 or 3000 is already in use

**Solution:**
1. Change the port in backend `.env` file:
   ```env
   PORT=5001
   ```
2. For frontend, set port via environment:
   ```bash
   PORT=3001 npm start
   ```

### Module Not Found Errors

**Problem:** Cannot find module errors

**Solution:**
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### CORS Errors

**Problem:** CORS policy errors in browser console

**Solution:**
The backend has CORS enabled by default. If you still face issues:
1. Check that backend is running on port 5000
2. Check that frontend is running on port 3000
3. Clear browser cache and cookies

### JWT Token Issues

**Problem:** "Not authorized" errors

**Solution:**
1. Clear browser localStorage:
   - Open DevTools (F12)
   - Go to Application > Local Storage
   - Clear all items
2. Login again

## Production Deployment

### Environment Variables

For production, update your `.env` file:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db-host:27017/uei
JWT_SECRET=your-super-secure-random-string-here
```

### Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret (min 32 characters)
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS in production
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Set up monitoring and logging
- [ ] Regular security updates

### Build Frontend for Production

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `build/` directory.

### PM2 for Backend (Process Management)

```bash
npm install -g pm2
cd backend
pm2 start server.js --name uei-backend
pm2 save
pm2 startup
```

## Additional Resources

- [API Documentation](../docs/API_DOCUMENTATION.md)
- [Database Schema](../docs/DATABASE_SCHEMA.md)
- [Main README](../README.md)

## Support

If you encounter any issues not covered here, please:
1. Check the GitHub issues page
2. Contact support at support@uei.edu.in
3. Refer to the documentation in the `docs/` folder

## Next Steps

After successful setup:
1. Create sample data using the admin dashboard
2. Create test schemes
3. Test the complete workflow from student registration to scheme application
4. Explore all dashboards
5. Generate sample reports

---

**Happy coding! 🚀**
