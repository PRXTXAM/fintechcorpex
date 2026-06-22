/**
 * FINTECHCORPEX // Visualizations & Custom Supercar Gauges Engine
 * Sets up Chart.js telemetry lines and draws a physical-feel canvas RPM gauge.
 */

// Global gauge variables for interaction
let revTachometer;

document.addEventListener('DOMContentLoaded', () => {
    initNetWorthChart();
    initRpmTachometer();
});

/* ==========================================================================
   NET WORTH TELEMETRY LINE CHART (CHART.JS)
   ========================================================================== */
function initNetWorthChart() {
    const canvas = document.getElementById('networth-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Create Rosso Corsa gradient fill
    const fillGradient = ctx.createLinearGradient(0, 0, 0, 150);
    fillGradient.addColorStop(0, 'rgba(255, 40, 0, 0.18)');
    fillGradient.addColorStop(1, 'rgba(255, 40, 0, 0.00)');

    // Sample data representing net worth tracking over time (Months)
    const labels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
    const dataValues = [41200000, 42800000, 44100000, 43900000, 46500000, 48291540];

    // Create custom HTML tooltip element if it doesn't exist
    let tooltipEl = document.getElementById('chartjs-tooltip');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'chartjs-tooltip';
        document.body.appendChild(tooltipEl);
    }

    // Chart.js Configuration
    const networthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'NET WORTH',
                data: dataValues,
                borderColor: '#FF2800',
                borderWidth: 2,
                pointBackgroundColor: '#FF2800',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 1.5,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointHoverBorderWidth: 2,
                fill: true,
                backgroundColor: fillGradient,
                tension: 0.35
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 10,
                    bottom: 10,
                    left: 0,
                    right: 10
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.02)',
                        drawTicks: false
                    },
                    ticks: {
                        color: '#95A5A6',
                        font: {
                            family: 'JetBrains Mono',
                            size: 9
                        },
                        padding: 8
                    }
                },
                y: {
                    position: 'right',
                    grid: {
                        color: 'rgba(255, 255, 255, 0.02)',
                        drawTicks: false
                    },
                    ticks: {
                        color: '#95A5A6',
                        font: {
                            family: 'JetBrains Mono',
                            size: 9
                        },
                        padding: 8,
                        callback: function(value) {
                            // Format as Cr (Crores)
                            return '₹' + (value / 10000000).toFixed(1) + ' Cr';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false, // Disable default tooltip
                    external: function(context) {
                        const {chart, tooltip} = context;
                        
                        if (tooltip.opacity === 0) {
                            tooltipEl.style.opacity = 0;
                            return;
                        }

                        // Set Content
                        if (tooltip.body) {
                            const index = tooltip.dataPoints[0].dataIndex;
                            const label = tooltip.dataPoints[0].label;
                            const rawVal = tooltip.dataPoints[0].raw;
                            
                            // Format Currency to INR (e.g. ₹4.83 Crore)
                            const formattedVal = new Intl.NumberFormat('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                                maximumFractionDigits: 0
                            }).format(rawVal);

                            let html = `<div style="font-size: 8px; color: #95A5A6; letter-spacing: 0.1em; margin-bottom: 4px;">TELEMETRY TIMECODE: ${label}</div>`;
                            html += `<div style="font-size: 13px; font-weight: 700; color: #FFFFFF; font-family: 'Orbitron';">${formattedVal}</div>`;
                            
                            // Calculate diff from start
                            if (index > 0) {
                                const prev = dataValues[index - 1];
                                const pctDiff = (((rawVal - prev) / prev) * 100).toFixed(2);
                                const sign = pctDiff >= 0 ? '+' : '';
                                const diffClass = pctDiff >= 0 ? '#00E676' : '#FF3D00';
                                html += `<div style="font-size: 9px; color: ${diffClass}; margin-top: 4px;">DRIFT RATE: ${sign}${pctDiff}%</div>`;
                            } else {
                                html += `<div style="font-size: 9px; color: #95A5A6; margin-top: 4px;">DRIFT RATE: STABLE</div>`;
                            }

                            tooltipEl.innerHTML = html;
                        }

                        // Position Tooltip
                        const position = chart.canvas.getBoundingClientRect();
                        tooltipEl.style.opacity = 1;
                        tooltipEl.style.left = position.left + window.pageXOffset + tooltip.caretX + 'px';
                        tooltipEl.style.top = position.top + window.pageYOffset + tooltip.caretY - 85 + 'px';
                    }
                }
            }
        },
        plugins: [{
            // Custom plugin to add neon glow to the dataset line
            beforeDatasetDraw: function(chart) {
                const ctx = chart.ctx;
                ctx.save();
                ctx.shadowColor = 'rgba(255, 40, 0, 0.45)';
                ctx.shadowBlur = 12;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 2;
            },
            afterDatasetDraw: function(chart) {
                chart.ctx.restore();
            }
        }]
    });
}

