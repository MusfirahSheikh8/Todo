# 🚀 To-Do List – Full Stack Task Management System

To-Do is a **full-stack task management application** that allows users to create, manage, prioritize, and track tasks efficiently.
The system includes a **React frontend**, **Express backend**, and **PostgreSQL database**, with support for filtering, pagination, and task statistics.

# Demo

https://www.loom.com/share/c3bf5f78ed9b4947ba26810b2118f4e0


# ✨ Features

* Create, update, and delete tasks
* Assign **priority levels** (Low, Medium, High)
* Manage **task statuses** (To-Do, Completed)
* Add **descriptions and deadlines**
* **Search and filter tasks**
* **Dashboard statistics**
* **Server-side pagination**
* **Responsive UI**
* REST API integration

# 🧰 Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* shadcn UI
* Custom React Hooks

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL

### Other Tools

* REST API
* Sonner Toast Notifications

# 📂 Project Structure

```
backend/
│
├── db/                 # Database configuration
├── middleware/         # Custom middleware
├── routes/             # Express API routes
├── server.js           # Backend entry point
└── package.json

frontend/
│
├── src/
│   │
│   ├── components/
│   │   ├── dashboard/   # Dashboard stats components
│   │   ├── filters/     # Task filtering UI
│   │   ├── pages/       # Application pages
│   │   ├── tasks/       # Task UI components
│   │   └── ui/          # Shared UI components
│   │
│   ├── hooks/           # Custom React hooks (useTasks)
│   ├── services/        # API service layer
│   ├── lib/             # Utility functions
│   ├── utils/           # Helper utilities
│   ├── types/           # Shared types
│   │
│   ├── App.jsx          # Main React component
│   └── main.jsx         # Frontend entry point
│
├── tailwind.config.js
└── package.json
```

---

# ⚙️ Installation

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/MusfirahSheikh8/todo.git
cd todo
```

---

# 🖥 Backend Setup

```
cd backend
npm install
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

# 🌐 Frontend Setup

```
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:3000
```


# 📊 Application Overview

The application provides a **dashboard interface** where users can:

* View **task statistics**
* Create new tasks
* Update task status and priority
* Filter tasks by different conditions
* Navigate tasks using **pagination**

All operations interact with the backend through a **REST API layer**.


# 🎯 What This Project Demonstrates

* Full-stack application development
* Clean React component architecture
* Custom hook pattern for state management
* REST API design with Express
* PostgreSQL database integration
* Pagination and filtering logic
* Responsive UI design


# 👨‍💻 Author

**Musfirah Sheikh**

If you like this project, consider giving it a ⭐ on GitHub.

