# EMPLOYEE360 — MERN Stack Employee Management & Workforce Analytics System

A full-stack, enterprise-grade Employee Management and Workforce Intelligence platform built using MongoDB, Express.js, React, Node.js, TypeScript, Redis, and Docker.

---

## 1. Problem Statement
Organizations require a centralized, high-performance web platform to securely maintain employee records, track shifts and daily attendance, streamline multi-tier leave approval workflows, simulate monthly payroll computations, and deliver organization-wide workforce analytics through interactive visualizations.

**Employee360** eliminates scattered spreadsheets and disparate HR software by centralizing operations into a unified dashboard designed for both HR Executives (Admin) and Employees.

---

## 2. Objectives
- **Centralized Record Keeping**: Complete lifecycle CRUD for employee profiles, job assignments, contact details, and department allocation.
- **Attendance Tracking**: Shift attendance logging, working-hour calculation, and duplication prevention.
- **Leave Workflow**: Transparent leave application, review, approval, and cancellation workflows.
- **Payroll Simulation**: Accurate computation of Net Salary using Base, Allowances, Bonuses, and Deductions.
- **Workforce Intelligence**: Aggregation pipelines and interactive charts analyzing headcount by department, employment type, salary distribution, and hiring trends.
- **High-Performance Caching**: Redis caching for dashboard statistics and analytics with automatic cache invalidation on data modifications.
- **Role-Based Security**: Strict access boundary separating Admin operations from Employee self-service.

---

## 3. Technology Stack & Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    React + TypeScript UI                     │
│        (Vite, React Router v6, TailwindCSS, Recharts)        │
└──────────────────────────────┬───────────────────────────────┘
                               │ REST API (JSON / Bearer JWT)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                 Node.js + Express.js + TS                    │
│      (Auth & Role Middleware, Centralized Error Handler)     │
├──────────────────────────────┬───────────────────────────────┤
│    Controllers & Services    │        Redis Client           │
│  (Aggregations, Validation)  │  (Stats Caching & TTL Inval)  │
└──────────────┬───────────────┴───────────────▲───────────────┘
               │ Mongoose ODM                  │
               ▼                               │
