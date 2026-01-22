# 🛍️ MicroShop Frontend

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TanStack Query](https://img.shields.io/badge/-TanStack%20Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Shadcn/UI](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)

A modern, responsive e-commerce storefront and admin dashboard built with **React**, **TypeScript**, and **Vite**. This project leverages **TanStack Query** for robust server-state management and features a sleek UI designed with **Shadcn UI**.

---

## ✨ Key Features

### ⚡ Performance & State
* **Efficient Data Fetching**: Utilizes **TanStack Query (v5)** for caching, synchronization, and background updates, ensuring the UI is always in sync with the backend.
* **Global State Management**: React Context API handles client-side state for Authentication, Shopping Cart, and Theme preferences.

### 🛒 Customer Experience
* **Product Catalog**: Browse and filter products with an intuitive grid layout.
* **Shopping Cart**: Persistent cart functionality with real-time updates.
* **Wishlist**: Save favorite items for later access.
* **User Profiles**: Manage account details and view order history.

### 📊 Admin Dashboard
* **Visual Analytics**: Interactive charts and metric cards powered by **Recharts** to track sales and performance.
* **Inventory Control**: Full CRUD operations for product management.
* **Order Supervision**: Detailed table views for monitoring customer orders.

---

## 🛠️ Tech Stack

* **Core**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Server State / Fetching**: [TanStack Query](https://tanstack.com/query/latest) (@tanstack/react-query)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **UI Components**: [Shadcn UI](https://ui.shadcn.com/) + Radix UI Primitives
* **Client State**: React Context (Auth, Cart, Theme)
* **Forms & Validation**: React Hook Form + Zod
* **Visualization**: Recharts
* **Icons**: Lucide React

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
* Node.js (v18 or higher)
* npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/rahul-raj1709/microshop-frontend.git](https://github.com/rahul-raj1709/microshop-frontend.git)
    cd microshop-frontend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:8080` (or the port specified in your console).

---

## 📂 Project Structure

```text
src/
├── components/
│   ├── dashboard/   # Analytics charts and metric cards
│   ├── layout/      # Customer and Admin layouts
│   └── ui/          # Reusable Shadcn UI components
├── context/         # Global client state (Auth, Cart)
├── hooks/           # Custom hooks (e.g., use-toast)
├── pages/           # Application views (Products, Dashboard, etc.)
└── lib/             # Utilities and helper functions
