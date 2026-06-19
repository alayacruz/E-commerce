## Project Overview

This is a full-stack **Online Shopping Database Management System** catering to both buyers and sellers. The platform supports end-to-end product lifecycle management — from seller listings and inventory to buyer discovery, cart management, and checkout.
The system also incorporates a **Recommendation Engine** powered by **content-based filtering**.

The database is designed using **Entity-Relationship (ER) Modelling** in **Boyce-Codd Normal Form (BCNF)** to ensure data integrity and eliminate redundancy. It is managed via **Prisma ORM** backed by **PostgreSQL**.

##  Project Structure
```

E-commerce/
├── frontend/                  # React + Vite + TypeScript
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── contexts/          # React context providers
│       ├── pages/             # Route-level page components
│       └── public/            # Static assets
├── backend/                   # Express.js + Node.js + TypeScript
│   ├── middleware/            # Auth, error handling, etc.
│   ├── prisma/                # Schema & migrations (PostgreSQL)
│   └── routers/               # API route handlers
│       ├── authRouter.js
│       ├── productRouter.js
│       ├── recommendationRouter.js
│       ├── cartRouter.js
│       ├── orderRouter.js
│       ├── sellerRouter.js
│       └── ...
├── ml/                        # Python recommendation engine
│   ├── train.py               # Model training (TF-IDF + content-based filtering)
│   ├── main.py                # Inference / recommendation serving
│   ├── vectoriser.pkl         # Trained TF-IDF vectoriser
│   └── product_vectors.pkl    # Precomputed product feature vectors
└── README.md
```


### Tech Stack

**Frontend **
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
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Caching**: Redis 5.9.0
- **Search**: Elasticsearch 9.2.0
- **File Storage**: Cloudinary 1.41.3
- **Payment Processing**: PayPal Server SDK 1.0.0
- **File Upload**: Multer 2.0.2
- **Security**: Bcrypt 6.0.0

**ML / Recommendation Engine**
- **Language**: Python
- **Approach**: Content-Based Filtering
- **Vectorisation**: TF-IDF (scikit-learn)
- **Artefacts**: Pre-trained vectoriser (`vectoriser.pkl`) and product vectors (`product_vectors.pkl`)

##  Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Python 3.8+
- Redis (for caching)
- PostgreSQL (for Prisma)

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

### ML Module Setup

```bash
cd ml
pip install -r requirements.txt

# To retrain the model
python train.py

# To run inference / test recommendations
python main.py
```

> Pre-trained artefacts (`vectoriser.pkl` and `product_vectors.pkl`) are included. Only run `train.py` if you want to retrain on updated product data.

### Environment Configuration

Create `.env` files in both `frontend` and `backend` directories with necessary configuration:

**Backend `.env` example:**
DATABASE_URL=your_postgresql_database_url
REDIS_URL=your_redis_url
JWT_SECRET=your_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
ELASTICSEARCH_URL=your_elasticsearch_url

**Frontend `.env` example:**
VITE_API_BASE_URL=http://localhost:3000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

##  Features

- **Dual User Roles**: Separate flows for buyers (browse, cart, checkout) and sellers (listings, inventory, orders)
- **Recommendation Engine**: Content-based filtering using TF-IDF vectorisation to surface relevant products based on item attributes and similarity
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Product Management**: Browse and search products with Elasticsearch
- **File Storage**: Image uploads via Cloudinary integration
- **Payment Processing**: PayPal integration for checkout
- **Caching**: Redis for improved performance
- **Database Design**: ER modelling in BCNF, implemented with Prisma ORM and PostgreSQL
- **Real-time Notifications**: Toast notifications for user feedback
- **Responsive Design**: Tailwind CSS for mobile-first responsive design
- **Type Safety**: Full TypeScript support in both frontend and backend

##  Dependencies

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

### ML Dependencies
See `ml/requirements.txt` for the full Python dependency list.

## 🔧 Configuration

### Database (Prisma + PostgreSQL)

The project uses Prisma as the ORM with PostgreSQL as the database, designed following ER modelling principles in BCNF. To initialise the database:

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### Recommendation Engine

The content-based filtering engine is located in the `ml/` directory. It uses TF-IDF vectorisation over product attributes to compute similarity scores and generate personalised recommendations for buyers. Pre-trained model artefacts are committed to the repo for convenience. To retrain on fresh data, run `python train.py` from the `ml/` directory.

### Elasticsearch

Ensure Elasticsearch is running and configured in your environment variables for full-text product search functionality.

### Redis

Redis is used for caching frequently accessed data. Make sure the Redis server is running on the configured URL.

##  Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **CORS Configuration**: Protected API endpoints
- **Environment Variables**: Sensitive data stored in `.env` files

##  License

ISC

##  Author
This project was built as a team effort by:

| Name |
|---|
| Prakriti Pawar |
| Alaya D'Cruz |
| Anushka Krishnan |
| Vanshika Gupta |


## Contributing

Contributions are welcome! Feel free to open issues and pull requests.

## Support

For issues and questions, please open an issue on the GitHub repository.

---

