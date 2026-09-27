# 🏍️ Bike Bazar

Bike Bazar is a full-stack web app for buying, selling, and browsing bikes and scooters online. It's a marketplace where dealers can list their vehicles and buyers can search, compare, and save the ones they like.

This project was built as a way to learn React and full-stack development.

## Features

- Browse and search bike/scooter listings
- User signup and login (JWT-based authentication)
- Add listings to favourites
- Compare different listings side by side
- Sell your own vehicle by creating a listing
- Dealer ratings
- Report a listing (for spam or fraud)
- Free-tier dealer accounts (up to 5 active listings)

## Tech Stack

**Frontend**
- React 19
- Vite
- Tailwind CSS
- React Router

**Backend**
- Node.js + Express
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

## Project Structure

```
bike-bazar-fullstack/
├── bike-bazar-api/       # Backend (Express + MongoDB)
└── bike-bazar-export/    # Frontend (React + Vite)
```

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/tiksbro/bike-bazar-fullstack.git
cd bike-bazar-fullstack
```

### 2. Set up the backend

```bash
cd bike-bazar-api
npm install
```

Create a `.env` file in `bike-bazar-api/` (copy `.env.example`) and fill in:

```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_secret_key
```

Start the backend:

```bash
npm run dev
```

### 3. Set up the frontend

Open a new terminal:

```bash
cd bike-bazar-export
npm install
npm run dev
```

The frontend will run on Vite's local dev server (usually `http://localhost:5173`), and it talks to the backend API.

## Author

Built by [Tikaram Chimariya](https://github.com/tiksbro)
