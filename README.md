# 🏠 Property Viewing Scheduler API

A NestJS-based backend service for managing property viewings in a real estate platform. This service allows potential buyers or renters to schedule property viewings while ensuring no scheduling conflicts occur.

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Data Models](#-data-models)
- [Authentication](#-authentication)
- [Testing](#-testing)
- [Environment Configuration](#-environment-configuration)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### Core Functionality
- ✅ Schedule property viewings with automatic conflict detection
- ✅ View available time slots for properties
- ✅ Property management (CRUD operations)
- ✅ User authentication and authorization
- ✅ Input validation and error handling

### Security
- JWT-based authentication
- Role-based access control (User, Agent)
- Request validation and sanitization

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: [NestJS](https://docs.nestjs.com/)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT
- **Testing**: Jest (unit + e2e)
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- MongoDB (local or remote)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend-task
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/property-viewings
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=3600
   ```

4. **Run the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

The application will be available at `http://localhost:3000` by default.

## 📚 API Documentation

### Authentication

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Properties

#### Get All Properties
```http
GET /properties
Authorization: Bearer <token>
```

#### Get Available Time Slots
```http
GET /properties/:id/available-slots?date=2025-08-01
Authorization: Bearer <token>
```

### Property Viewings

#### Schedule a Viewing
```http
POST /property-viewings
Authorization: Bearer <token>
Content-Type: application/json

{
  "propertyId": "507f1f77bcf86cd799439011",
  "scheduledTime": "2025-08-01T14:30:00Z",
  "durationMinutes": 30
}
```

#### Cancel a Viewing
```http
DELETE /property-viewings/:id
Authorization: Bearer <token>
```

## 🗄 Data Models

### Property
```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  address: {
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
  },
  price: number,
  bedrooms: number,
  bathrooms: number,
  area: number, // in square meters
  type: 'APARTMENT' | 'HOUSE' | 'OFFICE' | 'LAND',
  status: 'AVAILABLE' | 'PENDING' | 'SOLD' | 'RENTED',
  features: string[],
  images: string[],
  agentId: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Property Viewing
```typescript
{
  _id: ObjectId,
  propertyId: ObjectId,
  userId: string,
  agentId: string,
  scheduledTime: Date,
  durationMinutes: number,
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
  notes: string,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the JWT token in the `Authorization` header for protected routes:

```
Authorization: Bearer <token>
```

### Available Roles
- **User**: Can view properties and schedule viewings
- **Agent**: Can manage properties and view scheduled viewings

## 🧪 Testing

Run the test suite with:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## ⚙️ Environment Configuration

The application can be configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | 3000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/property-viewings |
| `JWT_SECRET` | Secret key for JWT signing | (required) |
| `JWT_EXPIRES_IN` | JWT expiration time | 1h |

## 🚀 Deployment

### Prerequisites
- Node.js
- MongoDB
- PM2 (recommended for production)

### Steps
1. Build the application:
   ```bash
   npm run build
   ```

2. Start the application:
   ```bash
   npm run start:prod
   ```

3. For production, use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start dist/main.js --name "property-viewing-api"
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- NestJS community for the awesome framework
- MongoDB for the flexible NoSQL database
- All contributors who have helped improve this project
