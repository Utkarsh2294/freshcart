# 🛒 Freshcart — Next-Gen Quick Commerce Platform

![Freshcart Banner](https://img.shields.io/badge/Status-Active-success.svg) ![React](https://img.shields.io/badge/React-18-blue.svg) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg) ![Express](https://img.shields.io/badge/Express.js-Backend-black.svg)

Freshcart is a state-of-the-art full-stack grocery e-commerce platform built to demonstrate the future of quick-commerce. Combining traditional grocery delivery mechanics with advanced **AI-driven contextual recommendations**, **Voice-to-Cart**, and a **Cook-with-AI Assistant**, Freshcart delivers a seamless, hyper-personalized shopping experience.

---

## ✨ Key Features

### 🧠 Advanced AI & Personalization
* **Pramarsha 2.0 (Contextual Recommendation Engine):** An intelligent feed that surfaces products dynamically based on real-time signals: *Time of day*, *Live Weather*, *Purchase Cadence*, *User Streaks*, and *Local Festivals*.
* **Cook-with-AI (Recipe-to-Cart):** Generate recipes natively (powered by Kimi K3) for any dish, scale by serving size, and instantly match required ingredients to available catalog stock using exact, oversized, and closest-match algorithms.
* **Smart Pantry:** Automatically detects ingredients the user likely already has at home, preventing over-purchasing and saving money.
* **Typo-Tolerant Search:** Lightning-fast full-text search built on PostgreSQL `pg_trgm` and `tsvector` — ensures searches like "bananna" return "Banana" flawlessly.

### 🎙️ Next-Gen Interactions
* **Voice Quick-Add Commerce:** Tap the mic and say *"add two packets of milk and a loaf of bread"*. The NLP engine parses quantities, units, and products to instantly build your cart.
* **Hands-Free Cooking Mode:** Step-by-step recipe execution with screen wake-lock, large typography, and text-to-speech for messy kitchens.
* **Progressive Web App (PWA):** Fully installable on iOS and Android with background service workers and Web Push Notifications for live order updates.

### 🛍️ Core Quick-Commerce Engine
* **Atomic Wallet & Checkout:** High-precision integer-paise math handles wallet cashback limits and order totals simultaneously.
* **Geospatial Dark Store Routing:** Automatically assigns the nearest micro-fulfillment center (Dark Store) using Haversine distance formulas based on the user's delivery address.
* **Real-Time Rider Tracking:** Live simulated map tracking via Socket.IO and Leaflet.js to track your grocery delivery from store to doorstep.
* **Referral & Cashback System:** Built-in growth loops allowing users to share codes and earn wallet balance seamlessly.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS v4, Zustand |
| **Backend** | Node.js, Express.js (ESM) |
| **Database** | PostgreSQL 16 (Relational, Geospatial, Full-Text Search) |
| **Caching** | Redis 7 |
| **AI Microservices** | Python, FastAPI |
| **Real-time** | Socket.IO, Leaflet (Maps) |
| **Infrastructure** | Docker, Docker Compose, GitHub Actions |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
* Docker & Docker Compose
* Node.js 22+

### 1. Using Docker (Recommended)
The easiest way to get the entire microservice architecture running.

```bash
# Clone the repository
git clone https://github.com/Utkarsh2294/freshcart.git
cd freshcart

# Set up environment variables
cp .env.example .env

# Spin up all containers (DB, Redis, API, AI Services, Frontend)
docker-compose up -d

# Run database migrations and seed catalog data
docker-compose exec backend node /app/scripts/migrate.js
docker-compose exec backend node /app/scripts/seed.js
```
The application will be running at **http://localhost:5173**.

### 2. Manual Development Setup
```bash
npm install

# Start PostgreSQL and Redis via Docker
docker-compose up -d postgres redis

# Run migrations and seed data
npm run migrate
npm run seed

# Start the development servers
npm run dev
```

---

## 🧪 Testing & CI/CD

Freshcart maintains strict code quality and testing standards.
* **CI/CD:** GitHub Actions automatically runs linting, DB migrations, and integration tests on every push to the `main` branch.
* **Unit & Integration Tests:** Powered by `vitest` and `supertest`, covering atomic checkout, wallet math, cart persistence, and auth boundaries.

```bash
# Run the complete test suite locally
npm test
```

## 📦 Database Architecture
The application runs on a robust 14-table relational schema designed for scale:
* `users`, `addresses`, `wallet_transactions`, `referral_codes`
* `categories`, `brands`, `products` (Indexed with TSVECTOR)
* `carts`, `cart_items`, `orders`, `order_items`
* `dark_stores` (Geospatial mapping)
* `recipe_cache`, `product_scores` (AI memory & caching)

---

## 🔐 Demo Accounts
OTP verification is mocked for development. Any valid 10-digit Indian phone number can be used to log in.

| Role | Phone | OTP |
|------|-------|------------|
| Admin | 9999999999 | 123456 |
| Customer | 9876543210 | 123456 |

---

*Private — Freshcart © 2026*
