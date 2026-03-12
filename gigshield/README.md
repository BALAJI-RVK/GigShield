# GigShield

A B2B2C parametric wage stabilization platform built for India's food delivery workers.

## Architecture

- **Backend**: Node.js + Express + PostgreSQL + Prisma
- **AI/ML Layer**: Python (Risk Scorer, Anomaly Detector)
- **Dashboard**: React + Vite + TailwindCSS

## Setup

1. Copy `.env.example` to `.env` and fill the variables.
2. Install dependencies for the backend and dashboard:
   ```sh
   cd backend
   npm install

   cd ../dashboard
   npm install
   ```
3. Run Prisma migrations:
   ```sh
   npx prisma migrate dev --name init
   ```
4. Start both servers using `npm run dev`.
