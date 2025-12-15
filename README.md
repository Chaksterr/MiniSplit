# MiniSplit - Expense Sharing App

A modern expense sharing application built with NestJS and Next.js, designed to help groups of friends, roommates, or colleagues easily split expenses and settle debts.

## Features

- 👥 **Group Management** - Create and manage expense groups with invite codes
- 💰 **Expense Tracking** - Add, edit, and delete expenses with file attachments
- 📊 **Smart Balance Calculation** - Automatic balance calculation with optimized settlement plans
- 🏷️ **Budget Categories** - Set personal budgets for different expense categories
- 📱 **Real-time Updates** - Activity feed showing all group transactions
- 🔐 **Secure Authentication** - JWT-based authentication with profile management
- 📎 **File Uploads** - Attach receipts and proof images to expenses

## Tech Stack

### Backend
- NestJS (Node.js framework)
- TypeORM (Database ORM)
- PostgreSQL (Database)
- JWT Authentication
- Multer (File uploads)

### Frontend
- Next.js 16 (React framework)
- TypeScript
- Tailwind CSS
- Zustand (State management)
- Axios (API calls)

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v14 or higher)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Chaksterr/minisplit.git
cd minisplit
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=minisplit

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=7d

# Server
PORT=3001
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Database Setup

Create a PostgreSQL database:

```bash
psql -U postgres
CREATE DATABASE minisplit;
\q
```

The application will automatically run migrations on first start.

## Running the Application

### Start Backend

```bash
cd backend
npm run start:dev
```

Backend will run on `http://localhost:3001`

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

## Usage

1. **Register** - Create a new account at `/auth/register`
2. **Create Group** - Start a new expense group or join existing one with invite code
3. **Add Expenses** - Track expenses with title, amount, category, and participants
4. **View Balances** - See who owes what with optimized settlement suggestions
5. **Settle Debts** - Mark payments as complete to update balances

## Project Structure

```
minisplit/
├── backend/
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── user/          # User management
│   │   ├── group/         # Group management
│   │   ├── expense/       # Expense tracking
│   │   ├── category/      # Budget categories
│   │   ├── balance/       # Balance calculations
│   │   └── settlement/    # Debt settlements
│   └── uploads/           # File storage (not tracked)
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages
│   │   ├── components/    # React components
│   │   ├── lib/           # API & utilities
│   │   └── hooks/         # Custom React hooks
└── README.md
```

## API Documentation

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

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
