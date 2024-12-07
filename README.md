# Backend
cd backend
npm install
npx prisma migrate dev

# Frontend
cd ../frontend
npm install

# In one terminal, start the backend server
cd backend
npm run dev

# In another terminal, start the frontend dev server
cd frontend
npm run dev

# Technologies Used
Frontend:
Framework: Vuejs
Build: Vite
Styling: TailwindCSS

Backend:
Framework: Hono (API routing)
Database: MongoDB (via Prisma ORM)

# SERVERREREEFWE
Access the frontend at http://localhost:5173 (default Vite dev server port).
Ensure the backend server is running at http://localhost:3000 (or the port you've configured).
Use the web interface to log in and manage your files.
