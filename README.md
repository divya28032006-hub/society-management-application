# 🏢 Society Management Application

A full-stack **Society / Community Management Application** developed as part of the **Horizon Hackathon**.

The application is designed to simplify communication and day-to-day management within a residential community by providing residents and administrators with a centralized platform for managing complaints, facilities, visitors, announcements, emergency contacts, and other community activities.

---

## 📌 Overview

Managing a residential community often involves multiple activities such as raising complaints, booking facilities, managing visitors, sharing announcements, and accessing emergency information.

This project brings these activities together into a single web application with separate functionalities for **residents and administrators**.

The project also gave me an opportunity to explore a **different technology stack** from my earlier project, **SasVoix**, and experiment with **AI-assisted development / vibe coding** during the development process.

---

## ✨ Key Features

### 👤 Resident Features

- 🔐 User Registration & Login
- 📊 Resident Dashboard
- 📢 View Community Announcements
- 🏟️ Facility Viewing & Booking
- 📝 Raise and Track Complaints / Service Requests
- 👥 Visitor Management
- 🚨 Emergency Contacts
- 📅 Community Events
- 👤 Profile Management
- 🔔 Application notifications and status updates

### 🛡️ Admin Features

- 📊 Admin Dashboard
- 👥 Manage Residents
- 📝 Manage Complaints
- 🏟️ Manage Facilities and Bookings
- 👥 Manage Visitors
- 📢 Manage Announcements
- 📅 Manage Events
- 🚨 Manage Emergency Contacts
- 📈 View application statistics

> **Note:** Features listed above should reflect the functionality currently implemented in the application.

---

## 🛠️ Technology Stack

### Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- Bootstrap / UI framework

### Backend

- Node.js
- Express.js
- REST APIs

### Database

- MongoDB
- Mongoose

### Authentication & Security

- JWT Authentication
- Protected API Routes
- Role-based access control
- Input validation

### Development Tools

- Git
- GitHub
- VS Code
- Postman
- AI-assisted development tools

---

## 🏗️ Application Architecture

The application follows a **client-server architecture**.

```text
                    ┌──────────────────────┐
                    │       User           │
                    │ Resident / Admin     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      React UI        │
                    │    Frontend Layer    │
                    └──────────┬───────────┘
                               │
                         REST API Calls
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Express / Node.js │
                    │     Backend Layer    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       MongoDB        │
                    │     Database Layer   │
                    └──────────────────────┘
