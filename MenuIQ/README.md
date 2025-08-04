# MenuIQ - AI-Driven Restaurant Menu Optimization SaaS

MenuIQ is a comprehensive SaaS platform that helps restaurants optimize their menus using AI-powered insights and data analytics.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- PostgreSQL 13+
- npm or yarn

### Backend Setup

1. **Clone and navigate to backend directory**
```bash
mkdir menuiq-backend
cd menuiq-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Database setup**
```bash
# Create database
createdb menuiq

# Run migrations
npm run migrate

# Seed with sample data
npm run seed
```

5. **Start development server**
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Create new Vite React project**
```bash
npm create vite@latest menuiq-frontend -- --template react
cd menuiq-frontend
```

2. **Install dependencies**
```bash
npm install react-router-dom lucide-react axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3. **Replace default files with MenuIQ components**
- Copy all the frontend files provided above
- Update `tailwind.config.js` with the custom configuration
- Replace `src/App.jsx`, create components and pages directories

4. **Start development server**
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

### Backend (`/backend`)
```
├── server.js              # Main Express application
├── config/
│   └── database.js        # PostgreSQL connection setup
├── routes/
│   ├── menu.js           # Menu-related API endpoints
│   └── user.js           # User authentication endpoints
├── middleware/
│   └── errorHandler.js   # Global error handling
├── scripts/
│   ├── migrate.js        # Database migration script
│   └── seed.js           # Sample data seeding
└── .env.example          # Environment variables template
```

### Frontend (`/frontend`)
```
├── src/
│   ├── App.jsx           # Main application component
│   ├── index.css         # Global styles and Tailwind imports
│   ├── components/
│   │   ├── Layout.jsx    # Main layout wrapper
│   │   ├── Sidebar.jsx   # Navigation sidebar
│   │   └── Navbar.jsx    # Top navigation bar
│   └── pages/
│       ├── Dashboard.jsx # Dashboard page
│       ├── MenuUpload.jsx# Menu upload interface
│       └── Settings.jsx  # User settings page
├── tailwind.config.js    # Tailwind CSS configuration
└── vite.config.js        # Vite bundler configuration
```

## 🎯 Features Implemented (Sprint 1)

### Frontend ✅
- **Clean Dark Theme UI** with custom color scheme (#0A1A2F background, #00C4CC/#007DFF accents)
- **Responsive Layout** with sidebar navigation and top navbar
- **Routing Setup** for Dashboard, Menu Upload, and Settings pages
- **File Upload Interface** with drag & drop for CSV/JSON menu files
- **Dashboard** with mock stats and quick actions
- **Settings Page** with tabbed interface for profile, notifications, preferences
- **TailwindCSS Integration** with custom theme and components

### Backend ✅
- **Express Server** with security middleware (helmet, cors, rate limiting)
- **PostgreSQL Integration** with connection pooling
- **RESTful API Endpoints**:
  - `POST /api/menu/upload` - Upload and process menu files
  - `GET /api/menu/:id` - Retrieve menu with items and statistics
  - `GET /api/menu/:id/insights` - AI-generated menu insights
  - `GET /api/menu` - List all menus for user
  - `DELETE /api/menu/:id` - Delete menu
- **User Authentication** endpoints (register, login, profile)
- **File Processing** for CSV and JSON uploads with validation
- **Database Schema** with users, menus, and menu_items tables
- **Error Handling** and validation middleware
- **Database Migration** and seeding scripts

## 🛠 API Endpoints

### Menu Management
- `POST /api/menu/upload` - Upload menu file with validation
- `GET /api/menu/:id` - Get menu details and items
- `GET /api/menu/:id/insights` - Get AI-powered menu insights
- `GET /api/menu` - List user's menus
- `DELETE /api/menu/:id` - Delete menu

### User Management
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User authentication
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### System
- `GET /health` - Health check endpoint

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'owner',
  restaurant_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Menus Table
```sql
CREATE TABLE menus (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Menu Items Table
```sql
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  menu_id INTEGER REFERENCES menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  cost NUMERIC(10,2) DEFAULT 0,
  category TEXT,
  tags TEXT[],
  sales_count INTEGER DEFAULT 0,
  profit_margin NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN cost > 0 THEN ((price - cost) / price * 100)
      ELSE 0
    END
  ) STORED,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Development Commands

### Backend
```bash
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm run migrate    # Run database migrations
npm run seed       # Seed database with sample data
```

### Frontend
```bash
npm run dev        # Start Vite development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 🌐 Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL=your-backend-url`

### Railway/Supabase (Backend + Database)
1. **For Railway:**
   - Connect GitHub repository
   - Add PostgreSQL service
   - Set environment variables from `.env.example`

2. **For Supabase:**
   - Create new project
   - Use the provided PostgreSQL connection string
   - Deploy backend to Railway or Render
   - Set `DATABASE_URL` environment variable

## 🔐 Security Features

- **Helmet.js** for security headers
- **CORS** protection with origin whitelisting
- **Rate limiting** to prevent abuse
- **Input validation** with express-validator
- **Password hashing** with bcryptjs
- **JWT authentication** for secure sessions
- **SQL injection protection** with parameterized queries

## 📝 CSV Upload Format

Your CSV should include these columns:
```csv
name,price,cost,category,sales_count,description,tags
"Grilled Salmon",24.99,12.50,"Main Course",89,"Fresh salmon with herbs","seafood,healthy"
"Caesar Salad",12.99,4.25,"Appetizer",67,"Classic Caesar","vegetarian,classic"
```

**Required fields:** `name`, `price`  
**Optional fields:** `cost`, `category`, `sales_count`, `description`, `tags`

## 🎯 Next Steps (Future Sprints)

- [ ] Authentication middleware and JWT protection
- [ ] Real AI integration (OpenAI/Claude APIs)
- [ ] Advanced analytics and reporting
- [ ] Menu optimization algorithms
- [ ] Email notifications
- [ ] Multi-restaurant support
- [ ] Export functionality
- [ ] Real-time dashboard updates
- [ ] Mobile responsiveness improvements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for restaurants everywhere**