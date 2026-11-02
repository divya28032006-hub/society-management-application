# 🏢 Society Management Application

A full-stack **Society Management Mobile Application** designed to simplify residential community management by bringing residents, administrators, and security personnel onto a single platform.

The application helps manage society activities such as complaints, facility bookings, visitor management, announcements, events, emergency contacts, and more.

---

## 📌 Project Overview

Managing a residential society involves several activities, including handling resident complaints, booking shared facilities, managing visitors, sharing announcements, and maintaining emergency contact information.

The Society Management Application provides a centralized mobile platform to simplify these activities and improve communication between residents, administrators, and security personnel.

The application provides role-based access, allowing each user to access functionalities based on their assigned role.

This project was developed as part of the **Horizon Company Assignment** and provided an opportunity to explore mobile application development using React Native, Expo, and TypeScript, along with AI-assisted development.

---

## 🎯 Objectives

- Provide a centralized platform for society management.
- Improve communication between residents and administrators.
- Simplify complaint and service request management.
- Enable residents to book shared community facilities.
- Manage visitor information efficiently.
- Provide easy access to emergency contacts.
- Allow administrators to manage society activities.
- Support role-based access for different users.

---

## ✨ Features

### 👤 Resident Features

- User Registration and Login
- JWT-based Authentication
- Resident Dashboard
- View Society Announcements
- View Community Events
- View and Book Community Facilities
- Submit and Track Complaints
- Visitor Management
- Access Emergency Contacts
- Profile Management
- View Booking and Complaint Status

### 🛡️ Admin Features

- Admin Dashboard
- Manage Residents
- Manage Complaints
- Manage Community Facilities
- Manage Facility Bookings
- Manage Visitors
- Manage Announcements
- Manage Community Events
- Manage Emergency Contacts
- View Society Statistics

### 🔐 Security Features

- JWT-based Authentication
- Password Hashing using bcryptjs
- Role-based Authorization
- Protected API Routes
- Request Validation
- Error Handling

---

## 🛠️ Technology Stack

### Frontend – Mobile Application

- **React Native** – Building mobile application screens and user interfaces.
- **Expo** – Simplifying React Native development and application execution.
- **TypeScript** – Providing static typing and improved code reliability.
- **React Navigation** – Managing navigation between application screens.
- **Axios** – Making HTTP requests to backend REST APIs.

### Backend – Server

- **Node.js** – JavaScript runtime for server-side development.
- **Express.js** – Building REST APIs and handling HTTP requests.
- **TypeScript** – Providing type safety in backend development.

### Database

- **MongoDB** – NoSQL database for storing application data.
- **Mongoose** – ODM used to define schemas, models, and interact with MongoDB.

### Authentication and Security

- **JSON Web Token (JWT)** – Authentication and session tokens.
- **bcryptjs** – Secure password hashing.
- **Role-based Authorization** – Controlling access based on user roles.

### Development Tools

- Visual Studio Code
- Git and GitHub
- Postman
- AI-assisted development tools

---

## 🏗️ System Architecture

The application follows a client-server architecture with separate frontend, backend, and database layers.

```text
              USERS
     Resident / Admin / Security
                 |
                 v
    REACT NATIVE + EXPO + TYPESCRIPT
          Mobile Application
                 |
                 v
           REACT NAVIGATION
          Screen Navigation
                 |
                 v
             AXIOS
          REST API Requests
                 |
                 v
       NODE.JS + EXPRESS.JS
          Backend Server
                 |
                 v
       ROUTES AND MIDDLEWARE
                 |
                 v
             CONTROLLERS
                 |
                 v
              SERVICES
           Business Logic
                 |
                 v
          MONGOOSE MODELS
                 |
                 v
              MONGODB
             Database
```

### Application Workflow

1. Users interact with the mobile application.
2. React Native displays the required screens.
3. Axios sends HTTP requests to the backend REST APIs.
4. Express handles incoming API requests.
5. Middleware handles authentication, authorization, and validation.
6. Controllers receive and process requests.
7. Services implement application business logic.
8. Mongoose models interact with MongoDB.
9. The backend returns a response to the frontend.

---

## 🔑 Authentication Workflow

1. A user registers or logs in using their credentials.
2. The backend validates the submitted information.
3. bcryptjs is used to hash passwords and verify login credentials.
4. After successful authentication, a JWT token is generated.
5. The frontend uses the token when accessing protected API endpoints.
6. Authentication middleware verifies the token before allowing access to protected resources.

---

## 📂 Project Structure

```text
society-management-application/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── navigation/
│   │   ├── screens/
│   │   └── services/
│   │
│   ├── App.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── modules/
│   │   ├── scripts/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## ⚙️ Installation and Setup

### Prerequisites

- Node.js and npm
- MongoDB
- Expo development environment
- Visual Studio Code

### 1. Clone the Repository

```bash
git clone <repository-url>
cd society-management-application
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` and configure the required environment variables, including:

- MongoDB connection URI
- JWT secret
- Server port

Start the backend development server:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Start
