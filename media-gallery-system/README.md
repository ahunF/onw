# Media Gallery Management System

A full-stack MERN application for managing media files with authentication, gallery organization, and contact form integration.

## 🚀 Features

### 🔐 Authentication
- **Google OAuth 2.0** integration
- **Email/Password** registration with Gmail OTP verification
- **Forgot Password** functionality via Gmail OTP
- **Protected Routes** with JWT middleware
- **Account Security** with login attempt tracking and lockout

### 🖼️ Media Gallery
- **Drag & Drop Upload** for images (JPG/PNG, max 5MB)
- **File Validation** with preview functionality
- **Personal/Shared Galleries** organization
- **Search & Filter** by tags, titles, and metadata
- **Full-screen Image View** with navigation slider
- **CRUD Operations** for media management
- **ZIP Download** for selected images
- **Cloudinary Integration** for cloud storage

### 📬 Contact Form System
- **Public Contact Form** submission
- **User Message Management** (edit/delete own messages)
- **Admin Message Center** (view/manage all messages)
- **Message Status Tracking** (pending/read/replied)
- **Bulk Operations** for administrators

### 👤 User Management (Admin)
- **User Profile Management** (view/edit user details)
- **Role Management** (admin/user roles)
- **User Activation/Deactivation** (soft delete)
- **User Activity Tracking** and statistics
- **Bulk User Operations**

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose |
| **Authentication** | JWT, Google OAuth 2.0, Nodemailer (OTP) |
| **File Storage** | Cloudinary (cloud) or Local filesystem |
| **Libraries** | Multer, Archiver (ZIP), React Dropzone |
| **Security** | Helmet, Rate Limiting, CORS, Input Validation |

## 📋 Prerequisites

- **Node.js** (v16.0.0 or higher)
- **MongoDB** (v4.4 or higher)
- **Git**
- **Cloudinary Account** (for media storage)
- **Gmail Account** (for OTP emails)

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd media-gallery-system
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file (optional)
cp .env.example .env
```

### 4. Environment Configuration

#### Backend (.env)
```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/media-gallery

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Gmail (for OTP)
GMAIL_EMAIL=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend (.env - Optional)
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Start the Application

#### Start Backend Server
```bash
cd backend
npm run dev
```

#### Start Frontend Development Server
```bash
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/health

## 📚 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/verify-email` | Verify email with OTP |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with OTP |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update user profile |

### Media Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/media/upload` | Upload single media file |
| POST | `/api/media/upload-multiple` | Upload multiple files |
| GET | `/api/media/my-media` | Get user's media |
| GET | `/api/media/:id` | Get media by ID |
| PUT | `/api/media/:id` | Update media metadata |
| DELETE | `/api/media/:id` | Delete media |
| POST | `/api/media/download/zip` | Download as ZIP |

### Contact Form Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Submit contact message |
| GET | `/api/contact/my-messages` | Get user's messages |
| PUT | `/api/contact/:id` | Update message |
| DELETE | `/api/contact/:id` | Delete message |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| PUT | `/api/users/:id` | Update user |
| GET | `/api/contact/admin/messages` | Get all messages |
| PUT | `/api/contact/admin/:id/status` | Update message status |

## 🏗️ Project Structure

```
media-gallery-system/
├── backend/
│   ├── controllers/           # Request handlers
│   │   ├── authController.js
│   │   ├── mediaController.js
│   │   ├── contactController.js
│   │   └── userController.js
│   ├── models/               # MongoDB schemas
│   │   ├── User.js
│   │   ├── Media.js
│   │   └── Contact.js
│   ├── routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── mediaRoutes.js
│   │   ├── contactRoutes.js
│   │   └── userRoutes.js
│   ├── middlewares/          # Custom middleware
│   │   └── auth.js
│   ├── utils/                # Utility functions
│   │   ├── otp.js
│   │   └── upload.js
│   ├── .env.example          # Environment template
│   ├── package.json
│   └── server.js             # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom hooks
│   │   ├── context/         # React contexts
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   ├── package.json
│   └── vite.config.js       # Vite configuration
└── README.md
```

## 🔧 Development

### Backend Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server
npm test           # Run tests
```

### Frontend Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🎨 Frontend Pages

1. **Login Page** - User authentication
2. **Register Page** - User registration with OTP
3. **Dashboard** - Media stats and recent uploads
4. **Media Gallery** - Browse and manage media
5. **Image Upload** - Drag & drop file uploads
6. **Image Detail** - Full-screen view with metadata
7. **ZIP Download** - Bulk download interface
8. **User Profile** - Profile management
9. **Contact Form** - Message submission
10. **Admin Users** - User management (admin only)
11. **Admin Messages** - Contact message management
12. **404/Unauthorized** - Error pages

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Rate Limiting** on sensitive endpoints
- **Input Validation** and sanitization
- **File Type Validation** for uploads
- **CORS Protection** with whitelist
- **Helmet.js** for security headers
- **Account Lockout** after failed login attempts
- **OTP Verification** for email confirmation

## 📧 Email Configuration

### Gmail Setup for OTP
1. Enable 2FA on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the app password in `GMAIL_APP_PASSWORD`

## ☁️ Cloudinary Setup

1. Create account at [Cloudinary](https://cloudinary.com)
2. Get your credentials from Dashboard
3. Add to environment variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## 🚀 Deployment

### Backend (Node.js)
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repository
- **DigitalOcean**: Use App Platform

### Frontend (React)
- **Vercel**: `vercel --prod`
- **Netlify**: Connect GitHub repository
- **AWS S3**: `npm run build` then upload dist/

### Database
- **MongoDB Atlas**: Free cloud database
- **Local MongoDB**: For development

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🐛 Troubleshooting

### Common Issues

1. **"Network Error"**
   - Check if backend server is running
   - Verify API URL in frontend config
   - Check CORS settings

2. **"Unauthorized"**
   - Verify JWT token in localStorage
   - Check token expiration
   - Ensure proper authentication flow

3. **File Upload Fails**
   - Check file size (max 5MB)
   - Verify file type (JPG/PNG only)
   - Check Cloudinary configuration

4. **Email OTP Not Received**
   - Check Gmail app password
   - Verify email configuration
   - Check spam folder

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Gamage** - [GitHub Profile](https://github.com/gamage)

## 🙏 Acknowledgments

- React team for the amazing framework
- Cloudinary for media storage solution
- MongoDB for the database platform
- All open-source contributors

---

For support, email support@example.com or create an issue on GitHub.