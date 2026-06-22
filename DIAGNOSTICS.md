# FintechCorpEx Telemetry System Diagnostics

This file documents diagnostic thresholds and specs.
## 💻 Host CPU & Memory Limits

- Nominal load CPU: < 15%
- Memory heap headroom: 256MB allocated for zero-g particle rendering
## 🎨 Canvas Particle Render Engine

- Target FPS: 60 FPS constant
- Max particle count: Dynamic scale capped at 120 nodes
- Repulsion vector buffer: 120px cursor deflection radius
