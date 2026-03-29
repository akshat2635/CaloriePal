# 🍏 CaloriePal (AI Calorie Counter)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg?logo=vite)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB.svg?logo=python)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC.svg?logo=tailwind-css)

A full-stack web application that leverages AI to help users seamlessly log food entries, track daily caloric intake, and gain personalized insights into their diet and progress.

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Running the Application](#running-the-application)
- [Contributing](#contributing)
- [License](#license)

## 📖 About the Project

Logging calories shouldn't be a chore. **CaloriePal** simplifies dietary tracking by combining an intuitive user interface with AI-powered food logging and insights. Whether you're trying to lose weight, maintain a healthy lifestyle, or track macros, CaloriePal provides dynamic dashboards, weekly progress charts, and smart logging capabilities to keep you on track.

## ✨ Key Features

- **🧠 AI-Powered Insights**: Smart analysis of your daily diet and tailored recommendations.
- **📊 Interactive Dashboard**: Visual progress tracking with concentric activity rings and weekly charts.
- **🍔 Effortless Food Logging**: Quick database search and intelligent entry parsing.
- **🔐 User Authentication**: Secure login and onboarding processes to safeguard user data.
- **🌓 Dark/Light Mode**: Built-in theme toggling for an optimal viewing experience.
- **📱 Responsive Design**: Seamless experience across mobile, tablet, and desktop devices.

## 🛠 Tech Stack

### Frontend

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: React Router
- **State Management**: React Context API

### Backend

- **Language**: [Python](https://python.org/)
- **API Framework**: FastAPI / Flask (configurable via `app/main.py`)
- **Database**: SQLite / PostgreSQL (managed via SQLAlchemy/similar ORM)
- **AI Integration**: Custom AI services (`calorie_service.py`)

## 📂 Project Structure

```text
ai_calorie_counter/
├── backend/
│   ├── app/
│   │   ├── api/          # API Route Controllers
│   │   ├── models/       # Database & Pydantic Schemas
│   │   ├── services/     # Business logic & AI Calorie Services
│   │   ├── auth.py       # Authentication utilities
│   │   ├── config.py     # Environment configuration
│   │   ├── database.py   # Database connection setup
│   │   └── main.py       # Application entry point
│   └── requirements.txt  # Python dependencies
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI components (Dashboard, Modals, etc.)
    │   ├── context/      # Global state (Auth, Theme)
    │   ├── pages/        # Application views (Login, Dashboard, Onboarding)
    │   ├── services/     # API request handlers
    │   ├── App.jsx       # Root component
    │   └── main.jsx      # React entry point
    ├── package.json      # Node.js dependencies
    ├── tailwind.config.js# Tailwind theme configuration
    └── vite.config.js    # Vite bundler config
```

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/en/) (v16+ recommended)
- [Python](https://www.python.org/downloads/) (v3.9+ recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/akshat2635/CaloriePal.git
   cd CaloriePal
   ```

2. **Setup the Backend:**

   ```bash
   cd backend
   # Create a virtual environment
   python -m venv venv

   # Activate the virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Setup the Frontend:**
   ```bash
   cd ../frontend
   # Install NPM packages
   npm install
   ```

## 💻 Running the Application

### 1. Start the Backend Server

Open a new terminal, activate your virtual environment, and run:

```bash
cd backend
python -m app.main
```

### 2. Start the Frontend Development Server

Open another terminal and run:

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173/` (or the port specified by Vite).

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
