// Time controller module - manages simulation time and speed
export class TimeController {
    constructor() {
        // Time scale (1 = real time, higher = faster)
        this.timeScale = 1;
        this.isPaused = false;
        this.isReversed = false;

        // Simulation date
        this.simulationDate = new Date();

        // Available time scales
        this.timeScales = [0.1, 0.5, 1, 10, 100, 1000, 10000, 100000];
        this.currentScaleIndex = 2; // Start at 1x

        // Time elapsed in simulation (in days)
        this.simulatedDays = 0;
    }

    getTimeScale() {
        if (this.isPaused) return 0;
        return this.timeScale * (this.isReversed ? -1 : 1);
    }

    pause() {
        this.isPaused = true;
        this.updateUI();
    }

    play() {
        this.isPaused = false;
        this.updateUI();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.updateUI();
    }

    setTimeScale(scale) {
        this.timeScale = scale;
        this.updateUI();
    }

    faster() {
        if (this.currentScaleIndex < this.timeScales.length - 1) {
            this.currentScaleIndex++;
            this.timeScale = this.timeScales[this.currentScaleIndex];
            this.updateUI();
        }
    }

    slower() {
        if (this.currentScaleIndex > 0) {
            this.currentScaleIndex--;
            this.timeScale = this.timeScales[this.currentScaleIndex];
            this.updateUI();
        }
    }

    reverse() {
        this.isReversed = !this.isReversed;
        this.updateUI();
    }

    realtime() {
        this.timeScale = 1;
        this.currentScaleIndex = 2;
        this.isReversed = false;
        this.isPaused = false;
        this.updateUI();
    }

    update(scaledDelta) {
        if (this.isPaused) return;

        // Convert delta (seconds) to days for simulation
        // Assuming 1 real second = timeScale simulation seconds
        const daysElapsed = scaledDelta / 86400; // 86400 seconds in a day
        this.simulatedDays += daysElapsed;

        // Update simulation date
        const msElapsed = daysElapsed * 24 * 60 * 60 * 1000;
        this.simulationDate = new Date(this.simulationDate.getTime() + msElapsed);

        this.updateDateDisplay();
    }

    updateDateDisplay() {
        const dateEl = document.getElementById('simulation-date');
        if (dateEl) {
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            dateEl.textContent = this.simulationDate.toLocaleDateString('ru-RU', options);
        }
    }

    updateUI() {
        const speedEl = document.getElementById('speed-display');
        if (speedEl) {
            let speedText = '';

            if (this.isPaused) {
                speedText = 'Пауза';
            } else {
                const sign = this.isReversed ? '-' : '';
                if (this.timeScale >= 1000) {
                    speedText = `Скорость: ${sign}${this.timeScale / 1000}k×`;
                } else {
                    speedText = `Скорость: ${sign}${this.timeScale}×`;
                }
            }

            speedEl.textContent = speedText;
        }

        // Update pause button
        const pauseBtn = document.getElementById('btn-pause');
        if (pauseBtn) {
            pauseBtn.textContent = this.isPaused ? '▶' : '⏸';
            pauseBtn.classList.toggle('active', !this.isPaused);
        }

        // Update reverse button
        const reverseBtn = document.getElementById('btn-reverse');
        if (reverseBtn) {
            reverseBtn.classList.toggle('active', this.isReversed);
        }
    }

    // Get formatted time info
    getTimeInfo() {
        return {
            date: this.simulationDate,
            timeScale: this.timeScale,
            isPaused: this.isPaused,
            isReversed: this.isReversed,
            simulatedDays: this.simulatedDays
        };
    }
}
