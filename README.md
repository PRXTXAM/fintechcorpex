# FintechCorpEx // Secure Telemetry & Financial Operations HUD

FintechCorpEx combines a modern dark telemetry aesthetic with the data requirements of Indian personal finance (NSE/BSE index telemetry, mutual funds tracking, UPI expense ledger monitoring, and Tax/ITR stopwatch timers).

![Aesthetic Dashboard HUD](https://img.shields.io/badge/AESTHETIC-TELEMETRY%20HUD-FF2800?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/TECH-HTML5%20%7C%20CSS3%20%7C%20VANILLA%20JS-blue?style=for-the-badge)
[![Live Site](https://img.shields.io/badge/LIVE-DEPLOYMENT-00E676?style=for-the-badge)](https://fintechcorpex.onrender.com)

---

## 🖥️ The Telemetry Design System

To escape standard corporate blue themes, the UI employs a high-contrast, dark-mode telemetry layout:
- **Carbon/Obsidian Base**: The background color is a deep Obsidian `#0B0C10` layered with a high-definition diagonal gradient pattern representing a woven carbon fiber mesh.
- **Brushed Titanium Cards**: Card chassis are built with `#1F2833` utilizing glassmorphism blur overlays (`backdrop-filter: blur(8.0px)`) and razor-thin borders.
- **Crimson Accents**: Glowing crimson red (`#FF2800`) is used strictly for active states, dashboard borders, limit markers, and critical alerts.
- **Metric Accents**: Profits, returns, and positive flows display in Neon Green (`#00E676`), while limit overages or losses are rendered in Neon Crimson (`#FF3D00`).
- **Telemetry Typography**: Monospace numbers (`JetBrains Mono`) for financial figures and bold, wide futuristic telemetry headers (`Syncopate`, `Orbitron`).

---

## ⚡ Main Telemetry Modules

1. **Stock Marquee Ticker HUD**: An infinite scrolling marquee bar displaying real-time NIFTY 50, SENSEX, and top stock price updates (Reliance, Tata Motors, HDFC Bank) with color-coded drift rates.
2. **Net Worth Line Telemetry**: A custom neon line chart showcasing portfolio growth with HTML-based cursor HUD tooltips that calculate drift rates on hover.
3. **Budget Gauge (Tachometer Style)**: A custom canvas-drawn gauge depicting Monthly Expense flows in a tachometer format. Hovering animates the gauge needle, clicking triggers a needle bounce (8k to 10k scale) and synthesizes interface feedback tones using the **Web Audio API**.
4. **Markets Tab Console**: Interactive tabular navigation widgets showing holdings and gains for **Stocks**, **Mutual Funds**, and **Fixed Income** assets.
5. **Tax Lap Timer & Sectors**: Countdowns until advance tax installments styled like a lap stopwatch timer. Sectors highlight active filing quarters (S1, S2, S3, S4).
6. **UPI Expense Stream Ledger**: Displays active transaction history. Users can click **INJECT UPI TX** to inject random expenses. These slide down smoothly from the top, update the daily flow capacity gauge, and adjust scale indicators.
7. **🌌 Zero-G Antigravity Drive (Easter Egg)**:
   - Triggered by typing `"antigravity"`, pressing `Ctrl + Alt + G`, or clicking **ZERO-G** on the sidebar.
   - Triggers a synthesised gravity collapse pitch-down sound.
   - Decomposes the grids: cards float weightlessly on a 2D physics engine.
   - **Click & Throw**: Users can grab cards to drag and fling them around the screen with friction and viewport bounce.
   - **Restoration**: Pressing `Escape` plays a power-up sweep, returning the cards smoothly back to their slots using custom spring animations.

---

## 📁 Repository Structure

```
fintechcorpex/
│
├── index.html        # App layout container, widgets & dependencies loaders
├── styles.css        # Carbon variables, neon styles, and transition definitions
├── particles.js      # Canvas particle background physics with mouse repulsion
├── charts.js         # Chart.js configuration & Custom canvas RPM tachometer needle loops
├── app.js            # Main controller: tickers, timers, audio synth, and Zero-G engine
└── README.md         # Documentation HUD (This file)
```

---

## 🚀 How to Run Locally

Since the application uses pure HTML5, CSS Variables, and client-side JavaScript, it runs instantly without any build pipelines or node packaging steps.

Simply run a local HTTP server using Python in the project directory:

```bash
python3 -m http.server 8000
```

Then open your browser and navigate to:
```
http://localhost:8000
```

---

## 🛠️ Telemetry Diagnostics & Features Checklist

- [x] High-contrast carbon obsidian chassis theme
- [x] Responsive canvas particle micro-interactions
- [x] Real-time stopwatch and advance tax lap countdown
- [x] Zero-Gravity physics breaker with dragging and spring-damping resets

