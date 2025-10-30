# 🅿️ Smart Parking Locator - MEAN Stack Application

A complete real-time parking management system built with MongoDB, Express.js, Angular, and Node.js (MEAN stack) featuring WebSocket-based live updates using Socket.IO.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Real-Time Updates](#real-time-updates)
- [Demo Credentials](#demo-credentials)
- [Architecture](#architecture)

## ✨ Features

### Core Features
- **Real-Time Updates**: WebSocket-based instant updates using Socket.IO
- **Parking List View**: Dynamic list of parking areas with availability status
- **Interactive Map View**: Leaflet-based map showing parking locations
- **Admin Panel**: Manage parking slots with real-time updates
- **JWT Authentication**: Secure admin and user authentication
- **Distance Calculation**: Haversine formula-based nearest parking finder
- **Occupancy Statistics**: Live parking availability metrics

### Key Highlights
- ✅ All connected clients auto-update without page reload
- ✅ Admin can mark slots as occupied/free
- ✅ Users can find nearest available parking
- ✅ Live occupancy stats (e.g., 10/50 slots available)
- ✅ Reactive Forms + Angular Services + RxJS Observables
- ✅ No Firebase / No polling required

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - WebSocket for real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **Angular 17** - Frontend framework
- **TypeScript** - Programming language
- **RxJS** - Reactive programming
- **Socket.IO Client** - WebSocket client
- **Leaflet** - Interactive maps
- **Reactive Forms** - Form handling

## 📁 Project Structure

```
smart-parking-locator/
├── server/
│   ├── models/
│   │   ├── ParkingArea.js        # Parking area schema
│   │   └── User.js                # User schema
│   ├── controllers/
│   │   ├── parkingController.js   # Parking business logic
│   │   └── authController.js      # Auth business logic
│   ├── routes/
│   │   ├── parkingRoutes.js       # Parking API routes
│   │   └── authRoutes.js          # Auth API routes
│   ├── middleware/
│   │   └── auth.js                # JWT middleware
│   ├── server.js                  # Main server file
│   ├── seedData.js                # Database seed script
│   ├── package.json
│   └── .env
│
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── parking-list/          # Parking list component
│   │   │   │   ├── parking-map/           # Map view component
│   │   │   │   ├── admin-panel/           # Admin dashboard
│   │   │   │   └── login/                 # Login component
│   │   │   ├── services/
│   │   │   │   ├── parking.service.ts     # Parking API service
│   │   │   │   ├── socket.service.ts      # WebSocket service
│   │   │   │   └── auth.service.ts        # Auth service
│   │   │   ├── models/
│   │   │   │   └── parking.model.ts       # TypeScript interfaces
│   │   │   ├── app.component.ts
│   │   │   ├── app.routes.ts
│   │   │   └── app.config.ts
│   │   ├── environments/
│   │   │   ├── environment.ts
│   │   │   └── environment.prod.ts
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   ├── angular.json
│   ├── tsconfig.json
│   └── package.json
│
└── README.md
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Angular CLI** (v17) - Install via: `npm install -g @angular/cli`
- **Git** (optional) - [Download](https://git-scm.com/)

## 🚀 Installation

### 1. Clone or Download the Project

Navigate to the project directory:
```bash
cd smart-parking-locator
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file (already created, but verify settings)
# Update MONGODB_URI if needed

# Seed the database with sample data
node seedData.js
```

Expected output:
```
✅ Connected to MongoDB
🗑️  Cleared existing data
✅ Added parking areas
✅ Added users

📊 Seed data summary:
   - 5 parking areas created
   - 2 users created

👤 Login credentials:
   Admin: admin@smartparking.com / admin123
   User:  user@smartparking.com / user123

✅ Database seeded successfully!
```

### 3. Frontend Setup

```bash
# Navigate to client directory (from project root)
cd client

# Install dependencies
npm install
```

## 🎯 Running the Application

### Method 1: Run Backend and Frontend Separately

#### Terminal 1 - Start Backend Server:
```bash
cd server
npm run dev
# or
npm start
```

Expected output:
```
🚀 Server running on port 5000
📡 Socket.IO ready for real-time updates
✅ MongoDB connected successfully
```

#### Terminal 2 - Start Angular Frontend:
```bash
cd client
npm start
# or
ng serve
```

Expected output:
```
** Angular Live Development Server is listening on localhost:4200 **
✔ Compiled successfully.
```

### Method 2: Quick Start (Recommended)

Open **two separate terminals**:

**Terminal 1 (Backend):**
```bash
cd server && npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client && ng serve
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:4200
```

The backend API will be running at:
```
http://localhost:5000
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### POST /api/auth/login
Login user.

**Request Body:**
```json
{
  "email": "admin@smartparking.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "email": "admin@smartparking.com",
    "role": "admin"
  }
}
```

#### GET /api/auth/me
Get current user (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "username": "admin",
  "email": "admin@smartparking.com",
  "role": "admin"
}
```

### Parking Endpoints

#### GET /api/parkings
Get all parking areas.

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Downtown Plaza",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060
    },
    "address": "123 Main St, New York, NY 10001",
    "totalSlots": 50,
    "availableSlots": 35,
    "slots": [
      {
        "slotNumber": 1,
        "isAvailable": true,
        "lastUpdated": "2024-10-30T10:30:00.000Z"
      }
    ]
  }
]
```

#### GET /api/parkings/:id
Get parking area by ID.

**Response:** Same as single parking area object above.

#### POST /api/parkings
Create new parking area (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "New Parking Lot",
  "location": {
    "lat": 40.7580,
    "lng": -73.9855
  },
  "address": "789 Broadway, New York, NY",
  "totalSlots": 60
}
```

**Response:** Created parking area object.

#### POST /api/parkings/:id/slot/update
Update slot status (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "slotNumber": 5,
  "isAvailable": false
}
```

**Response:**
```json
{
  "message": "Slot updated successfully",
  "parking": { /* updated parking object */ },
  "availableSlots": 34
}
```

**Socket.IO Event Emitted:**
```json
{
  "event": "slotUpdated",
  "data": {
    "parkingId": "507f1f77bcf86cd799439011",
    "slotNumber": 5,
    "isAvailable": false,
    "availableSlots": 34,
    "totalSlots": 50
  }
}
```

#### GET /api/parkings/nearest/search
Find nearest parking areas.

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude

**Example:**
```
GET /api/parkings/nearest/search?lat=40.7128&lng=-74.0060
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Downtown Plaza",
    "location": { "lat": 40.7128, "lng": -74.0060 },
    "distance": 0.5,
    "availableSlots": 35,
    "totalSlots": 50
  }
]
```

#### GET /api/stats/occupancy
Get occupancy statistics.

**Response:**
```json
{
  "parkingStats": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Downtown Plaza",
      "totalSlots": 50,
      "availableSlots": 35,
      "occupiedSlots": 15,
      "occupancyRate": "30.00"
    }
  ],
  "overall": {
    "totalParkingAreas": 5,
    "totalSlots": 325,
    "totalAvailable": 180,
    "totalOccupied": 145
  }
}
```

## 🔄 Real-Time Updates

### WebSocket Events

The application uses Socket.IO for real-time communication.

#### Client-Side (Angular)

**Connect to Socket:**
```typescript
import { SocketService } from './services/socket.service';

constructor(private socketService: SocketService) {}

ngOnInit() {
  // Listen for slot updates
  this.socketService.onSlotUpdated().subscribe(update => {
    console.log('Slot updated:', update);
    // Update UI automatically
  });
}
```

**Server Events:**

1. **slotUpdated** - Emitted when a slot status changes
```typescript
{
  parkingId: string,
  slotNumber: number,
  isAvailable: boolean,
  availableSlots: number,
  totalSlots: number
}
```

2. **parkingData** - Full parking data (on request)
```typescript
ParkingArea[]
```

**Client Events:**

1. **requestParkingData** - Request current parking data
```typescript
this.socketService.requestParkingData();
```

### Real-Time Flow

1. **Admin** updates slot status from admin panel
2. **Backend** updates MongoDB
3. **Backend** emits `slotUpdated` event via Socket.IO
4. **All connected clients** receive the event
5. **Angular components** auto-update UI using RxJS Observables
6. **No page reload required** ✅

## 👤 Demo Credentials

### Admin Account
```
Email: admin@smartparking.com
Password: admin123
```

**Admin Capabilities:**
- View all parking areas
- Update slot status
- Create new parking areas
- Access admin panel
- View occupancy statistics

### User Account
```
Email: user@smartparking.com
Password: user123
```

**User Capabilities:**
- View parking areas
- View map
- Find nearest parking
- View availability

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐         WebSocket          ┌──────────────────┐
│                 │ ◄─────────────────────────► │                  │
│  Angular Client │                             │  Node.js Server  │
│   (Port 4200)   │         REST API            │   (Port 5000)    │
│                 │ ◄─────────────────────────► │                  │
└─────────────────┘                             └──────────────────┘
                                                          │
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │                 │
                                                 │    MongoDB      │
                                                 │  (Port 27017)   │
                                                 │                 │
                                                 └─────────────────┘
```

### Data Flow - Slot Update

```
Admin Panel (Angular)
       │
       │ 1. Click slot to toggle
       ▼
Parking Service
       │
       │ 2. HTTP POST /api/parkings/:id/slot/update
       ▼
Express Route
       │
       │ 3. Validate JWT
       ▼
Parking Controller
       │
       │ 4. Update MongoDB
       ▼
Socket.IO Server
       │
       │ 5. Emit 'slotUpdated' event
       ▼
All Connected Clients
       │
       │ 6. Receive event via WebSocket
       ▼
Socket Service (Angular)
       │
       │ 7. RxJS Observable emits
       ▼
Components Update UI
       │
       │ 8. UI auto-refreshes
       ▼
Users See Real-Time Update ✅
```

### MongoDB Schema

**ParkingArea Model:**
```javascript
{
  name: String,
  location: {
    lat: Number,
    lng: Number
  },
  address: String,
  totalSlots: Number,
  slots: [{
    slotNumber: Number,
    isAvailable: Boolean,
    lastUpdated: Date
  }],
  createdAt: Date
}
```

**User Model:**
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  role: String (admin/user),
  createdAt: Date
}
```

## 🧪 Testing the Real-Time Feature

1. **Open two browser windows** side by side
2. **Login as admin** in Window 1
3. **Login as user** in Window 2
4. Navigate both to different views (one to admin panel, one to parking list)
5. **Change a slot status** in admin panel
6. **Observe instant update** in the user's parking list (no refresh needed!)

## 🔧 Configuration

### Environment Variables (server/.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-parking
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=24h
```

### Angular Environment (client/src/environments/environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  socketUrl: 'http://localhost:5000'
};
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Make sure MongoDB is running
mongod
# or on Windows
net start MongoDB
```

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 4200 (frontend)
npx kill-port 4200
```

### Socket.IO Connection Failed
- Ensure backend is running on port 5000
- Check CORS settings in server.js
- Verify socketUrl in environment.ts

### Build Errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🎉 Conclusion

You now have a fully functional **Smart Parking Locator** system with:
- ✅ Real-time updates via WebSocket
- ✅ MEAN stack architecture
- ✅ JWT authentication
- ✅ Interactive map view
- ✅ Admin management panel
- ✅ Distance-based parking finder
- ✅ Live occupancy statistics

Enjoy building and extending this application! 🚀
