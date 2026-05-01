# Ethara Tasks - Team Task Manager

A modern, full-stack MERN (MongoDB, Express, React, Node.js) application for managing team projects and tasks with role-based access control.

## 🔗 Live Demo

- **Frontend**: [https://ethara-frontend.netlify.app/](https://ethara-frontend.netlify.app/)
- **Backend API**: [https://etharaaiassignment-production-a16e.up.railway.app](https://etharaaiassignment-production-a16e.up.railway.app)


## 🚀 Features

- **Authentication & Authorization**: Secure signup/login using JWT and bcrypt password hashing.
- **Role-Based Access Control**:
  - **Admin**: Create projects, manage team members, assign tasks, and delete projects.
  - **Member**: View assigned projects and update task status.
- **Project Management**: Create, view, and track multiple team projects.
- **Task Kanban Board**: Dynamic task tracking (Todo, In Progress, Completed) with due dates and assignees.
- **Modern Dashboard**: Visual overview of task statistics (Completed, Pending, Overdue).
- **Rich Aesthetics**: Premium dark-mode UI with glassmorphism, gradients, and micro-animations using Tailwind CSS.

## 🛠 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide React, Axios, React Router.
- **Backend**: Node.js, Express.js, Mongoose.
- **Database**: MongoDB Atlas.
- **Validation**: Joi.

## 📦 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/priyanshuk804/Ethara.ai_assignment.git
cd Ethara.ai_assignment
```

### 2. Backend Setup
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```
Install dependencies:
```bash
cd backend
npm install
```

### 3. Frontend Setup
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Install dependencies:
```bash
cd ../frontend
npm install
```

## 🏃‍♂️ Running Locally

From the root directory, run both servers concurrently:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## 🌐 Deployment

### Backend (Railway)
- Root Directory: `backend`
- Start Command: `node server.js`
- Environment Variables: `MONGO_URI`, `JWT_SECRET`, `PORT`.

### Frontend (Railway/Vercel)
- Root Directory: `frontend`
- Build Command: `npm run build`
- Start Command: `npm start`
- Environment Variable: `VITE_API_URL` (pointing to your live backend URL).