┌──────────────────────────────┐ ┌─────────────┴───────────────┐
│        MongoDB 7.0           │ │          Redis 7            │
│  (Users, Employees, Depts,   │ │ (Dashboard Stats, Analytics │
│   Attendance, Leaves, Pay)   │ │  Cache with 60s TTL)        │
└──────────────────────────────┘ └─────────────────────────────┘
```

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS | Single Page Application (SPA), Responsive UI |
| **Data Viz** | Recharts, Lucide React | KPI cards, Bar Charts, Pie/Donut Charts, Trend lines |
| **Backend** | Node.js, Express.js, TypeScript | RESTful API service, Auth middleware, Error handling |
| **Database** | MongoDB 7.0, Mongoose ODM | Primary persistent document store with schema validation |
| **Caching** | Redis 7.2 (with in-memory fallback) | Sub-millisecond caching of dashboard and analytics queries |
| **Security** | JWT (JSON Web Tokens), bcryptjs | Stateless authentication & cryptographic password hashing |
| **DevOps** | Docker, Docker Compose, Nginx | Multi-container orchestration & production deployment |

---

## 4. User Roles & Authorization

### 1. Admin / HR
- View executive dashboard KPIs & aggregate charts.
- Full CRUD operations over Employees and Departments.
- View organization-wide shift attendance records.
- Approve or reject employee leave applications.
- Generate and record monthly employee payroll summaries.
- Access workforce analytics hub (department budgets, hiring trends, attendance distributions).

### 2. Employee (Self-Service)
- View personal employment profile, job title, and assigned department.
- Clock in/out daily shift attendance.
- Submit leave applications, review application statuses, or cancel pending requests.
- Review personal compensation history and payslip breakdowns.

---

## 5. Demo Credentials

The seed data provides two accounts configured with bcrypt hashed passwords:

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Admin / HR** | `admin@employee360.com` | `Admin@123` | Full access across all modules |
| **Employee** | `employee@employee360.com` | `Employee@123` | Self-service access (Profile, Attendance, Leaves, Pay) |

---

## 6. Project Structure

```
Employee360/
├── backend/
│   ├── src/
│   │   ├── config/             # Environment, Database, and Redis Cache service
│   │   ├── controllers/        # Request handlers (Auth, Employees, Leaves, etc.)
│   │   ├── database/           # Realistic seed script (Users, Employees, Depts, etc.)
│   │   ├── middleware/         # JWT verification, Role authorization, Error handler
│   │   ├── models/             # Mongoose schemas (User, Employee, Attendance, etc.)
│   │   ├── routes/             # REST API endpoint definitions
│   │   ├── utils/              # Standard JSON response formatters
│   │   ├── app.ts              # Express application assembly
│   │   └── server.ts           # Server bootstrap and database connection
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Modal, StatCard, ProtectedRoute
│   │   ├── context/            # AuthContext (JWT management & session state)
│   │   ├── layouts/            # DashboardLayout (Sidebar, Navbar, breadcrumbs)
│   │   ├── pages/              # Login, Dashboard, Employees, Attendance, etc.
│   │   ├── services/           # Axios client with Authorization interceptors
│   │   ├── types/              # TypeScript interfaces for API models
│   │   ├── App.tsx             # React Router route tree
│   │   ├── index.css           # Tailwind base styles
│   │   └── main.tsx            # React DOM entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── docker-compose.yml          # 4-tier stack (MongoDB, Redis, Backend, Frontend)
├── .env.example                # Sample environment variables
└── README.md                   # System documentation & Viva guide
```

---

## 7. MongoDB Data Models

1. **User (`User`)**:
   - `email` (string, unique, indexed)
   - `passwordHash` (string, bcrypt hashed)
   - `role` (`'ADMIN'` | `'EMPLOYEE'`)
   - `employeeId` (ObjectId ref `'Employee'`)
2. **Employee (`Employee`)**:
   - `employeeCode` (unique, e.g. `'EMP-1001'`)
   - `firstName`, `lastName`, `email`, `phone`, `gender`
   - `department` (ObjectId ref `'Department'`)
   - `jobTitle`, `employmentType` (`'Full Time'` | `'Part Time'` | `'Contract'` | `'Intern'`)
   - `joiningDate`, `salary` (min: 0), `status` (`'Active'` | `'Inactive'` | `'On Leave'`)
3. **Department (`Department`)**:
   - `name`, `code` (unique, e.g. `'IT'`, `'HR'`, `'FIN'`), `description`
4. **Attendance (`Attendance`)**:
   - `employee` (ObjectId ref `'Employee'`)
   - `attendanceDate` (Date), `checkIn`, `checkOut`, `status`, `workingHours`
   - Compound index: `{ employee: 1, attendanceDate: 1 }` (Enforces no duplicate daily entries)
5. **Leave (`Leave`)**:
   - `employee` (ObjectId ref `'Employee'`), `leaveType`, `startDate`, `endDate`, `numberOfDays`, `reason`, `status` (`'Pending'` | `'Approved'` | `'Rejected'` | `'Cancelled'`)
6. **Payroll (`Payroll`)**:
   - `employee` (ObjectId ref `'Employee'`), `month`, `year`
   - `basicSalary`, `allowances`, `deductions`, `bonus`, `netSalary`
   - Formula: $\text{Net Salary} = \text{Basic} + \text{Allowances} + \text{Bonus} - \text{Deductions}$

---

## 8. REST API Documentation

### Authentication
- `POST /api/auth/login`: Authenticate email and password. Returns JWT token and user details.
- `POST /api/auth/logout`: Clears session token.
- `GET /api/auth/me`: Returns current authenticated user and linked employee record.

### Employees
- `GET /api/employees`: Search, filter by department/status, and paginate staff records.
- `GET /api/employees/:id`: Retrieve single employee record.
- `POST /api/employees`: Register new employee (Admin only).
- `PUT /api/employees/:id`: Update employee details (Admin only).
- `DELETE /api/employees/:id`: Delete employee record (Admin only).

### Departments
- `GET /api/departments`: List all departments with computed live employee count.
- `POST /api/departments`: Create department with unique code (Admin only).
- `PUT /api/departments/:id`: Update department details (Admin only).
- `DELETE /api/departments/:id`: Delete department (Admin only; blocked if staff assigned).

### Attendance
- `GET /api/attendance`: Filter attendance logs by employee, department, date, or month.
- `POST /api/attendance`: Clock in shift attendance (Auto-calculates hours; duplicate prevention).
- `PUT /api/attendance/:id`: Modify shift record (Admin only).

### Leaves
- `GET /api/leaves`: Retrieve leaves (Employees see own; Admins see all).
- `POST /api/leaves`: Submit new leave application (Validates date ranges).
- `PUT /api/leaves/:id/status`: Approve or reject leave application (Admin only).
- `PUT /api/leaves/:id/cancel`: Cancel own pending leave application (Employee only).

### Payroll
- `GET /api/payroll`: Retrieve monthly compensation history.
- `POST /api/payroll`: Record monthly payslip (Computes Net Salary; Admin only).
- `PUT /api/payroll/:id`: Update payroll record (Admin only).

### Dashboard & Analytics
- `GET /api/dashboard/stats`: Returns KPI cards and summary distributions (Redis cached, 60s TTL).
- `GET /api/analytics/employees`: Headcount breakdown by department, job title, and gender.
- `GET /api/analytics/attendance`: Monthly shift trends and organization attendance percentage.
- `GET /api/analytics/leaves`: Breakdown of leaves by status, category, and monthly trend.
- `GET /api/analytics/payroll`: Department-wise salary expenditure and payroll trends.
- `GET /api/analytics/hiring`: Historical recruitment timeline by month.

### System Health
- `GET /api/health`: Live health status of Node process, MongoDB connection, and Redis cache.

---

## 9. Redis Implementation & Caching Flow

```
Client Request -> Express Server
                      │
           Does Redis have key?
             /              \
           YES               NO
           /                  \
  Return Cached Data      Query MongoDB Aggregation
  (sub-millisecond)       Write to Redis with TTL
                               │
                          Return Data
