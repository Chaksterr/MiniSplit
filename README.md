# MiniSplit 💸 - Expense Sharing App

> A modern, full-stack expense sharing application that makes splitting bills and tracking group expenses effortless. Built with NestJS and Next.js for optimal performance and developer experience.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

## 🌟 Features

### Core Functionality
- 👥 **Group Management** - Create and manage expense groups with unique invite codes for easy collaboration
- 💰 **Expense Tracking** - Add, edit, and delete expenses with support for multiple participants and custom splits
- 📊 **Smart Balance Calculation** - Automatic balance calculation using optimized algorithms to minimize transactions
- 🏷️ **Budget Categories** - 20+ predefined categories with personal budget limits and spending alerts
- 📱 **Activity Feed** - Real-time activity stream showing all group transactions and updates
- 🔐 **Secure Authentication** - JWT-based authentication with secure password hashing
- 📎 **File Uploads** - Attach receipts, invoices, and proof images (JPG, PNG, PDF up to 5MB)
- 💳 **Settlement Tracking** - Mark settlements as pending or completed with optional proof images

### Advanced Features
- ⚡ **Optimized Settlements** - Greedy algorithm minimizes the number of transactions needed to settle all debts
- 📈 **Spending Analytics** - Track spending by category with visual budget indicators
- 🔍 **Search & Filter** - Find users, groups, and expenses quickly
- 🎨 **Dark Mode Support** - Eye-friendly interface with theme switching
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework for building efficient server-side applications
- **TypeORM** - TypeScript ORM for database management with automatic migrations
- **PostgreSQL** - Robust relational database for data persistence
- **JWT** - Secure token-based authentication
- **Multer** - Middleware for handling multipart/form-data file uploads
- **bcrypt** - Password hashing for secure user authentication
- **class-validator** - Declarative validation for DTOs

