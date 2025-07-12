# ReWare Backend API

A robust, scalable backend for the ReWare community clothing exchange platform. This API enables users to exchange unused clothing through direct swaps or a point-based system, promoting sustainable fashion and reducing textile waste.

## Features

- **User Authentication**: Email/password signup & login with JWT-based authentication
- **User Management**: Profile CRUD operations with points balance system
- **Item Listings**: Add, update, delete, and browse clothing items with images
- **Swap System**: Direct item swaps and points-based redemption system
- **Admin Panel**: Content moderation, user management, and platform analytics
- **File Uploads**: Cloudinary integration for item images and profile photos
- **Security**: Rate limiting, CORS, input validation, and comprehensive security measures

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Security**: Helmet, bcryptjs, express-rate-limit
- **Validation**: express-validator

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository and navigate to the backend directory
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/reware

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Points System Configuration
DEFAULT_USER_POINTS=100
SWAP_POINTS_DEDUCTION=10
ITEM_UPLOAD_POINTS_REWARD=5

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "points": 100,
    "isAdmin": false,
    "emailVerified": false,
    "createdAt": "2023-12-07T10:30:00.000Z"
  }
}
```

### Login User
```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Get Current User
```http
GET /api/auth/me
```
*Requires authentication*

### Update User Profile
```http
PUT /api/auth/me
```
*Requires authentication*

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Fashion enthusiast and sustainability advocate",
  "location": {
    "city": "New York",
    "state": "NY",
    "country": "USA"
  }
}
```

### Update Password
```http
PUT /api/auth/updatepassword
```
*Requires authentication*

**Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### Forgot Password
```http
POST /api/auth/forgotpassword
```

**Body:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password
```http
PUT /api/auth/resetpassword/:resettoken
```

**Body:**
```json
{
  "password": "newpassword123"
}
```

### Logout
```http
POST /api/auth/logout
```
*Requires authentication*

---

## User Endpoints

### Get All Users
```http
GET /api/users
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by username or name
- `location` (optional): Filter by location

### Get User Profile
```http
GET /api/users/:id
```

### Get User's Items
```http
GET /api/users/:id/items
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by item status

### Get User's Swap History
```http
GET /api/users/:id/swaps
```
*Requires authentication (own swaps or admin)*

### Get User's Points History
```http
GET /api/users/:id/points
```
*Requires authentication (own points or admin)*

### Get User Statistics
```http
GET /api/users/:id/stats
```

### Update Profile Photo
```http
PUT /api/users/:id/photo
```
*Requires authentication*

**Body:** Form data with `photo` file

### Search Users
```http
GET /api/users/search?q=john&location=newyork&limit=10
```

---

## Item Endpoints

### Get All Items
```http
GET /api/items
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `search`: Search by title, description, brand, tags
- `category`: Filter by category
- `size`: Filter by size
- `condition`: Filter by condition
- `minPoints`, `maxPoints`: Filter by points range
- `location`: Filter by owner location
- `sortBy`: Sort by field (createdAt, pointsValue, views, title)
- `sortOrder`: Sort order (asc, desc)

### Get Single Item
```http
GET /api/items/:id
```

### Create New Item
```http
POST /api/items
```
*Requires authentication*

**Body:**
```json
{
  "title": "Vintage Denim Jacket",
  "description": "Beautiful vintage denim jacket in excellent condition",
  "category": "outerwear",
  "type": "jacket",
  "size": "M",
  "condition": "excellent",
  "brand": "Levi's",
  "color": "Blue",
  "material": "100% Cotton",
  "tags": ["vintage", "denim", "casual"],
  "measurements": {
    "chest": 42,
    "length": 60,
    "notes": "Measured flat"
  }
}
```

### Update Item
```http
PUT /api/items/:id
```
*Requires authentication (owner or admin)*

### Delete Item
```http
DELETE /api/items/:id
```
*Requires authentication (owner or admin)*

### Add/Remove Favorite
```http
POST /api/items/:id/favorite
```
*Requires authentication*

### Get Favorite Items
```http
GET /api/items/my/favorites
```
*Requires authentication*

### Report Item
```http
POST /api/items/:id/report
```
*Requires authentication*

**Body:**
```json
{
  "reason": "inappropriate",
  "description": "Contains offensive content"
}
```

### Get Item Categories
```http
GET /api/items/categories
```

### Get Similar Items
```http
GET /api/items/:id/similar?limit=8
```

### Upload Item Images
```http
POST /api/items/:id/images
```
*Requires authentication (owner)*

**Body:** Form data with `images` files (max 5)

### Get My Items
```http
GET /api/items/my/items
```
*Requires authentication*

---

## Swap Endpoints