```

- **Cache Keys**: `cache:dashboard:stats` (TTL: 60s), `cache:analytics:*` (TTL: 120s).
- **Graceful Fallback**: If Redis is temporarily unavailable, the custom cache wrapper seamlessly serves data via an active in-memory store so the app never crashes.
- **Cache Invalidation**: Data mutation endpoints (e.g. creating/updating employees, attendance, leaves, or payroll) automatically call `cacheService.invalidateByPattern('cache:*')` to guarantee real-time freshness.

---

## 10. Running Instructions

### Option A: Running with Docker Compose (Recommended)

1. Make sure Docker Desktop is started.
2. From the root `Employee360` directory, execute:
   ```bash
   docker compose up --build
   ```
3. Docker Compose builds and launches:
   - **Frontend**: `http://localhost:3000` (Nginx serving production React build)
   - **Backend**: `http://localhost:5000` (Node.js API)
   - **MongoDB**: `localhost:27017`
   - **Redis**: `localhost:6379`
4. In a separate terminal, seed the database with demo data:
   ```bash
   docker compose exec backend npm run seed
   ```

### Option B: Running Locally (Node.js)

1. **Prerequisites**: Node.js v18+, MongoDB running locally on port `27017` (or MongoDB Atlas URL in `.env`), and optional Redis on port `6379`.
2. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm run seed      # Seeds 20 employees, 70+ attendance logs, leaves, payroll & demo users
   npm run dev       # Starts Express API at http://localhost:5000
   ```
3. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev       # Starts Vite dev server at http://localhost:3000
   ```
4. Access the web dashboard at `http://localhost:3000` and log in with the demo credentials.

---

## 11. Viva Examination Preparation Guide

### React (10 Questions)
1. **What is React and how does the Virtual DOM work?**
   React is a declarative JavaScript library for building component-based UIs. The Virtual DOM is an in-memory lightweight representation of the real DOM. When component state changes, React creates a new Virtual DOM tree, diffs it against the previous one (reconciliation), and updates only the necessary real DOM nodes for peak rendering efficiency.
2. **What are React Hooks? Why were they introduced?**
   Hooks (`useState`, `useEffect`, `useContext`) are functions that allow functional components to use state, lifecycle events, and context without writing class components.
3. **What is the purpose of `useEffect`?**
   `useEffect` manages side effects in functional components such as data fetching, subscriptions, and DOM updates. Its dependency array controls when the effect re-runs.
4. **How does state management work in this project?**
   Global authentication state (`user`, `token`, `isAdmin`) is managed using React's `createContext` and custom `useAuth` hook. Local component state is handled via `useState`.
5. **What are controlled components in React?**
   Controlled components are form inputs where the displayed value is bound to React state and modified via `onChange` event handlers, ensuring React is the single source of truth.
6. **What is React Router and how are protected routes implemented?**
   React Router v6 provides client-side routing. Protected routes wrap layout components with a guard (`ProtectedRoute.tsx`) that checks if the JWT and role exist; unauthenticated visitors are redirected to `/login`.
