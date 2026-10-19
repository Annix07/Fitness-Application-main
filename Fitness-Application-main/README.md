# 💪 MacroPace

**Your diet, workouts, health stats, and fitness shopping, all in one place.** 🥗🏋️🛒

MacroPace is a full-stack fitness, diet and wellness web app. Instead of juggling one app for food logs, another for workouts and a third for buying supplements, you get everything under one roof: log your meals, track your workouts, check your BMI/BMR/TDEE, and shop for gear, with an admin portal on the side to run the store. 🚀

Built by our team as a Software Engineering course project. 🎓

---

## ✨ Features

### 🌐 Public pages
- Home, About and Contact pages
- 🛍️ **Store** with product browsing and a persistent cart (saved in the browser)
- 💳 **Checkout** with shipping details and a payment method choice (card / UPI / others; the choice is saved with the order, there's no real payment gateway hooked up)

### 👤 User dashboard (login required)
- 📊 **Dashboard**: a quick summary of your day (today's meals and workouts)
- 🍽️ **Diet**: log meals by type (breakfast / lunch / dinner / snacks), search a built-in food database, browse recipes, and track calories, protein, carbs, fat and fiber
- 🏃 **Workout**: browse a built-in exercise library, follow a weekly routine, and run a workout with a countdown timer; completed workouts get logged
- ❤️ **Health Assessment**: calculates BMI, BMR (Mifflin-St Jeor), TDEE and a personalised macro split based on your activity level and goal
- ⚙️ **Settings**: update your profile, change your password and view your order history

### 🛠️ Admin portal (admin role only)
- Dashboard with key stats (users, products, orders, revenue)
- 👥 Manage users (edit / delete)
- 📦 Manage products (add / edit / delete)
- 🧾 Manage orders and update their status
- 📈 Reports with CSV export and print

---

## 🧰 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, React Router, Axios |
| Backend | PHP |
| Database | MySQL (`mysql2`) |
| Auth | JWT (7-day tokens) + bcrypt password hashing |
| Hosting config | Netlify config for the frontend (SPA redirects) |

---

## 📁 Project Structure

```
.
├── backend/
│   ├── config/db.js              # MySQL connection pool
│   ├── middleware/authMiddleware.js  # verifyToken + requireAdmin
│   ├── routes/                   # auth, profile, diet, workout, store, admin
│   ├── scripts/initDb.js         # creates the DB, tables and seed data
│   └── server.js                 # Express entry point
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/           # auth, diet, workout, layout, dashboard, common
│       ├── context/              # Auth modal, Cart, Health profile
│       ├── data/                 # food, exercise, recipe, store data + health calculations
│       ├── pages/                # public, dashboard, admin
│       ├── services/api.js       # API client
│       └── styles/               # per-page CSS
├── image/                        # project images
├── netlify.toml
└── package.json
```

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (a current LTS version) and npm
- [MySQL](https://www.mysql.com/) server running locally (or reachable remotely)

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

### 2. Set up the backend 🔧
```bash
cd backend
npm install
```

Create a `backend/.env` file:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=macropace_db
JWT_SECRET=pick_a_long_random_secret
```

> ⚠️ Don't commit your `.env`, and always set your own `JWT_SECRET`. Without one, the server falls back to a hard-coded default.

Initialise the database (creates the DB, all tables and some sample data):

```bash
npm run init-db
```

Start the API server:

```bash
npm run dev     # with nodemon (auto-reload)
# or
npm start
```

The API runs at `http://localhost:5000`. Quick check: `GET /api/health` 🩺

### 3. Set up the frontend 🎨
Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will print the local URL (usually `http://localhost:5173`).

> 📝 The API base URL is hard-coded to `http://localhost:5000/api` in `frontend/src/services/api.js`. If your backend runs somewhere else, update it there.

### 🌱 Sample data
`npm run init-db` seeds a few things so you can poke around right away:
- An **admin** account (`tirth@macropace.in`) and a regular **user** account (`alex@macropace.com`). Their passwords are in `backend/scripts/initDb.js`, so change them before putting this anywhere public!
- A handful of store products and sample orders

New sign-ups always get the `user` role.

---

## 🔌 API Overview

All routes are prefixed with `/api`. 🔒 = requires a `Authorization: Bearer <token>` header.

### Auth: `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create an account |
| POST | `/login` | Log in and get a JWT |
| GET | `/me` 🔒 | Get the current user |
| PUT | `/profile` 🔒 | Update profile |
| POST | `/change-password` 🔒 | Change password |

### Health profile: `/api/profile`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` 🔒 | Get your health profile |
| PUT | `/` 🔒 | Update your health profile and targets |

### Diet: `/api/diet`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/logs` 🔒 | Get meal logs (supports `?date=`) |
| POST | `/logs` 🔒 | Add a meal log |
| DELETE | `/logs/:id` 🔒 | Delete a meal log |

### Workout: `/api/workout`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/logs` 🔒 | Get workout logs (supports `?date=`) |
| POST | `/logs` 🔒 | Add a workout log |

### Store: `/api/store`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List products |
| POST | `/checkout` 🔒 | Place an order (also updates stock) |
| GET | `/orders` 🔒 | Get your orders |

### Admin: `/api/admin` (admin role only 🛡️)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Dashboard stats |
| GET / PUT / DELETE | `/users`, `/users/:id` | List, update, delete users |
| GET / POST / PUT / DELETE | `/products`, `/products/:id` | Manage products |
| GET | `/orders` | List all orders |
| PUT | `/orders/:id/status` | Update an order's status |

---

## 🗄️ Database

MySQL, 7 tables:

| Table | What it stores |
|-------|----------------|
| `users` | Accounts, roles (`user` / `admin` / `trainer`), status |
| `health_profiles` | Age, gender, height, weight, goal, calorie/macro targets, BMI |
| `products` | Store catalogue, stock and sales count |
| `orders` | Orders with customer, shipping and payment details |
| `order_items` | Line items for each order |
| `meal_logs` | Daily food logs with macros |
| `workout_logs` | Daily workout logs (duration, calories burned, notes) |

---

## 🚢 Deployment

The repo includes a `netlify.toml` (build command `npm run build`, SPA redirect to `index.html`), so the **frontend** can be deployed to Netlify straight from the `frontend` folder. 🌍

The **backend** needs to be hosted separately (anywhere that runs Node and can reach a MySQL database). Once it's live, point `API_BASE_URL` in `frontend/src/services/api.js` at it and set the same environment variables as in the setup above.

---

## 📝 Good to Know

- 📨 The **Contact form** is front-end only for now. It shows a success message but doesn't send or store anything.
- 📉 The sales chart on the admin dashboard uses sample (mock) data.
- 🛒 The cart lives in your browser's local storage, so it sticks around between visits but isn't tied to your account.

---

## 👥 Authors

- **Anirban Sahoo**
- **Neenv Vaja**
- **Tirth Dangodra**
- **Manan Nagda**
---

## 📄 License

ISC, as declared in the project's `package.json` files.

---

⭐ If you like this project, drop a star on the repo!