### Get My Swaps
```http
GET /api/swaps/my-swaps
```
*Requires authentication*

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status (pending, accepted, completed, rejected, cancelled)
- `type`: Filter by type (item_swap, points_redemption)

### Create Swap Request
```http
POST /api/swaps
```
*Requires authentication*

**Body for Item Swap:**
```json
{
  "type": "item_swap",
  "initiatorItem": "initiator_item_id",
  "recipientItem": "recipient_item_id",
  "message": "I'd love to trade my jacket for your sweater!"
}
```

**Body for Points Redemption:**
```json
{
  "type": "points_redemption",
  "requestedItem": "item_id",
  "pointsOffered": 25,
  "message": "I'd like to redeem this item for 25 points"
}
```

### Get Single Swap
```http
GET /api/swaps/:id
```
*Requires authentication (participants or admin)*

### Respond to Swap Request
```http
PUT /api/swaps/:id/respond
```
*Requires authentication (recipient)*

**Body:**
```json
{
  "action": "accept",
  "rejectionReason": "Optional reason if rejecting"
}
```

### Complete Swap
```http
PUT /api/swaps/:id/complete
```
*Requires authentication (participants)*

### Cancel Swap
```http
PUT /api/swaps/:id/cancel
```
*Requires authentication (initiator or admin)*

### Rate Swap Participant
```http
POST /api/swaps/:id/rate
```
*Requires authentication (participants, after completion)*

**Body:**
```json
{
  "rating": 5,
  "review": "Great experience! Item was exactly as described."
}
```

---

## Admin Endpoints

*All admin endpoints require admin privileges*

### Get Dashboard Statistics
```http
GET /api/admin/dashboard
```

### Get Platform Analytics
```http
GET /api/admin/analytics?period=30
```

### Get Recent Activity
```http
GET /api/admin/activity
```

### User Management

#### Get All Users (Admin)
```http
GET /api/admin/users
```

#### Update User Status
```http
PUT /api/admin/users/:id/status
```

**Body:**
```json
{
  "isActive": false,
  "reason": "Violation of terms of service"
}
```

#### Award/Deduct Points
```http
POST /api/admin/users/:id/points
```

**Body:**
```json
{
  "amount": 50,
  "reason": "Community contribution reward",
  "description": "Awarded for helping new users"
}
```

### Item Moderation

#### Get Items for Moderation
```http
GET /api/admin/items
```

**Query Parameters:**
- `status`: Filter by status (pending_approval, all)
- `reported`: Filter reported items (true/false)

#### Moderate Item
```http
PUT /api/admin/items/:id/moderate
```

**Body:**
```json
{
  "action": "approve",
  "reason": "Item meets community guidelines"
}
```

#### Feature/Unfeature Item
```http
PUT /api/admin/items/:id/feature
```

**Body:**
```json
{
  "featured": true,
  "featuredUntil": "2023-12-31T23:59:59.999Z"
}
```

#### Delete Item (Admin)
```http
DELETE /api/admin/items/:id
```

**Body:**
```json
{
  "reason": "Violates community guidelines"
}
```

---

## Error Responses

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Default Limit**: 100 requests per 15 minutes per IP
- **Authentication Endpoints**: May have stricter limits
- **File Upload Endpoints**: May have stricter limits

When rate limit is exceeded, the API returns a `429` status code with retry information.

---

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Configured for frontend integration
- **Security Headers**: Helmet.js for security headers
- **File Upload Security**: File type and size validation
- **XSS Protection**: Input sanitization
- **SQL Injection Protection**: Mongoose parameterized queries

---

## File Upload Specifications

### Item Images
- **Max Files**: 5 per item
- **Max Size**: 5MB per file
- **Formats**: JPG, JPEG, PNG, WebP
- **Processing**: Auto-resized to 800x800px, converted to WebP

### Profile Photos
- **Max Files**: 1
- **Max Size**: 2MB
- **Formats**: JPG, JPEG, PNG, WebP
- **Processing**: Auto-resized to 400x400px, face detection cropping

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment (development/production) | development |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Optional |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Optional |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Optional |
| `DEFAULT_USER_POINTS` | Points awarded on registration | 100 |
| `ITEM_UPLOAD_POINTS_REWARD` | Points for uploading items | 5 |
| `SWAP_POINTS_DEDUCTION` | Points deducted for swaps | 10 |

---

## Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (placeholder)

### Project Structure

```
backend/
├── config/           # Configuration files
│   ├── database.js   # MongoDB connection
│   └── cloudinary.js # Cloudinary setup
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── utils/           # Utility functions
├── server.js        # Main server file
└── package.json     # Dependencies
```

---

## Contributing

1. Follow the existing code style and structure
2. Add proper error handling and validation
3. Include appropriate middleware for security
4. Update documentation for new endpoints
5. Test all endpoints thoroughly

---

## License

This project is licensed under the ISC License. 