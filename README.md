# 🏢 Society Management Application

A full-stack **Society / Community Management Application** developed as part of the **Horizon Hackathon**.

The application provides a centralized platform for residents and administrators to manage common residential-community activities such as complaints, facility bookings, visitors, emergency contacts, announcements, and events.

---

## 📌 Project Overview

Managing a residential community involves multiple activities such as raising complaints, booking shared facilities, managing visitors, accessing emergency contacts, and communicating important announcements.

This application brings these activities together into a single web platform.

The system provides separate functionalities for **residents and administrators**, allowing residents to access community services while administrators can manage and monitor important community operations.

This project also gave me an opportunity to explore a **different technology stack** from my earlier project, **SasVoix**, and experiment with **AI-assisted development and vibe coding**.

---

## 🎯 Objectives

The main objectives of this application are:

- Provide a centralized platform for society management.
- Improve communication between residents and administrators.
- Simplify complaint and service-request management.
- Allow residents to book available community facilities.
- Manage visitor information efficiently.
- Provide quick access to emergency contacts.
- Allow administrators to manage community activities.
- Explore a different technology stack.
- Gain practical experience with AI-assisted development.

---

## ✨ Features

### 👤 Resident Features

- User Registration
- User Login
- JWT-based Authentication
- Resident Dashboard
- View Announcements
- View Community Events
- Facility Viewing and Booking
- Complaint / Service Request Management
- Visitor Management
- Emergency Contacts
- Profile Management
- Booking and complaint status tracking

### 🛡️ Admin Features

- Admin Dashboard
- Manage Residents
- Manage Complaints
- Manage Facilities
- Manage Facility Bookings
- Manage Visitors
- Manage Announcements
- Manage Events
- Manage Emergency Contacts
- View application statistics

---

## 🛠️ Technology Stack

### Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- Bootstrap

### Backend

- Node.js
- Express.js
- REST APIs

### Database

- MongoDB
- Mongoose

### Authentication

- JSON Web Token (JWT)
- Protected Routes
- Role-based Authorization

### Development Tools

- Git
- GitHub
- VS Code
- Postman
- AI-assisted development tools

---

## 🏗️ Architecture

The application follows a **client-server architecture** with separation of responsibilities between the frontend, backend, business logic, and database layers.

```text
                   ┌─────────────────────┐
                   │        User         │
                   │  Resident / Admin   │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │      React.js       │
                   │   Frontend Layer    │
                   └──────────┬──────────┘
                              │
                         REST API
                              │
                              ▼
                   ┌─────────────────────┐
                   │   Express + Node.js │
                   │    Backend Layer    │
                   └──────────┬──────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
             ┌──────────────┐    ┌──────────────┐
             │ Controllers  │    │   Services   │
             └──────┬───────┘    └──────┬───────┘
                    │                   │
                    └─────────┬─────────┘
                              ▼
                   ┌─────────────────────┐
                   │  Mongoose Models    │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │      MongoDB        │
                   │      Database       │
                   └─────────────────────┘
## ⚠️ Known Limitations

- The application is currently intended as a hackathon/assessment project.
- Some features may require further optimization for large-scale production use.
- Automated test coverage can be expanded.
- Real-time notifications can be enhanced in future versions.

## 🚀 Future Improvements

- Real-time push notifications
- Online maintenance payment integration
- Advanced admin analytics
- Facility availability calendar
- Community polls and discussions
- Improved search and filtering
- Cloud deployment and monitoring
- Expanded automated testing

## 👩‍💻 Developer

**Divya Dharshini S.**

B.Tech Information Technology  
SASTRA Deemed University

**Project:** Society Management Application  
**Event:** Horizon Hackathon  
**Platform:** Web