7. **What is component re-rendering and what causes it?**
   Re-rendering occurs when a component's state or props change, or when its parent component re-renders.
8. **Why are `keys` important when rendering lists in React?**
   `key` props provide stable identity for elements in an array, allowing React's diffing algorithm to detect which items changed, were added, or were removed.
9. **How is responsiveness implemented in Employee360?**
   Using Tailwind CSS responsive prefixes (`sm:`, `md:`, `lg:`) along with a mobile hamburger drawer that toggles on smaller viewports.
10. **What is SPA (Single Page Application)?**
    An application where the browser loads a single HTML file and dynamically rewrites page content via client-side routing without triggering full page reloads.

### TypeScript (10 Questions)
1. **What is TypeScript and how does it differ from JavaScript?**
   TypeScript is a statically typed superset of JavaScript that compiles down to plain JavaScript. It catches type errors at compile time rather than runtime.
2. **What is the difference between `interface` and `type`?**
   Both define object shapes, but `interface` supports declaration merging and is idiomatic for OOP models, whereas `type` can also express unions, primitives, and tuples.
3. **What are Generics in TypeScript?**
   Generics allow writing flexible, reusable code that works over different types while maintaining type safety (e.g. `sendSuccess<T>(res, data: T)`).
4. **What does the `tsconfig.json` file do?**
   It specifies the root files and compiler options required to compile TypeScript project code (target ECMAScript version, module system, strict checking, output directory).
5. **What is strict mode in TypeScript?**
   Enabling `"strict": true` activates comprehensive checks including `noImplicitAny`, `strictNullChecks`, and `strictFunctionTypes`.
6. **What is type inference in TypeScript?**
   TypeScript automatically deduces the type of a variable based on the initial value assigned without requiring explicit type annotations.
7. **What are Union and Intersection types?**
   Union (`A | B`) allows a variable to be one of multiple types (e.g. `'Admin' | 'Employee'`). Intersection (`A & B`) combines properties of multiple types into one.
8. **What is the `any` type and why should it be avoided?**
   `any` disables all type checking for that value, eliminating the safety benefits of TypeScript.
9. **How are Mongoose Document types represented in TypeScript?**
   By creating an interface extending `mongoose.Document` (e.g., `interface IEmployee extends Document`) and passing it to `model<IEmployee>('Employee', schema)`.
10. **How does TypeScript benefit a full-stack project?**
    It prevents missing property errors, typos in API payloads, incorrect data types in database queries, and provides rich IDE autocomplete.

### Node.js (10 Questions)
1. **What is Node.js?**
   Node.js is an open-source, cross-platform JavaScript runtime environment built on Google Chrome's V8 engine that executes JavaScript outside the browser.
2. **Explain the Node.js Event Loop.**
   Node.js uses a single-threaded event loop to handle concurrent operations asynchronously by delegating I/O operations to the OS kernel or libuv worker threads.
3. **What is `package.json`?**
   A manifest file containing project metadata, script commands, and direct dependencies required by npm.
4. **What is the difference between `dependencies` and `devDependencies`?**
   `dependencies` are required to run the application in production (e.g. `express`, `mongoose`), while `devDependencies` are only needed during development/build (e.g. `@types/node`, `typescript`).
5. **How does Node.js handle asynchronous operations?**
   Using Callbacks, Promises, and `async/await` syntax.
6. **What is `process.env` in Node.js?**
   A global object that stores the system environment variables and configuration secrets loaded via `dotenv`.
7. **What is the purpose of npm?**
   Node Package Manager (npm) hosts, installs, and manages third-party software packages and command-line tools for Node projects.
8. **What are streams in Node.js?**
   Streams are objects that facilitate reading or writing continuous data piece-by-piece rather than loading the entire file into memory at once.
9. **What is the difference between CommonJS and ES Modules?**
   CommonJS uses `require()` and `module.exports` synchronously; ES Modules use `import` and `export` statements asynchronously.
10. **How does Node.js achieve non-blocking I/O?**
    By utilizing the `libuv` C library, which offloads disk and network system calls to background worker pools and invokes callback handlers when results are ready.

### Express.js (10 Questions)
1. **What is Express.js?**
   Express is a lightweight, flexible web application framework for Node.js providing robust features for building REST APIs.
2. **What is Middleware in Express?**
   Middleware functions have access to the request (`req`), response (`res`), and `next` function in the application's request-response lifecycle.