### Frontend
- **Next.js 16** - React framework with Turbopack for blazing-fast development
- **TypeScript** - Type-safe JavaScript for better developer experience
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Zustand** - Lightweight state management with persistence
- **Axios** - Promise-based HTTP client with interceptors
- **React Hooks** - Modern React patterns for state and effects

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Package manager (comes with Node.js)
- **PostgreSQL** (v14 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** - Version control system

## 🚀 Installation

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Chaksterr/minisplit.git

# Navigate to project directory
cd minisplit
```

### 2. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

Create a `.env` file in the `backend` directory with the following configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=minisplit

# JWT Configuration
JWT_SECRET=your_very_secure_secret_key_here_min_32_chars
JWT_EXPIRATION=7d

# Server Configuration
PORT=3001
NODE_ENV=development
```

> ⚠️ **Security Note**: Make sure to use a strong, unique JWT_SECRET in production (minimum 32 characters)

### 3. Setup Frontend

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

Create a `.env.local` file in the `frontend` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Database Setup

Create a PostgreSQL database for the application:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE minisplit;

# (Optional) Create dedicated user
CREATE USER minisplit_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE minisplit TO minisplit_user;

# Exit
\q
```

> 💡 **Note**: The application will automatically run TypeORM migrations on first start, creating all necessary tables.

## ▶️ Running the Application

### Development Mode

#### Start Backend Server

```bash
# From backend directory
cd backend
npm run start:dev
```

The backend server will start on **`http://localhost:3001`** with hot-reload enabled.

**Expected Output:**
```
🚀 Backend démarré sur http://localhost:3001
[Nest] Starting Nest application...
[Nest] Nest application successfully started
```

#### Start Frontend Application

```bash
# From frontend directory (open new terminal)
cd frontend
npm run dev
```

The frontend will start on **`http://localhost:3000`** with Turbopack for fast refresh.

**Access the application at:** http://localhost:3000

### Production Build

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm start
```

## 📖 Usage Guide

### Getting Started

1. **Register Account**
   - Navigate to http://localhost:3000/auth/register
   - Fill in username, email, and password
   - Click "Create Account"

2. **Create Your First Group**
   - After login, go to "Groups" page
   - Click "Create New Group"
   - Enter group name and description
   - Share the generated invite code with friends

3. **Add Expenses**
   - Select a group from your dashboard
   - Click "Add Expense"
   - Enter title, amount, and select participants
   - Choose a category and optionally attach receipts
   - Click "Create Expense"

4. **View Balances**
   - In the group view, see "Who Owes What" section
   - Review the optimized settlement plan
   - See exactly who needs to pay whom

5. **Settle Debts**
   - When payments are made, mark them as settled
   - Optionally add proof images
   - Balances update automatically

## 📁 Project Structure

```
minisplit/
├── backend/                    # NestJS Backend Application
│   ├── src/
│   │   ├── auth/              # JWT authentication & authorization
│   │   ├── user/              # User profile management
│   │   ├── group/             # Group CRUD operations
│   │   ├── group-member/      # Group membership management
│   │   ├── expense/           # Expense tracking & file uploads
│   │   ├── category/          # Budget categories & limits
│   │   ├── balance/           # Balance calculation engine
│   │   ├── settlement/        # Debt settlement tracking
│   │   ├── activity/          # Activity feed logging
│   │   └── common/            # Shared utilities & guards
│   ├── uploads/               # Uploaded files (avatars, receipts)
│   ├── .env                   # Environment variables (not tracked)
│   └── package.json           # Backend dependencies
│
├── frontend/                   # Next.js Frontend Application
│   ├── src/
│   │   ├── app/               # Next.js 16 App Router pages
│   │   │   ├── auth/          # Login & registration pages
│   │   │   ├── groups/        # Group management pages
│   │   │   ├── expenses/      # Expense pages
│   │   │   ├── categories/    # Budget category pages
│   │   │   └── profile/       # User profile page
│   │   ├── components/        # Reusable React components
│   │   │   ├── ui/            # Base UI components
│   │   │   ├── layout/        # Layout components
│   │   │   └── auth/          # Auth-related components
│   │   ├── lib/               # API client & utilities
│   │   │   ├── api.ts         # Axios API configuration
│   │   │   ├── store.ts       # Zustand state management
│   │   │   └── utils.ts       # Helper functions
│   │   └── hooks/             # Custom React hooks
│   ├── .env.local             # Frontend environment variables
│   └── package.json           # Frontend dependencies
│
├── .gitignore                 # Git ignore rules (.env protected)
└── README.md                  # Project documentation
```

## 🔌 API Documentation

The backend API runs on `http://localhost:3001` with the following endpoints:

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register a new user | ❌ |
| POST | `/auth/login` | Login and get JWT token | ❌ |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | ✅ |
| GET | `/users/:id` | Get user by ID | ✅ |
| GET | `/users/username/:username` | Get user by username | ✅ |
| GET | `/users/name/:name` | Search users by name | ✅ |
| PUT | `/users/:id` | Update user profile | ✅ |
| DELETE | `/users/:id` | Delete user account | ✅ |
| POST | `/users/:id/avatar` | Upload user avatar | ✅ |
| DELETE | `/users/:id/avatar` | Delete user avatar | ✅ |

### Group Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/groups` | Create a new group | ✅ |
| GET | `/groups` | Get all user's groups | ✅ |
| GET | `/groups/:id` | Get group by ID | ✅ |
| GET | `/groups/name/:name` | Search groups by name | ✅ |
| GET | `/groups/code/:code` | Get group by invite code | ✅ |
| PUT | `/groups/:id` | Update group details | ✅ |
| DELETE | `/groups/:id` | Delete group | ✅ |

### Group Member Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/group-members` | Add member to group | ✅ |
| GET | `/group-members/group/:groupId` | Get all group members | ✅ |
| GET | `/group-members/user/:userId` | Get user's group memberships | ✅ |
| POST | `/group-members/:id/promote` | Promote member to admin | ✅ |
| DELETE | `/group-members/:id` | Remove member from group | ✅ |

### Expense Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/expenses` | Create new expense | ✅ |
| GET | `/expenses` | Get all expenses | ✅ |
| GET | `/expenses/:id` | Get expense by ID | ✅ |
| GET | `/expenses/group/:groupId` | Get all group expenses | ✅ |
| PUT | `/expenses/:id` | Update expense | ✅ |
| DELETE | `/expenses/:id` | Delete expense | ✅ |
| POST | `/expenses/:id/attachments` | Upload expense attachments | ✅ |
| DELETE | `/expenses/:id/attachments/:filename` | Delete attachment | ✅ |

### Category Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/categories` | Get all categories | ✅ |
| GET | `/categories/with-budgets` | Get categories with user budgets | ✅ |
| GET | `/categories/user/budgets` | Get user's budget settings | ✅ |
| GET | `/categories/:id` | Get category by ID | ✅ |
| GET | `/categories/:id/budget` | Get user budget for category | ✅ |
| POST | `/categories/:id/budget` | Set user budget for category | ✅ |
| DELETE | `/categories/:id/budget` | Remove user budget | ✅ |
| POST | `/categories` | Create new category | ✅ |
| PUT | `/categories/:id` | Update category | ✅ |
| DELETE | `/categories/:id` | Delete category | ✅ |

### Balance Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/balances/group/:groupId` | Get group balances & settlement plan | ✅ |

### Settlement Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/settlements` | Create new settlement | ✅ |
| GET | `/settlements` | Get all settlements | ✅ |
| GET | `/settlements/:id` | Get settlement by ID | ✅ |
| GET | `/settlements/group/:groupId` | Get group settlements | ✅ |
| GET | `/settlements/user/:userId` | Get user settlements | ✅ |
| PUT | `/settlements/:id` | Update settlement | ✅ |
| DELETE | `/settlements/:id` | Delete settlement | ✅ |

### Activity Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/activities` | Create activity log | ✅ |
| GET | `/activities` | Get all activities | ✅ |
| GET | `/activities/group/:groupId` | Get group activities | ✅ |
| GET | `/activities/user/:userId` | Get user activities | ✅ |

### 📝 Request Examples

#### Creating an Expense
```json
POST /expenses
{
  "title": "Dinner at Restaurant",
  "amount": 120.50,
  "description": "Team dinner",
  "date": "2025-12-15",
  "paidBy": 1,
  "groupId": 5,
  "participants": [1, 2, 3],
  "categoryId": 8,
  "splitType": "equal"
}
```

#### Setting a Budget
```json
POST /categories/8/budget
{
  "budgetLimit": 500.00
}
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
   ```bash
   git fork https://github.com/Chaksterr/minisplit.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation as needed

4. **Commit your changes**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
   
   Use conventional commits:
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `refactor:` - Code refactoring
   - `test:` - Test additions/changes
   - `chore:` - Maintenance tasks

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Wait for review and feedback

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check database credentials in `.env`
- Ensure port 3001 is available

**Frontend can't connect to backend:**
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check backend is running on port 3001
- Clear browser cache and restart dev server

**Database migration errors:**
- Drop and recreate database if needed
- Check TypeORM configuration
- Ensure database user has proper permissions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Chaksterr**
- GitHub: [@Chaksterr](https://github.com/Chaksterr)

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/) and [Next.js](https://nextjs.org/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Heroicons](https://heroicons.com/)


---

**⭐ If you find this project helpful, please give it a star on GitHub!**
