# File Management System
A file management system leveraging **Vue.js** for the frontend and **Hono** for the backend. It uses **Prisma** as the ORM and connects to a **MongoDB** database.

---
## Features
- Upload Files
- View/Download Files
- Update File Name & Path
- Delete Files

---
## Getting Started

Follow the steps below to set up and run the project.

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v16 or later)
- **npm** (Node Package Manager)
- **MongoDB** (cloud or local instance)

---

# Installation and Setup
Clone the repository and install dependencies

Backend:

Install dependencies:
```bash
  git clone https://github.com/adrianaafandi/file-management-system.git
  cd file-management-system
  cd backend
  npm install
```

### Environment Variables

1. Create a `.env` file in the `backend` directory.
2. Add the following variable to your `.env` file:

```env
DATABASE_URL="your-mongodb-connection-string"
```
Replace your-mongodb-connection-string with your MongoDB URI.


Generate Prisma client:
```bash
  npx prisma generate
```

Push the Prisma schema to the database:
```bash
  npx prisma db push
```

Start the backend server:
```bash
npm run dev
```
The backend server runs at http://localhost:3000 (default port).

Frontend: 
```bash
cd frontend
npm install
npm run dev
```
The frontend server runs at http://localhost:5173 (default port).


### Running the Project
To run the project, open two terminals:

Backend Server:
```bash
cd backend
npm run dev
```
Frontend Server: 
```bash
cd frontend
npm run dev
```

## Server Information
Frontend: Accessible at http://localhost:5173 (default Vite dev server port).

Backend: Ensure the backend server is running at http://localhost:3000 (or your configured port).



