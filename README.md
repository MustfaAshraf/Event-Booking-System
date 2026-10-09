# Event Booking System API

A robust, production-grade, and scalable RESTful API for an **Event Booking System** built with **Node.js, Express, TypeScript, and MongoDB (Mongoose)**.

This system provides complete user authentication, role-based access control (`User`, `Organizer`, `Admin`), event management with full search, filtering, and pagination support, thread-safe atomic booking reservations (preventing overbooking & race conditions), a 24-hour cancellation rule, and non-blocking background email notifications.

---

## Key Features & Business Rules

### 1. Authentication & Security
- **Role-Based Access Control (RBAC)**: Distinguishes between `User`, `Organizer`, and `Admin` permissions.
- **JWT & HttpOnly Refresh Token**: Secure access tokens with HttpOnly cookies for session refresh and logout.
- **Security Hardening**: Protected with `helmet` headers, `cors`, and `express-rate-limit` on sensitive endpoints like `/login`.

### 2. Event Management
- **Full CRUD Operations**: Organizers and Admins can create, update, delete, and view event details.
- **Advanced Search & Filtering**: Supports title search, category filtering, date range filtering (`startDateFrom`, `startDateTo`), and price/date sorting (`sort=-startDate`, `sort=price`).
- **Pagination**: Configurable `page` and `limit` with total count metadata.
- **Public vs Draft Visibility**: Regular users see **only `published` events**, while Organizers/Admins can manage draft and published events.
- **Remaining Seats Tracking**: Automatically calculates and attaches `remainingSeats` to event responses.
- **Owner Scope & Capacity Protection**: Organizers can only modify their own events, and capacity cannot be lowered below already booked seats.
- **Soft Delete / Event Cancellation**: If an event has active bookings, deleting it sets its status to `cancelled` and automatically cancels all associated bookings instead of hard-deleting records.

### 3. Concurrency-Safe Booking System
- **Thread-Safe Atomic Reservations**: Uses MongoDB `$expr` with `$inc` on `findOneAndUpdate` to guarantee zero overbooking/race conditions—even under concurrent high-concurrency requests.
- **Seat Allocation**: Users can book between **1 and 5 seats** per booking.
- **Active Booking Limit**: Enforces a maximum of **1 active booking per user per event** using MongoDB partial unique indexes.
- **24-Hour Cancellation Policy**: Bookings can only be cancelled at least **24 hours prior** to event `startDate`. Cancelled seats are immediately returned to available capacity.
- **Server-Side Price Calculation**: Total price is computed strictly on the server (`event.price * seats`) and stored with the booking.

### 4. Background Email Worker (Simulation)
- Uses Node.js non-blocking `setImmediate()` to log structured booking confirmation emails to the console asynchronously without delaying HTTP responses.

---

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Joi
- **Security & Auth**: JSON Web Tokens (jsonwebtoken), bcrypt, Helmet, CORS, Express Rate Limit, Cookie Parser

---

## Quick Start & Installation

Follow these steps to run the project on any machine without setup issues.

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://localhost:27017` OR a MongoDB Atlas connection string.

### 2. Clone the Repository
```bash
git clone <REPOSITORY_URL>
cd Event-Booking
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Configuration
Create a `.env` file in the root directory (or use default values):

```env
PORT=3000
NODE_ENV=development
API_PREFIX=/api
MONGODB_URI=mongodb://localhost:27017/event_booking_db
JWT_SECRET=super_secret_jwt_key_change_in_production
JWT_ACCESS_EXPIRE=30m
JWT_REFRESH_EXPIRE=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 5. Run the Application

#### Option A: Development Mode (with hot-reloading)
```bash
npm run dev
```

#### Option B: Production Build & Run
```bash
npm run build
npm start
```

The server will start at: `http://localhost:3000`

---

## Testing with Postman / APIdog

An interactive, pre-configured **Postman Collection (v2.1)** is included in the project repository

### Recommended Reviewer Evaluation Workflow:
1. **Register & Login as Organizer** (`POST /api/auth/register` with `role: "Organizer"`).
2. **Create a Published Event** (`POST /api/events` with `status: "published"`).
3. **Register & Login as User** (`POST /api/auth/register` with `role: "User"`).
4. **Book Seats** (`POST /api/events/:id/bookings` with `{ "seats": 2 }`). Observe the background email log in the terminal!
5. **View User Bookings** (`GET /api/bookings/me`).
6. **Cancel Booking** (`PATCH /api/bookings/:id/cancel`). Verify seats are returned to event capacity.

---

## Architecture & Design Decisions

- **Atomic Operations vs Multi-Document Transactions**:
  Rather than requiring a replica set cluster configuration for transactions (which can break on standalone local MongoDB instances), capacity checks and seat increments are performed using **atomic `findOneAndUpdate` with MongoDB `$expr`**. This delivers lock-free, high-performance concurrency protection that works across all MongoDB deployment environments out of the box.
- **Modular Directory Architecture**:
  Organized cleanly into domain modules (`auth`, `events`, `bookings`), each containing its own controllers, services, validations, and routes for high maintainability.

---
