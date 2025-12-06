# SMART-MAPPER 🤖

**SMART-MAPPER** is a web-based control interface for an AI-powered surveying robot. It enables real-time remote control, video streaming, and ultrasonic mapping visualization through a modern, glassmorphic UI.

## 🌟 Key Features

*   **Modern UI/UX**: Dark mode aesthetic with Neon accents (Blue/Green/Orange) and Glassmorphism effects.
*   **Web Controller**: Joystick and keyboard support (WASD) for robot mobility.
*   **Live Camera Feed**: Real-time video streaming with HUD overlay (Battery, Signal, Status).
*   **Ultrasonic Mapping**: Radar-style visualization of sensor data for obstacle detection.
*   **Responsive Design**: Optimized for desktop and tablet control.

## 🛠 Technology Stack

*   **Frontend**: React, Vite, Mantine UI, Framer Motion
*   **Backend**: Flask (Python)
*   **Communication**: HTTP / WebSocket (Planned)

## 🚀 Getting Started

### Prerequisites

*   Python 3.8+
*   Node.js & npm

### Installation & Run

1.  **Frontend Build** (Compile React to static files)
    ```bash
    cd frontend
    npm install
    npm run build
    cd ..
    ```

2.  **Run Backend Server**
    ```bash
    # Install Python dependencies (if needed)
    # pip install flask

    python3 app.py
    ```

3.  **Access the Dashboard**
    Open your browser and navigate to:
    `http://127.0.0.1:5001`

## 📂 Project Structure

```
project/
├── app.py              # Flask Backend Server
├── templates/          # Served HTML templates (index.html from build)
├── static/             # Static assets
│   └── dist/           # Compiled Frontend Assets (JS/CSS/Images)
└── frontend/           # React Source Code
    ├── src/
    │   ├── pages/      # Route Pages (Landing, Camera, Map)
    │   ├── components/ # Reusable Components (Hero, Sections)
    │   └── theme.js    # Mantine Theme Configuration
    └── vite.config.js  # Vite Build Configuration
```

## 📜 License

© 2025 Network Project | SMART-MAPPER