/* ==========================================================================
   CUSTOM SUPERCAR RPM TACHOMETER (CANVAS)
   ========================================================================== */
class RpmTachometer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2 + 10;
        this.radius = 95;
        
        // Arc Angles (Classic supercar arc: from 135 deg to 45 deg, counterclockwise/clockwise sweep)
        this.startAngle = 0.75 * Math.PI; // 135 deg
        this.endAngle = 2.25 * Math.PI;   // 405 deg (total 270 deg range)
        
        // Telemetry state
        this.minRpm = 0;
        this.maxRpm = 10000;
        this.redlineRpm = 8000;
        
        // Target and current needle values (for physics-based bounce animations)
        this.targetRpm = 7240; 
        this.currentRpm = 0; // Starts from 0 for tachometer sweep start
        
        // Physics constants
        this.velocity = 0;
        this.stiffness = 0.08;
        this.damping = 0.75;
        
        this.initEvents();
        this.animate();
    }
    
    initEvents() {
        // Hovering over the RPM Gauge triggers a needle rev
        this.canvas.addEventListener('mouseenter', () => {
            this.revEngine(8800 + Math.random() * 800); // Rev near redline
            this.playRevSound();
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.revEngine(7240); // Settle back to active telemetry RPM
        });
        
        this.canvas.addEventListener('click', () => {
            this.revEngine(9800); // Redline bounce!
            this.playRevSound(1.2); // Pitch-shifted
            // Shake the gauge parent card temporarily for aggressive mechanical feedback
            const card = this.canvas.closest('.card');
            if (card) {
                card.style.animation = 'none';
                void card.offsetWidth; // Trigger reflow
                card.style.animation = 'gauge-shake 0.3s cubic-bezier(.36,.07,.19,.97) both';
            }
        });
    }
    
    revEngine(target) {
        this.targetRpm = target;
    }
    
    // Synthesize short racing engine sound using Web Audio API!
    playRevSound(pitch = 1.0) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const audioCtx = new AudioContext();
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sawtooth'; // Raw engine mechanical buzz
            osc.frequency.setValueAtTime(80 * pitch, audioCtx.currentTime);
            // Throttle sweep: rev engine up quickly then down
            osc.frequency.exponentialRampToValueAtTime(320 * pitch, audioCtx.currentTime + 0.12);
            osc.frequency.exponentialRampToValueAtTime(70 * pitch, audioCtx.currentTime + 0.35);
            
            // Add a lowpass filter to make it sound beefier (muffled exhaust)
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 500;
            
            gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.38);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.4);
        } catch (e) {
            // Audio context blocked or not supported
        }
    }
    
    animate() {
        // Needle Spring Physics
        const force = (this.targetRpm - this.currentRpm) * this.stiffness;
        this.velocity += force;
        this.velocity *= this.damping;
        this.currentRpm += this.velocity;
        
        // Prevent out of bounds
        if (this.currentRpm < 0) this.currentRpm = 0;
        if (this.currentRpm > 10500) this.currentRpm = 10500;
        
        // Update Digital Text readouts in DOM
        const digitalRpm = document.getElementById('digital-rpm-val');
        if (digitalRpm) {
            digitalRpm.innerText = Math.round(this.currentRpm).toLocaleString() + ' RPM';
            // Toggle blinking warnings when in redline
            if (this.currentRpm >= this.redlineRpm) {
                digitalRpm.style.color = '#FF3D00';
                digitalRpm.classList.add('warning-blink');
            } else {
                digitalRpm.style.color = '#FF2800';
                digitalRpm.classList.remove('warning-blink');
            }
        }
        
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
    
    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 1. Draw Outer Tachometer Ring Arc
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, this.startAngle, this.endAngle);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 6;
        ctx.stroke();
        
        // 2. Draw Rosso Corsa Redline Band (8k to 10k RPM)
        const redlineStartAngle = this.startAngle + (270 * (this.redlineRpm / this.maxRpm)) * Math.PI / 180;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, redlineStartAngle, this.endAngle);
        ctx.strokeStyle = '#FF2800';
        ctx.lineWidth = 6;
        ctx.stroke();
        
        // 3. Draw Minor / Major Tick Ticks
        const totalTicks = 50; // 50 subdivision notches
        for (let i = 0; i <= totalTicks; i++) {
            const tickRpm = (i / totalTicks) * this.maxRpm;
            const angle = this.startAngle + (i / totalTicks) * 1.5 * Math.PI; // angle mapping
            
            const isMajor = i % 5 === 0;
            const tickLength = isMajor ? 12 : 6;
            const innerRadius = this.radius - tickLength;
            
            const startX = this.centerX + Math.cos(angle) * this.radius;
            const startY = this.centerY + Math.sin(angle) * this.radius;
            const endX = this.centerX + Math.cos(angle) * innerRadius;
            const endY = this.centerY + Math.sin(angle) * innerRadius;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            
            // Redline styling
            if (tickRpm >= this.redlineRpm) {
                ctx.strokeStyle = '#FF2800';
                ctx.lineWidth = isMajor ? 2.5 : 1.2;
            } else {
                ctx.strokeStyle = isMajor ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = isMajor ? 2.0 : 1.0;
            }
            ctx.stroke();
            
            // Draw RPM labels (0, 1, 2... 10) on major notches
            if (isMajor) {
                const textVal = i / 5;
                const textRadius = this.radius - 24;
                const textX = this.centerX + Math.cos(angle) * textRadius;
                const textY = this.centerY + Math.sin(angle) * textRadius + 4; // slight vertical adjustments
                
                ctx.font = '700 10px Orbitron';
                ctx.fillStyle = tickRpm >= this.redlineRpm ? '#FF2800' : '#FFFFFF';
                ctx.textAlign = 'center';
                ctx.fillText(textVal.toString(), textX, textY);
            }
        }
        
        // 4. Draw Glow behind active rev band
        const activeEndAngle = this.startAngle + (270 * (this.currentRpm / this.maxRpm)) * Math.PI / 180;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius - 3, this.startAngle, activeEndAngle);
        ctx.strokeStyle = this.currentRpm >= this.redlineRpm ? 'rgba(255, 61, 0, 0.08)' : 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 6;
        ctx.stroke();
        
        // 5. Draw Tapered Speedometer Needle (Physics Based Pointer)
        const needleAngle = this.startAngle + (1.5 * Math.PI) * (this.currentRpm / this.maxRpm);
        const needleLength = this.radius - 8;
        
        // Shadow/glow on needle
        ctx.save();
        ctx.shadowColor = '#FF2800';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.moveTo(this.centerX, this.centerY);
        
        // Calculate perpendicular offsets for tapered thickness
        const thickWidth = 3;
        const perpX = Math.cos(needleAngle + Math.PI / 2) * thickWidth;
        const perpY = Math.sin(needleAngle + Math.PI / 2) * thickWidth;
        
        ctx.moveTo(this.centerX - perpX, this.centerY - perpY);
        ctx.lineTo(this.centerX + perpX, this.centerY + perpY);
        
        // Point coordinates
        const tipX = this.centerX + Math.cos(needleAngle) * needleLength;
        const tipY = this.centerY + Math.sin(needleAngle) * needleLength;
        
        ctx.lineTo(tipX, tipY);
        ctx.closePath();
        ctx.fillStyle = '#FF2800';
        ctx.fill();
        ctx.restore();
        
        // 6. Draw Center Pivot Cap (Steering console metallic center)
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#111317';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Tiny center screw dot
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FF2800';
        ctx.fill();
    }
}

// Global shake keyframe stylesheet integration for tachometer clicks
const styleEl = document.createElement('style');
styleEl.innerHTML = `
@keyframes gauge-shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
  40%, 60% { transform: translate3d(3px, 0, 0); }
}
`;
document.head.appendChild(styleEl);

function initRpmTachometer() {
    revTachometer = new RpmTachometer('rpm-gauge');
}
