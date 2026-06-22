/**
 * FINTECHCORPEX // Telemetry HUD Control Engine
 * Coordinates stock feeds, counters, dynamic logs, and the zero-gravity physics easter egg.
 */

(function () {
    // State management
    let timerInterval = null;
    let stopwatchTime = 0; // in milliseconds
    let upiCapacityUsed = 2840;
    const upiCapacityLimit = 10000;
    
    // Zero-G Physics variables
    let isZeroGravity = false;
    let physicsCards = [];
    let animationFrameId = null;
    let activeDragCard = null;
    let dragOffset = { x: 0, y: 0 };
    let lastMousePos = { x: 0, y: 0 };
    let dragVelocity = { x: 0, y: 0 };
    
    // Secret word tracking
    let typedBuffer = '';
    
    // Core references
    const stockTicker = document.getElementById('stock-ticker');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const btnAddExpense = document.getElementById('btn-add-expense');
    const upiLedger = document.getElementById('upi-ledger');
    const countdownEl = document.getElementById('lap-countdown');
    const hudTimerEl = document.getElementById('hud-timer');
    const navAntigravity = document.getElementById('nav-antigravity');
    const gravityDimmer = document.getElementById('gravity-dimmer');
    const gearBox = document.getElementById('gear-box');
    
    /* ==========================================================================
       STARTUP & INITIALIZATION
       ========================================================================== */
    document.addEventListener('DOMContentLoaded', () => {
        initStockTicker();
        initTabSwitcher();
        startStopwatch();
        startLapCountdown();
        initUpiLedger();
        setupEventListeners();
        lucide.createIcons();
    });

    function setupEventListeners() {
        // Expense injection button
        if (btnAddExpense) {
            btnAddExpense.addEventListener('click', injectUpiTransaction);
        }
        
        // Zero-G Sidebar item
        if (navAntigravity) {
            navAntigravity.addEventListener('click', (e) => {
                e.preventDefault();
                toggleZeroGravity();
            });
        }
        
        // Key shortcut and typed triggers
        document.addEventListener('keydown', handleKeydown);
    }

    /* ==========================================================================
       INFINITE STOCK MARQUEE POPULATION
       ========================================================================== */
    function initStockTicker() {
        if (!stockTicker) return;

        const stocksList = [
            { name: 'NIFTY 50', price: '23,516.20', diff: '+124.50', pct: '+0.53%', up: true },
            { name: 'SENSEX', price: '77,301.14', diff: '+418.15', pct: '+0.54%', up: true },
            { name: 'RELIANCE', price: '2,945.10', diff: '+36.40', pct: '+1.25%', up: true },
            { name: 'TATA MOTORS', price: '982.40', diff: '+35.95', pct: '+3.80%', up: true },
            { name: 'HDFC BANK', price: '1,640.25', diff: '-7.40', pct: '-0.45%', up: false },
            { name: 'INFOSYS', price: '1,532.70', diff: '+18.10', pct: '+1.20%', up: true },
            { name: 'ICICI BANK', price: '1,114.50', diff: '-2.15', pct: '-0.19%', up: false },
            { name: 'TCS', price: '3,842.00', diff: '+5.45', pct: '+0.14%', up: true }
        ];

        // Duplicate array items to create a continuous seamless loop
        const finalFeeds = [...stocksList, ...stocksList, ...stocksList];
        
        let html = '';
        finalFeeds.forEach(stock => {
            const diffClass = stock.up ? 'profit' : 'loss';
            const arrow = stock.up ? '▲' : '▼';
            html += `
                <div class="ticker-item">
                    <span class="ticker-name">${stock.name}</span>
                    <span class="ticker-price">${stock.price}</span>
                    <span class="ticker-diff ${diffClass}">
                        ${arrow} ${stock.pct}
                    </span>
                </div>
            `;
        });
        
        stockTicker.innerHTML = html;
    }

    /* ==========================================================================
       TAB PANEL CONTROLS
       ========================================================================== */
    function initTabSwitcher() {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                
                // Active button class
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Active panel class
                tabPanels.forEach(panel => {
                    if (panel.id === `tab-${targetTab}`) {
                        panel.classList.add('active');
                    } else {
                        panel.classList.remove('active');
                    }
                });
                
                // Rev engine slightly on tab clicks for mechanical audio/visual feedback!
                if (window.revTachometer) {
                    window.revTachometer.revEngine(4500 + Math.random() * 2000);
                    window.revTachometer.playRevSound(0.85);
                }
            });
        });
    }

    /* ==========================================================================
       COUNTERS & STOPWATCH LAP TIMERS
       ========================================================================== */
    function startStopwatch() {
        if (!hudTimerEl) return;
        
        const startTime = Date.now();
        
        function updateStopwatch() {
            const elapsed = Date.now() - startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            const hundredths = Math.floor((elapsed % 1000) / 10);
            
            const mm = minutes.toString().padStart(2, '0');
            const ss = seconds.toString().padStart(2, '0');
            const hh = hundredths.toString().padStart(2, '0');
            
            hudTimerEl.innerText = `${mm}:${ss}.${hh}`;
            requestAnimationFrame(updateStopwatch);
        }
        
        requestAnimationFrame(updateStopwatch);
    }

    function startLapCountdown() {
        if (!countdownEl) return;
        
        // Target date: Advance Tax Quarter 2 Deadline (September 15, 2026)
        const targetDate = new Date('2026-09-15T00:00:00').getTime();
        
        function updateCountdown() {
            const now = Date.now();
            const diff = targetDate - now;
            
            if (diff <= 0) {
                countdownEl.innerText = '00d 00h 00m 00s';
                clearInterval(timerInterval);
                return;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            const dd = days.toString().padStart(2, '0');
            const hh = hours.toString().padStart(2, '0');
            const mm = minutes.toString().padStart(2, '0');
            const ss = seconds.toString().padStart(2, '0');
            
            countdownEl.innerText = `${dd}d ${hh}h ${mm}m ${ss}s`;
        }
        
        updateCountdown();
        timerInterval = setInterval(updateCountdown, 1000);
    }

    /* ==========================================================================
       UPI LEDGER SYSTEM
       ========================================================================== */
    const initialTransactions = [
        { desc: 'Swiggy Delivery Fuel', channel: 'GPAY // HDFC_ACCT', amount: -280, time: '01:31:02' },
        { desc: 'Ferrari Gas Station Fueling', channel: 'CRED // HDFC_ACCT', amount: -2100, time: '01:28:40' },
        { desc: 'Stripe Global Transfer Inc.', channel: 'UPI // AXIS_ACCT', amount: 45000, time: '01:14:12' },
        { desc: 'Coffee Racing Pit Stop', channel: 'PAYTM // HDFC_ACCT', amount: -460, time: '01:05:08' }
    ];

    function initUpiLedger() {
        if (!upiLedger) return;
        
        initialTransactions.forEach(tx => {
            insertLedgerRow(tx.desc, tx.channel, tx.amount, tx.time, false);
        });
        updateCapacityDisplay();
    }

    function insertLedgerRow(desc, channel, amount, timeStr, animate = false) {
        const row = document.createElement('div');
        row.className = 'tr-row';
        if (animate) {
            row.classList.add('new-tx');
        }
        
        const isIncome = amount > 0;
        const amountClass = isIncome ? 'profit' : 'loss';
        const sign = isIncome ? '+' : '-';
        const formattedAmount = '₹' + Math.abs(amount).toLocaleString();
        
        row.innerHTML = `
            <div class="tr-cell col-time">${timeStr}</div>
            <div class="tr-cell col-desc">${desc}</div>
            <div class="tr-cell col-channel">${channel}</div>
            <div class="tr-cell col-amount ${amountClass} text-right">${sign}${formattedAmount}</div>
        `;
        
        // Insert right below the header row
        const header = upiLedger.querySelector('.tr-row.header');
        if (header && header.nextSibling) {
            upiLedger.insertBefore(row, header.nextSibling);
        } else {
            upiLedger.appendChild(row);
        }
    }

    const sampleExpenses = [
        { desc: 'Amazon AWS Cloud Telemetry', channel: 'GPAY // SBI_ACCT', min: 400, max: 1800 },
        { desc: 'Zomato Midnight Racing Food', channel: 'PHONEPE // HDFC_ACCT', min: 250, max: 950 },
        { desc: 'BookMyShow F1 Drive Booking', channel: 'UPI // AXIS_ACCT', min: 800, max: 2400 },
        { desc: 'Speedway Track Accessories', channel: 'GPAY // HDFC_ACCT', min: 1200, max: 4000 },
        { desc: 'Starbucks High-Octane Roast', channel: 'PAYTM // SBI_ACCT', min: 380, max: 720 }
    ];

    function injectUpiTransaction() {
        // Synthesize UI sound effect
        playTickSound(880, 0.05);

        // Select random mock expense
        const sample = sampleExpenses[Math.floor(Math.random() * sampleExpenses.length)];
        const amount = -Math.floor(Math.random() * (sample.max - sample.min) + sample.min);
        
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        
        // Inject row
        insertLedgerRow(sample.desc, sample.channel, amount, timeStr, true);
        
        // Update total capacity and gauges
        const positiveAmount = Math.abs(amount);
        upiCapacityUsed += positiveAmount;
        if (upiCapacityUsed > upiCapacityLimit) {
            upiCapacityUsed = 2840; // wrap around for display safety
        }
        
        updateCapacityDisplay();
        
        // Rev the gauge tachometer needles in charts.js!
        if (window.revTachometer) {
            const currentPercentage = (upiCapacityUsed / upiCapacityLimit);
            const targetRpmVal = Math.min(Math.round(currentPercentage * 10000), 10000);
            window.revTachometer.revEngine(targetRpmVal);
            
            // Highlight speedometer gear readouts
            if (gearBox) {
                const currentGear = Math.min(Math.floor(currentPercentage * 6) + 1, 6);
                gearBox.innerText = `GEAR ${currentGear}`;
                gearBox.style.transform = 'scale(1.2)';
                setTimeout(() => { gearBox.style.transform = 'scale(1)'; }, 200);
            }
        }
    }

    function updateCapacityDisplay() {
        const capacityText = document.getElementById('capacity-usage');
        const fillBar = document.getElementById('capacity-fill-bar');
        
        if (capacityText) {
            capacityText.innerText = `₹${upiCapacityUsed.toLocaleString()} / ₹${upiCapacityLimit.toLocaleString()} Limit`;
        }
        if (fillBar) {
            const pct = Math.min((upiCapacityUsed / upiCapacityLimit) * 100, 100);
            fillBar.style.width = `${pct}%`;
        }
        
        // Sync the digital tachometer odometer label
        const odometerVal = document.getElementById('digital-odo-val');
        if (odometerVal) {
            odometerVal.innerText = `₹${upiCapacityUsed.toLocaleString()} / ₹${upiCapacityLimit.toLocaleString()}`;
        }
    }

    /* ==========================================================================
       SYNTHESIZED WEB AUDIO SOUNDS
       ========================================================================== */
    function playTickSound(frequency = 600, duration = 0.05) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const audioCtx = new AudioContext();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
            osc.type = 'sine';
            
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration + 0.02);
        } catch (e) {}
    }

    function playZeroGravitySound(powerUp = false) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const audioCtx = new AudioContext();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sawtooth';
            
            if (powerUp) {
                // Landing gear / Gravity restoration synth sound
                osc.frequency.setValueAtTime(80, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.65);
                gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
            } else {
                // Gravity collapse sound
                osc.frequency.setValueAtTime(380, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(45, audioCtx.currentTime + 0.85);
                gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.9);
            }
            
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400;
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 1.0);
        } catch (e) {}
    }

    /* ==========================================================================
       ANTIGRAVITY EASTER EGG PHYSICS ENGINE
       ========================================================================== */
    function handleKeydown(e) {
        // Detect ESC key to restore gravity
        if (e.key === 'Escape' && isZeroGravity) {
            restoreGravity();
            return;
        }
        
        // Detect Ctrl + Alt + G keyboard combination
        if (e.ctrlKey && e.altKey && (e.key === 'g' || e.key === 'G')) {
            e.preventDefault();
            toggleZeroGravity();
            return;
        }
        
        // Detect typed sequence: "antigravity"
        if (e.key.length === 1) {
            typedBuffer += e.key.toLowerCase();
            if (typedBuffer.length > 20) {
                typedBuffer = typedBuffer.substring(typedBuffer.length - 20);
            }
            if (typedBuffer.endsWith('antigravity')) {
                toggleZeroGravity();
                typedBuffer = '';
            }
        }
    }

    function toggleZeroGravity() {
        if (isZeroGravity) {
            restoreGravity();
        } else {
            initZeroGravity();
        }
    }

    function initZeroGravity() {
        isZeroGravity = true;
        document.body.classList.add('zero-gravity');
        playZeroGravitySound(false);
        
        if (gearBox) gearBox.innerText = 'GEAR N';

        // Select all layout cards to float
        const cards = document.querySelectorAll('.card');
        physicsCards = [];
        
        cards.forEach((card, index) => {
            // Get current geometry
            const rect = card.getBoundingClientRect();
            
            // Set element styling to lock it in place fixed, bypassing standard grids
            card.style.width = `${rect.width}px`;
            card.style.height = `${rect.height}px`;
            card.style.left = `${rect.left}px`;
            card.style.top = `${rect.top}px`;
            card.style.position = 'fixed';
            card.style.margin = '0';
            
            // Create corresponding physics particle
            const mass = 0.5 + Math.random() * 0.7; // random inertial mass
            
            const pCard = {
                el: card,
                // Positions
                x: rect.left,
                y: rect.top,
                ox: rect.left, // original X coordinate
                oy: rect.top,  // original Y coordinate
                // Velocities
                vx: (Math.random() - 0.5) * 1.5,
                vy: -Math.random() * 0.8 - 0.2, // Drift up
                mass: mass,
                angle: 0,
                av: (Math.random() - 0.5) * 0.015, // angular velocity
                width: rect.width,
                height: rect.height,
                isDragged: false
            };
            
            physicsCards.push(pCard);
            setupCardDragEvents(pCard);
        });
        
        // Start physics loop
        animatePhysics();
    }

    function setupCardDragEvents(pCard) {
        const handleStart = (e) => {
            if (!isZeroGravity) return;
            e.preventDefault();
            
            activeDragCard = pCard;
            pCard.isDragged = true;
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            dragOffset.x = clientX - pCard.x;
            dragOffset.y = clientY - pCard.y;
            
            lastMousePos.x = clientX;
            lastMousePos.y = clientY;
            dragVelocity.x = 0;
            dragVelocity.y = 0;
            
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('touchmove', handleMove, { passive: false });
            document.addEventListener('touchend', handleEnd);
        };
        
        const handleMove = (e) => {
            if (!activeDragCard) return;
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            // Calculate throw momentum velocity
            dragVelocity.x = clientX - lastMousePos.x;
            dragVelocity.y = clientY - lastMousePos.y;
            
            lastMousePos.x = clientX;
            lastMousePos.y = clientY;
            
            // Set positions directly
            activeDragCard.x = clientX - dragOffset.x;
            activeDragCard.y = clientY - dragOffset.y;
            activeDragCard.vx = dragVelocity.x * 0.45;
            activeDragCard.vy = dragVelocity.y * 0.45;
            
            // Rotate card slightly based on drag direction
            activeDragCard.angle = dragVelocity.x * 0.01;
        };
        
        const handleEnd = () => {
            if (activeDragCard) {
                activeDragCard.isDragged = false;
                activeDragCard = null;
            }
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
        };
        
        pCard.el.addEventListener('mousedown', handleStart);
        pCard.el.addEventListener('touchstart', handleStart, { passive: false });
    }

    function animatePhysics() {
        if (!isZeroGravity) return;
        
        physicsCards.forEach(card => {
            if (card.isDragged) {
                // Element position updated in move event handler
                card.el.style.transform = `translate(${card.x - card.ox}px, ${card.y - card.oy}px) rotate(${card.angle}rad)`;
                return;
            }
            
            // 1. Apply very minor anti-gravity upward buoyancy force
            card.vy -= 0.015 * card.mass;
            
            // Sine wave sway
            card.vx += Math.sin(Date.now() * 0.001 + card.mass) * 0.02;
            
            // Friction damping
            card.vx *= 0.99;
            card.vy *= 0.99;
            card.av *= 0.98;
            
            // Update kinematics coords
            card.x += card.vx;
            card.y += card.vy;
            card.angle += card.av;
            
            // Boundary bouncing physics
            // Horizontal bounds check (sides of the window)
            if (card.x < 0) {
                card.x = 0;
                card.vx = -card.vx * 0.75;
                card.av = (Math.random() - 0.5) * 0.03;
            } else if (card.x > window.innerWidth - card.width) {
                card.x = window.innerWidth - card.width;
                card.vx = -card.vx * 0.75;
                card.av = (Math.random() - 0.5) * 0.03;
            }
            
            // Vertical bounds check (wrap cards when they float off-screen)
            if (card.y < -card.height) {
                card.y = window.innerHeight + 10;
                card.x = Math.random() * (window.innerWidth - card.width);
                card.vx = (Math.random() - 0.5) * 1.5;
                card.vy = -Math.random() * 0.8 - 0.2;
            } else if (card.y > window.innerHeight + 50) {
                card.y = -card.height;
                card.x = Math.random() * (window.innerWidth - card.width);
            }
            
            // Apply render translation relative to original anchors
            card.el.style.transform = `translate(${card.x - card.ox}px, ${card.y - card.oy}px) rotate(${card.angle}rad)`;
        });
        
        animationFrameId = requestAnimationFrame(animatePhysics);
    }

    function restoreGravity() {
        isZeroGravity = false;
        document.body.classList.remove('zero-gravity');
        playZeroGravitySound(true);
        
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        physicsCards.forEach(card => {
            card.el.classList.add('returning');
            // Reset transforms
            card.el.style.transform = 'translate(0px, 0px) rotate(0deg)';
        });
        
        // Wait for landing transition animation to finish, then clear inline absolute styles
        setTimeout(() => {
            physicsCards.forEach(card => {
                card.el.classList.remove('returning');
                card.el.removeAttribute('style'); // Clear inline dimensions
            });
            physicsCards = [];
            
            if (gearBox && window.revTachometer) {
                // Reset gear metrics safely
                const currentPercentage = (upiCapacityUsed / upiCapacityLimit);
                const currentGear = Math.min(Math.floor(currentPercentage * 6) + 1, 6);
                gearBox.innerText = `GEAR ${currentGear}`;
            }
        }, 800);
    }
})();
