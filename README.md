#  Enterprise Customer Relationship Management (CRM) Platform

A full-stack, enterprise-grade CRM solution built with **React (Vite)** on the frontend and **Node.js (Express)** + **MongoDB (Mongoose)** on the backend. 

This platform streamlines sales operations with client tracking, automated professional quotations generation, interactive pipelines, BDA performance analytics, and role-based permissions.

---

##  ER Diagram
To view the database architecture, field constraints, and relationships visually, see the interactive **[Eraser.io ER Diagram](https://app.eraser.io/workspace/Axjm9AQARkwbkZgI7yj3)**.

---

##  Core Features

-  **Authentication & RBAC:** Secure JWT sessions with role boundaries for Admins, BDA Managers, and BDAs.
- 📈 **Pipeline & Lead Tracking:** Interactive pipeline states (Inquiry, Demo, Proposal, etc.), checkable follow-up tasks, and detailed communication logs.
- 🛍️ **Product Catalog:** Manage catalog items and services with secure image storage.
- 📄 **Quotation Engine:** Automatically generate, discount, tax, and print commercial quotations referencing the catalog.
- 📊 **Performance Analytics:** Live KPIs tracking conversion rates, pipeline velocity, and total sales.

---

##  Technology Stack

* **Frontend:** React 19, Vite, Lucide-React, Axios, Vanilla CSS with custom Dark/Light modes.
* **Backend:** Node.js (Express), MongoDB (Mongoose ODM), JWT, Bcrypt, Multer, and Cloudinary.

---

##  Project Structure

```text
CRM/
├── Client/                  # React Frontend SPA
│   ├── src/
│   │   ├── components/      # UI Layout (Sidebar, Header, etc.)
│   │   ├── services/        # API integration layer
│   │   ├── views/           # Pipelines, catalogs, and dashboards
│   │   └── App.jsx          # App entry and theme toggles
├── Server/                  # Node.js Express REST Backend API
│   ├── src/
│   │   ├── controllers/     # Business logic modules
│   │   ├── db/              # Database connection bootstrap
│   │   ├── models/          # Mongoose Schemas (User, Lead, etc.)
│   │   └── index.js         # API Server Entrypoint
```

---

##  Quick Start Guide

### 1. Server Setup
1. Navigate to the `Server` directory:
   ```bash
   cd Server
   ```
2. Install dependencies and create a `.env` file:
   ```bash
   npm install
   ```
3. Set your environment variables in `.env`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   CORS_ORIGIN=http://localhost:5173
   ACCESS_TOKEN_SECRET=your_jwt_secret
   REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
4. Start the server:
   ```bash
   npm run start
   ```

### 2. Client Setup
1. Navigate to the `Client` directory:
   ```bash
   cd Client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env` file:
   ```env
   VITE_BACKEND_URI=http://localhost:5000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
   *The application will be running at `http://localhost:5173`.*

---

##  Demo Login Credentials

For testing and evaluation, you can log in using the following default seeded credentials:

### 1. Business Development Associate (BDA)
- **Emails:** 
  - `pooja@forge.com` (Pooja Patel)
  - `vikash@forge.com` (Vikash Kumar)
- **Password:** `password123`
- **Role:** BDA

### 2. BDA Manager
- **Email:** `neha@forge.com` (Neha Sharma)
- **Password:** `password123`
- **Role:** BDA_Manager

---

##  License
This project is licensed under the ISC License.

