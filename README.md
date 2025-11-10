# 🚀 Driver Management System

A full-stack application for managing driver information, licenses, and records.

## ✨ Quick Start with Concurrently

You can now start both frontend and backend with a **single command**!

### From the root directory

```bash
# Install concurrently (first time only)
bun install

# Start both servers
bun run dev
```

This will start:

- 🟢 Backend server on `http://localhost:5000`
- 🔵 Frontend on `http://localhost:5173`

### Available Root Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start both server and client in development mode |
| `bun run start` | Start production server and dev client |
| `bun run seed` | Populate database with 12 sample drivers + 6 driver accounts |
| `bun run install:all` | Install all dependencies (client + server) |
| `bun run build` | Build both client and server |

---

## Tech Stack

### Frontend

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS v4** for styling
- **React Router v7** for navigation

### Backend

- **Bun** runtime
- **Express.js** for API
- **MongoDB** with Mongoose ODM
- **TypeScript** for type safety

## Project Structure

```
driver-management-system/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   └── Layout.tsx
│   │   ├── pages/            # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DriverList.tsx
│   │   │   ├── DriverForm.tsx
│   │   │   └── DriverDetail.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css         # Tailwind imports
│   ├── package.json
│   └── vite.config.ts
│
└── server/                    # Backend API
    ├── src/
    │   ├── config/
    │   │   └── database.ts
    │   ├── controllers/
    │   │   └── driver.controller.ts
    │   ├── middleware/
    │   │   ├── errorHandler.ts
    │   │   └── validation.ts
    │   ├── models/
    │   │   └── driver.model.ts
    │   ├── routes/
    │   │   └── driver.routes.ts
    │   ├── utils/
    │   │   └── AppError.ts
    │   └── index.ts
    ├── .env
    └── package.json
```

## Getting Started

### Prerequisites

1. **Node.js** (for frontend)
2. **Bun** (for backend)
3. **MongoDB** (local or cloud instance)

### Installation

#### 1. Clone and Setup

```bash
cd driver-management-system
```

#### 2. Frontend Setup

```bash
cd client
npm install
```

Create `client/.env` (optional):

```env
VITE_API_URL=http://localhost:5000/api
```

#### 3. Backend Setup

```bash
cd server
bun install
```

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/driver-management
CORS_ORIGIN=http://localhost:5173
```

#### 4. Start MongoDB

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
```

#### 5. Seed the Database (Optional)

Populate the database with sample data:

```bash
bun run seed
```

This will create:

- **12 sample drivers** with realistic data
- **6 driver accounts** (first 6 drivers get login credentials)
- **Default password:** `driver123` for all seeded driver accounts

**Sample Driver Emails with Accounts:**

- <john.smith@example.com>
- <sarah.johnson@example.com>
- <michael.brown@example.com>
- <emily.davis@example.com>
- <david.wilson@example.com>
- <jessica.martinez@example.com>

The remaining 6 drivers will **not** have accounts, demonstrating the "No Account" badge feature.

### Running the Application

#### Start Backend (Terminal 1)

```bash
cd server
bun run dev
```

The API will be available at: `http://localhost:5000`

#### Start Frontend (Terminal 2)

```bash
cd client
npm run dev
```

The app will be available at: `http://localhost:5173`

## Features

### ✅ Implemented

#### Frontend

- Dashboard with statistics cards
- Driver list with search and filtering
- Add/Edit driver forms with validation
- Driver detail view
- Delete driver with confirmation modal
- Responsive design with Tailwind CSS v4
- Modern UI components

#### Backend

- RESTful API with Express
- MongoDB integration with Mongoose
- CRUD operations for drivers
- Search and filtering
- Pagination support
- Data validation
- Error handling
- Driver statistics endpoint

## API Endpoints

### Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/api/health` | Health check |
| GET | `/api/drivers` | Get all drivers (with filters) |
| GET | `/api/drivers/:id` | Get driver by ID |
| POST | `/api/drivers` | Create new driver |
| PUT | `/api/drivers/:id` | Update driver |
| DELETE | `/api/drivers/:id` | Delete driver |
| GET | `/api/drivers/stats` | Get statistics |

### Query Parameters for GET /api/drivers

- `status` - Filter by status (active, inactive, pending, all)
- `search` - Search by name, email, or license number
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Sort field (default: createdAt)
- `order` - Sort order (asc, desc)

## Data Model

### Driver Schema

```typescript
{
  name: string;              // Required, 2-100 chars
  email: string;             // Required, unique, valid email
  phone: string;             // Required
  dateOfBirth: Date;         // Required
  address: string;           // Optional
  city: string;              // Optional
  state: string;             // Optional
  zipCode: string;           // Optional
  licenseNumber: string;     // Required, unique, uppercase
  licenseExpiry: Date;       // Required
  licenseClass: string;      // Required (Class A/B/C/D)
  status: string;            // active/inactive/pending
  createdAt: Date;           // Auto-generated
  updatedAt: Date;           // Auto-generated
}
```

## Next Steps / TODO

### Backend Integration

- [ ] Create API service layer in frontend
- [ ] Connect frontend forms to backend API
- [ ] Implement real-time statistics
- [ ] Add authentication & authorization
- [ ] Add file upload for driver documents
- [ ] Implement audit logging

### Additional Features

- [ ] Export drivers to PDF/CSV
- [ ] Email notifications for license expiry
- [ ] Bulk import drivers
- [ ] Advanced filtering & sorting
- [ ] Driver document management
- [ ] Violation/incident tracking
- [ ] Vehicle assignment

### Improvements

- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Set up CI/CD pipeline
- [ ] Add API documentation (Swagger)
- [ ] Implement caching
- [ ] Add rate limiting
- [ ] Setup logging service

## Development

### Frontend Development

```bash
cd client
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend Development

```bash
cd server
bun run dev      # Start with hot reload
bun start        # Start production
bun run build    # Build
```

## Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/driver-management
CORS_ORIGIN=http://localhost:5173
```

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
