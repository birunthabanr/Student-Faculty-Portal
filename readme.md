# Student-Faculty Portal

A comprehensive campus management system built with React (frontend) and multiple backend services. This portal provides functionality for students and faculty to manage courses, resources, attendance, schedules, and more.

## 🔗 Related Repositories

- **Frontend (This Repository)**: Student-Faculty Portal Interface
- **Backend Services**: [Smart Campus Management Backend](https://github.com/Group-1-SE/Smart-Campus-Management-backend.git)
- **Security & Surveillance System**: [Smart Campus Security and Surveillance](https://github.com/dasunrandeepa/smart-campus-security-and-surveillance-system.git)

## 🏗️ Project Structure

```
Student-Faculty-Portal/
├── client/                        # React Frontend Application
   ├── src/
   │   ├── components/             # React Components
   │   │   ├── AdminDashboard.tsx
   │   │   ├── ChatBot.tsx
   │   │   ├── CourseManagement.tsx
   │   │   ├── CourseRecommendations.tsx
   │   │   ├── Dashboard.tsx
   │   │   ├── DashboardLayout.tsx
   │   │   ├── FacultyCourseManagement.tsx
   │   │   ├── ResourceManagement.tsx
   │   └── ... (other components)
   │   ├── hooks/                  # Custom React Hooks
   │   ├── lib/                    # Utility Libraries & Config
   │   ├── pages/                  # Page Components
   │   └── assets/                 # Static Assets
   ├── public/                     # Public Assets
   ├── Dockerfile                  # Docker configuration for frontend
   ├── package.json                # Dependencies and scripts
   └── ... (config files)

```

## ✨ Features

- **Dashboard**: Comprehensive overview for students and faculty
- **Course Management**: Create, manage, and enroll in courses
- **Resource Management**: Book and manage campus resources (labs, rooms, vehicles)
- **Course Recommendations**: AI-powered course suggestions
- **Authentication**: Secure login with OpenID Connect
- **Chat Bot**: Intelligent assistant for campus queries
- **Attendance Tracking**: Monitor and manage attendance
- **Schedule Management**: View and manage class schedules
- **Notifications**: Real-time campus notifications
- **Admin Panel**: Administrative controls and analytics
- **Security Integration**: Integration with campus security and surveillance system

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker (optional, for containerized deployment)
- Git


### Installation

1. **Clone the repositories**
   ```bash
   # Clone frontend repository
   git clone <this-repository-url>
   cd Student-Faculty-Portal
   
   # Clone backend repository
   git clone https://github.com/Group-1-SE/Smart-Campus-Management-backend.git
   
   # Clone security system repository (optional)
   git clone https://github.com/dasunrandeepa/smart-campus-security-and-surveillance-system.git
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../Smart-Campus-Management-backend
   # Follow backend repository installation instructions
   ```

### Development

1. **Start the backend services**
   ```bash
   cd Smart-Campus-Management-backend
   # Follow backend repository startup instructions
   ```

2. **Start the frontend development server**
   ```bash
   cd Student-Faculty-Portal/client
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

3. **Start security system** (optional)
   ```bash
   cd smart-campus-security-and-surveillance-system
   # Follow security system repository instructions
   ```

### Production Build

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Preview the production build**
   ```bash
   npm run preview
   ```

## 🐳 Docker Deployment

### Frontend Container

```bash
cd client
docker build -t student-faculty-portal-client .
docker run -p 80:80 student-faculty-portal-client
```

### Full Stack Deployment

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  frontend:
    build: ./client
    ports:
      - "80:80"
    environment:
      - REACT_APP_API_BASE_URL=http://backend:8000
      - REACT_APP_SECURITY_PORTAL_URL=http://security-system:8002
    depends_on:
      - backend

  backend:
    build: ./Smart-Campus-Management-backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/campus_db
    depends_on:
      - db

  security-system:
    build: ./smart-campus-security-and-surveillance-system
    ports:
      - "8002:8002"
    depends_on:
      - db

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=campus_db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🔧 Configuration

### API Endpoints

The system integrates with multiple services:

- **Backend API**: `${REACT_APP_API_BASE_URL}` - Main backend services
- **Authentication Service**: `${REACT_APP_AUTH_URL}` - User authentication
- **Security Portal**: `${REACT_APP_SECURITY_PORTAL_URL}` - Security and surveillance integration
- **Dashboard Service**: For dashboard data and analytics
- **Course Management**: For course-related operations
- **Resource Management**: For campus resource booking
- **Attendance Service**: For attendance tracking
- **Notification Service**: For real-time notifications

### Authentication

The system uses OpenID Connect for authentication. Configure your identity provider:

1. Set up your OpenID Connect provider
2. Configure client credentials in your environment variables
3. Update the redirect URIs in your identity provider settings

## 📁 Project Components

### Frontend Components

- **AdminDashboard**: Administrative interface and controls
- **ChatBot**: AI-powered campus assistant
- **CourseManagement**: Course creation and management
- **CourseRecommendations**: ML-based course suggestions
- **Dashboard**: Main user dashboard
- **DashboardLayout**: Layout wrapper for dashboard pages
- **FacultyCourseManagement**: Faculty-specific course tools
- **ResourceManagement**: Campus resource booking system

### Backend Services

- **Smart Campus Management Backend**: Core backend services
- **Security & Surveillance System**: Campus security integration
- **API Gateway**: Central API routing and management
- **Microservices**: Individual services for different functionalities

## 🔒 Security

- OpenID Connect authentication
- Role-based access control (RBAC)
- Secure API endpoints
- Environment variable configuration for sensitive data
- HTTPS enforcement in production
- Integration with campus security and surveillance system

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run preview
```

### Docker
```bash
docker build -t campus-portal .
docker run -p 80:80 campus-portal
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Environment Variables Reference

```env
# Required - Service URLs (Replace with your actual URLs)
REACT_APP_API_BASE_URL=http://localhost:8000                    # Backend API URL
REACT_APP_AUTH_URL=http://localhost:8001                        # Authentication service URL
REACT_APP_SECURITY_PORTAL_URL=http://localhost:8002             # Security portal URL

# Optional - Service-specific URLs
REACT_APP_DASHBOARD_URL=http://localhost:8003
REACT_APP_ENROLLMENT_URL=http://localhost:8004
REACT_APP_ATTENDANCE_URL=http://localhost:8005
REACT_APP_NOTIFICATIONS_URL=http://localhost:8006
REACT_APP_SCHEDULE_URL=http://localhost:8007
REACT_APP_RESOURCES_URL=http://localhost:8008
REACT_APP_STUDENT_URL=http://localhost:8009
REACT_APP_VEHICLE_DETECTOR_URL=http://localhost:8010
REACT_APP_LOGGER_URL=http://localhost:8011

# Authentication
REACT_APP_OPENID_CLIENT_ID=your_openid_client_id
REACT_APP_OPENID_REDIRECT_URI=http://localhost:3000/callback

# Other
REACT_APP_ENVIRONMENT=development
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🙏 Acknowledgments

- React and Vite communities
- OpenID Connect specification
- All contributors and testers

---