# E-commerce Platform

A full-stack e-commerce application built with modern web technologies. This project features a TypeScript backend with Express.js and a React frontend with Vite.

## 📋 Project Overview

This is a complete e-commerce solution with separate frontend and backend implementations. The platform is built to handle product listings, user authentication, payments, and order management.

## 🏗️ Architecture

```
E-commerce/
├── frontend/          # React + Vite + TypeScript
├── backend/          # Express.js + Node.js + TypeScript
└── README.md
```

### Tech Stack

**Frontend (77.5% TypeScript, 21.4% JavaScript)**
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.2
- **Language**: TypeScript 5.5.3
- **Styling**: Tailwind CSS 3.4.1
- **Routing**: React Router DOM 7.9.3
- **State Management**: Supabase JS 2.57.4
- **UI Components**: Lucide React (icons)
- **Toast Notifications**: React Hot Toast 2.6.0
- **Linting**: ESLint 9.9.1

**Backend**
- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Language**: TypeScript 5.9.3
- **Database ORM**: Prisma 6.19.0
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Caching**: Redis 5.9.0
- **Search**: Elasticsearch 9.2.0
- **File Storage**: Cloudinary 1.41.3
- **Payment Processing**: PayPal Server SDK 1.0.0
- **File Upload**: Multer 2.0.2
- **Security**: Bcrypt 6.0.0
- **API Documentation**: CORS 2.8.5

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Redis (for caching)
- PostgreSQL or MySQL (for Prisma)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Available Scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run typecheck` - Type checking with TypeScript

### Backend Setup

```bash
cd backend
npm install
npm start
```

**Available Scripts:**
- `npm start` - Start the server (node server.js)
- `npm test` - Run tests

### Environment Configuration

Create `.env` files in both `frontend` and `backend` directories with necessary configuration:

**Backend `.env` example:**
```
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url
JWT_SECRET=your_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
ELASTICSEARCH_URL=your_elasticsearch_url
```

**Frontend `.env` example:**
```
VITE_API_BASE_URL=http://localhost:3000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## ✨ Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Product Management**: Browse and search products with Elasticsearch
- **File Storage**: Image uploads via Cloudinary integration
- **Payment Processing**: PayPal integration for checkout
- **Caching**: Redis for improved performance
- **Database**: Prisma ORM for type-safe database operations
- **Real-time Notifications**: Toast notifications for user feedback
- **Responsive Design**: Tailwind CSS for mobile-first responsive design
- **Type Safety**: Full TypeScript support in both frontend and backend

## 📦 Dependencies

### Frontend Dependencies
```json
{
  "@supabase/supabase-js": "^2.57.4",
  "lucide-react": "^0.344.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-hot-toast": "^2.6.0",
  "react-router-dom": "^7.9.3",
  "react-spinners": "^0.17.0",
  "react-tooltip": "^5.30.0"
}
```

### Backend Dependencies
```json
{
  "@elastic/elasticsearch": "^9.2.0",
  "@mockoon/cli": "^9.3.0",
  "@paypal/paypal-server-sdk": "^1.0.0",
  "@prisma/client": "^6.19.0",
  "bcrypt": "^6.0.0",
  "cloudinary": "^1.41.3",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "express": "^5.1.0",
  "jsonwebtoken": "^9.0.2",
  "multer": "^2.0.2",
  "multer-storage-cloudinary": "^4.0.0",
  "redis": "^5.9.0",
  "uuid": "^13.0.0"
}
```

## 🔧 Configuration

### Database (Prisma)

The project uses Prisma as the ORM. To initialize the database:

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### Elasticsearch

Ensure Elasticsearch is running and configured in your environment variables for product search functionality.

### Redis

Redis is used for caching. Make sure Redis server is running on the configured URL.

## 📝 Project Structure

- **frontend/**: React Vite application with TypeScript
  - Components
  - Pages/Routes
  - Services
  - Styling with Tailwind CSS
  
- **backend/**: Express.js application with TypeScript
  - Routes
  - Controllers
  - Models (Prisma)
  - Middleware
  - Services

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **CORS Configuration**: Protected API endpoints
- **Environment Variables**: Sensitive data stored in `.env` files

## 📊 Repository Stats

- **Primary Language**: TypeScript (77.5%)
- **Secondary Language**: JavaScript (21.4%)
- **Other**: 1.1%

## 🚀 Deployment

Both frontend and backend can be deployed to various platforms:

- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Heroku, Railway, AWS, Google Cloud

Ensure all environment variables are properly configured in your deployment platform.

## 📝 License

ISC

## 👤 Author

[alayacruz](https://github.com/alayacruz)

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.

## 📞 Support

For issues and questions, please open an issue on the GitHub repository.

---

**Last Updated**: June 8, 2026
