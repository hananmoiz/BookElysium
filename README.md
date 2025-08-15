# 📚 BookElysium

**BookElysium** is a modern **Book Recommendation System** built with TypeScript.  
It is designed as a full-stack application with separate **Client**, **Server**, and **Shared** modules,  
leveraging **Vite** for lightning-fast frontend builds, **Tailwind CSS** for styling, and **Drizzle ORM** for a type-safe database layer.

---

## 📂 Project Structure

```plaintext
BookElysium/
├── client/                # Frontend application (React + Vite)
├── server/                # Backend API (Node.js)
├── shared/                # Shared types and utility code
├── .env                   # Environment variables
├── drizzle.config.ts      # Drizzle ORM configuration
├── package.json           # Package and workspace configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── tailwind.config.ts     # Tailwind CSS configuration
````

---

## ✨ Features

- 📖 **Book Recommendation Engine** – Suggests books based on user preferences, ratings, and trends.
- 🛠 **Type-Safe Development** – End-to-end type safety using TypeScript.
- ⚡ **Fast Builds & HMR** – Powered by **Vite** for a smooth dev experience.
- 🎨 **Modern UI** – Styled with **Tailwind CSS**.
- 🗄 **Database Layer** – Built with **Drizzle ORM** for safe queries & migrations.
- 🔄 **Reusable Modules** – Shared code for both frontend & backend.

---

## 🚀 Getting Started

### 1️⃣ Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org) (v16+ recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/) (package manager)
- A database supported by **Drizzle** (e.g., PostgreSQL, SQLite)

---

### 2️⃣ Installation

```bash
# Clone the repository
git clone https://github.com/hananmoiz/BookElysium.git
cd BookElysium

# Install dependencies
npm install
````

---

### 3️⃣ Environment Variables

Create a `.env` file in the **root** of the project:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/bookelysium
# Or SQLite example:
# DATABASE_URL=file:./dev.db
```

---

### 4️⃣ Database Setup

```bash
# Generate migration files
npx drizzle-kit generate:migration

# Run migrations
npx drizzle-kit migrate
```

---

### 5️⃣ Running the App

#### Start the frontend:

```bash
npm run dev --workspace=client
```

Frontend runs at: **[http://localhost:3000](http://localhost:3000)**

#### Start the backend:

```bash
npm run dev --workspace=server
```

Backend runs at: **[http://localhost:4000](http://localhost:4000)**

---

## 📌 Usage

1. Open the app in your browser.
2. Create an account or log in.
3. Rate books or set your preferences.
4. Get tailored book recommendations instantly.

---

## 🛠 Technologies Used

| Technology       | Purpose                                      |
| ---------------- | -------------------------------------------- |
| **TypeScript**   | Type safety across full stack                |
| **Vite**         | Fast frontend build & HMR                    |
| **React**        | Frontend UI framework                        |
| **Tailwind CSS** | Utility-first CSS styling                    |
| **Drizzle ORM**  | Type-safe database interactions & migrations |
| **Node.js**      | Backend runtime environment                  |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch:

   ```bash
   git checkout -b feature/my-feature
   ```
3. Commit your changes:

   ```bash
   git commit -m 'Add some feature'
   ```
4. Push to the branch:

   ```bash
   git push origin feature/my-feature
   ```
5. Open a Pull Request.

---

## 📜 License

This project is open source under the **MIT License** – feel free to use, modify, and share.

---

## 📧 Contact

Created by **[hananmoiz](https://github.com/hananmoiz)** – feel free to reach out for collaboration or feedback.