3. **What does `next()` do in Express middleware?**
   It passes control to the next middleware or route handler in the pipeline.
4. **How is centralized error handling implemented in Express?**
   By defining a 4-argument error-handling middleware `(err, req, res, next)` at the bottom of the middleware chain in `app.ts`.
5. **What is `express.json()`?**
   A built-in middleware that parses incoming JSON request bodies into `req.body`.
6. **What is the purpose of `helmet` and `cors`?**
   `helmet` sets secure HTTP response headers to protect against common web vulnerabilities (XSS, clickjacking). `cors` enables or restricts Cross-Origin Resource Sharing.
7. **What is `morgan` in Express?**
   An HTTP request logger middleware for Node.js used to log incoming requests, status codes, and latency in the console.
8. **How are route parameters retrieved in Express?**
   Using `req.params` (e.g., `req.params.id` in `/api/employees/:id`).
9. **How are query parameters retrieved?**
   Using `req.query` (e.g., `req.query.search` in `/api/employees?search=alex`).
10. **What is a RESTful API?**
    An architectural style that uses HTTP methods (GET, POST, PUT, DELETE) to perform standard stateless CRUD operations on resources identified by URIs.

### MongoDB & Mongoose (10 Questions)
1. **What is MongoDB and how does it differ from relational databases?**
   MongoDB is a document-oriented NoSQL database that stores data in flexible BSON (Binary JSON) documents with dynamic schemas, unlike rigid tables and rows in SQL.
2. **What is Mongoose?**
   Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js that manages schema validation, relationships, hooks, and type casting.
3. **What is a MongoDB Aggregation Pipeline?**
   A framework for data aggregation where documents pass through a multi-stage pipeline (e.g., `$match`, `$group`, `$sort`, `$lookup`) to compute computed analytics.
4. **How is a unique constraint enforced in Mongoose?**
   By specifying `{ unique: true }` in the schema field or compound index definition.
5. **What is the compound index used in the Attendance model?**
   `{ employee: 1, attendanceDate: 1 }` with `{ unique: true }`, which prevents recording duplicate attendance entries for an employee on the same date.
6. **What does `populate()` do in Mongoose?**
   It replaces a referenced ObjectId with the actual document data from another collection, functioning like a foreign key join.
7. **What are Mongoose timestamps?**
   Enabling `{ timestamps: true }` automatically creates and maintains `createdAt` and `updatedAt` ISO date fields on each document.
8. **What is an ObjectId in MongoDB?**
   A 12-byte unique identifier composed of a 4-byte timestamp, 5-byte random value, and a 3-byte incrementing counter.
9. **What are MongoDB indexes and why are they used?**
   Indexes are special data structures (B-trees) that store small portions of the collection's data to rapidly execute search queries without scanning every document.
10. **How does Mongoose handle validation errors?**
    When a document fails schema validation constraints (e.g., missing required field, negative salary), Mongoose throws a `ValidationError` intercepted by our central error handler.

### Redis (5 Questions)
1. **What is Redis?**
   Redis (Remote Dictionary Server) is an open-source, in-memory key-value data structure store used as a database, cache, and message broker.
2. **Why is Redis used in Employee360?**
   To cache computation-heavy dashboard statistics and analytics queries, reducing database load and delivering instant sub-millisecond responses.
3. **What is TTL (Time-To-Live) in Redis?**
   TTL is the expiration duration set on a key (e.g. 60 seconds) after which Redis automatically deletes the cached key.
4. **What is cache invalidation and how is it implemented?**
   Cache invalidation purges stale cache data whenever source data is created or updated. When employees or attendance records are modified, `cacheService.invalidateByPattern('cache:*')` clears the stale metrics.
5. **What happens if Redis goes down in this architecture?**
   The application features a graceful fallback wrapper: it logs a warning, transparently serves requests using an internal in-memory store, and queries MongoDB directly without crashing.

### REST APIs (5 Questions)
1. **What are the primary HTTP verbs used in REST?**
   - `GET`: Retrieve resource data.
   - `POST`: Create a new resource.
   - `PUT`: Replace or update an existing resource.
   - `DELETE`: Remove a resource.
2. **What are standard HTTP response status codes?**
   - `200 OK`: Request succeeded.
   - `201 Created`: Resource successfully created.
   - `400 Bad Request`: Client validation error.
   - `401 Unauthorized`: Authentication required or invalid.
   - `403 Forbidden`: Authenticated user lacks permission.
   - `404 Not Found`: Resource does not exist.
   - `500 Internal Server Error`: Unhandled server exception.
3. **What is JWT and how does it work?**
   A JSON Web Token consists of three parts: Header, Payload, and Signature (`header.payload.signature`). The server signs the payload using a secret key, and the client sends it in the `Authorization: Bearer <token>` header on subsequent requests.
4. **Why is password hashing with bcrypt important?**
   Bcrypt applies cryptographic salting and hashing, ensuring that even if database records are compromised, plain-text user passwords cannot be recovered.
5. **What is idempotent API behavior?**
   An HTTP method is idempotent if executing it multiple times produces the identical result as executing it once (e.g. `GET`, `PUT`, `DELETE`). `POST` is non-idempotent.

### Docker & DevOps (5 Questions)
1. **What is Docker?**
   Docker is an open platform that packages software applications and all their dependencies into standardized units called containers.
2. **What is the difference between a Docker Image and a Docker Container?**
   An image is a read-only blueprint containing code, libraries, and runtime; a container is a live, running instance of an image.
3. **What is Docker Compose?**
   A tool for defining and running multi-container Docker applications using a declarative `docker-compose.yml` file.
4. **What is a multi-stage Docker build?**
   A Dockerfile technique that uses separate build stages (e.g. build TypeScript assets in Node stage, copy final build into a slim production Alpine image) to minimize image size and improve security.
5. **Why do we use persistent volumes in Docker?**
   Containers are ephemeral (data is lost on container destruction). Named volumes (`mongo-data`, `redis-data`) persist database storage on the host machine across restarts.

### Git & GitHub (5 Questions)
1. **What is Git?**
   A distributed version control system that tracks source code revisions across multiple developers.
2. **What is the purpose of `.gitignore`?**
   It lists file names and folder patterns that Git should not track or commit (e.g., `node_modules`, `.env`, build artifacts).
3. **What is the difference between `git pull` and `git fetch`?**
   `git fetch` downloads remote changes without modifying your local working branch; `git pull` fetches remote changes and automatically merges them into your active branch.
4. **What is a Git commit?**
   A recorded snapshot of staged repository changes accompanied by an author timestamp and descriptive commit message.
5. **What is a merge conflict and how is it resolved?**
   A conflict occurs when two branches modify the same line in a file. Git pauses the merge and marks the conflict boundaries (`<<<<<<<`, `=======`, `>>>>>>>`), requiring the developer to manually select the correct code and commit the resolution.

### Employee360 Architecture (10 Questions)
1. **What problem does Employee360 solve?**
   It unifies employee directories, attendance clocking, leave management, payroll simulation, and workforce analytics into a single role-based web dashboard.
2. **How does the frontend communicate with the backend?**
   The React frontend uses an Axios client configured with request interceptors that attach the JWT bearer token to every request sent to the Express API.
3. **How is Net Salary computed in Employee360?**
   $\text{Net Salary} = \text{Basic Salary} + \text{Allowances} + \text{Bonus} - \text{Deductions}$.
4. **How are duplicate attendance entries prevented?**
   Through a compound unique index on `{ employee: 1, attendanceDate: 1 }` at the Mongoose level, alongside pre-save validation in the attendance controller.
5. **How does the leave approval workflow operate?**
   Employees submit leave applications with start/end dates and reasons (marked `Pending`). Admins can approve or reject them. Employees can cancel their own pending requests.
6. **How does the system ensure non-admin users cannot access admin features?**
   Two-tier security: on the backend, `requireRole('ADMIN')` middleware blocks unauthorized endpoints; on the frontend, `ProtectedRoute` with `adminOnly` redirects unauthorized roles away from restricted views.
7. **What dashboard KPIs are computed via MongoDB aggregations?**
   Total workforce, active headcounts, present/absent today counts, on-leave employees, pending approvals, and monthly payroll expenditure.
8. **What charts are rendered on the Analytics page?**
   Department payroll bar charts, attendance status donut charts, leave type distributions, and monthly talent acquisition growth lines.
9. **How does the seed script prepare the system for demonstration?**
   It clears old collections and populates 6 realistic departments, 20 distinct employees across various employment types, 70+ historical shift records, 15 leave applications, 30+ payroll slips, and 2 default user accounts.
10. **How does Employee360 adhere to clean architectural separation?**
    It enforces clean separation of concerns: Routes define URL mapping, Controllers process incoming requests and responses, Services handle caching and business logic, and Mongoose Models enforce database schemas.
