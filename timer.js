// Global timer variables
let timerInterval;
let isTimerRunning = false;
let isWorkMode = true;
let elapsedSeconds = 0;
let workDuration = 25; // Default: 25 minutes
let breakDuration = 5; // Default: 5 minutes
let soundEnabled = true;

function initTimer() {
    // Timer display
    const timerDisplay = document.getElementById('timer-display');
    
    // Timer control buttons
    const workBtn = document.getElementById('work-btn');
    const breakBtn = document.getElementById('break-btn');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const soundToggle = document.getElementById('sound-toggle');
    
    // Duration inputs
    const workDurationInput = document.getElementById('work-duration');
    const breakDurationInput = document.getElementById('break-duration');
    
    // Set initial colors for work/break buttons
    workBtn.style.backgroundColor = 'var(--purple)';
    breakBtn.style.backgroundColor = 'var(--light-gray)';
    workBtn.classList.add('active');
    
    // Set initial timer display
    updateTimerDisplay(workDuration * 60);
    
    // Work/Break mode buttons
    workBtn.addEventListener('click', function() {
        if (isTimerRunning) {
            stopTimer();
        }
        isWorkMode = true;
        workBtn.classList.add('active');
        workBtn.style.backgroundColor = 'var(--purple)';
        breakBtn.style.backgroundColor = 'var(--light-gray)';
        breakBtn.classList.remove('active');
        elapsedSeconds = 0;
        updateTimerDisplay(workDuration * 60);
    });
    
    breakBtn.addEventListener('click', function() {
        if (isTimerRunning) {
            stopTimer();
        }
        isWorkMode = false;
        breakBtn.classList.add('active');
        breakBtn.style.backgroundColor = 'var(--purple)';
        workBtn.style.backgroundColor = 'var(--light-gray)';
        workBtn.classList.remove('active');
        elapsedSeconds = 0;
        updateTimerDisplay(breakDuration * 60);
    });
    
    // Play/Pause button - toggle functionality
    playPauseBtn.addEventListener('click', function() {
        if (isTimerRunning) {
            pauseTimer();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            startTimer();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
    });
    
    // Stop button
    stopBtn.addEventListener('click', function() {
        stopTimer();
    });
    
    // Sound toggle
    soundToggle.addEventListener('change', function() {
        soundEnabled = this.checked;
    });
    
    // Duration inputs
    workDurationInput.addEventListener('change', function() {
        const value = parseInt(this.value);
        if (value > 0) {
            workDuration = value;
            if (isWorkMode && !isTimerRunning) {
                updateTimerDisplay(workDuration * 60);
            }
        } else {
            this.value = workDuration;
        }
    });
    
    breakDurationInput.addEventListener('change', function() {
        const value = parseInt(this.value);
        if (value > 0) {
            breakDuration = value;
            if (!isWorkMode && !isTimerRunning) {
                updateTimerDisplay(breakDuration * 60);
            }
        } else {
            this.value = breakDuration;
        }
    });
    
    // Set initial values in inputs
    workDurationInput.value = workDuration;
    breakDurationInput.value = breakDuration;
}

function startTimer() {
    if (isTimerRunning) return;
    
    isTimerRunning = true;
    const playPauseBtn = document.getElementById('play-pause-btn');
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    
    const duration = isWorkMode ? workDuration * 60 : breakDuration * 60;
    const startTime = Date.now() - (elapsedSeconds * 1000);
    
    timerInterval = setInterval(() => {
        const currentTime = Date.now();
        elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        
        if (elapsedSeconds >= duration) {
            // Timer completed
            clearInterval(timerInterval);
            isTimerRunning = false;
            elapsedSeconds = 0;
            
            // Update analytics if work session completed
            if (isWorkMode) {
                updateAnalytics(workDuration);
            }
            
            // Play sound notification
            if (soundEnabled) {
                playNotificationSound();
            }
            
            // Show notification
            showTimerNotification();
            
            // Switch modes
            if (isWorkMode) {
                isWorkMode = false;
                document.getElementById('break-btn').click();
            } else {
                isWorkMode = true;
                document.getElementById('work-btn').click();
            }
            
            return;
        }
        
        const remainingSeconds = duration - elapsedSeconds;
        updateTimerDisplay(remainingSeconds);
    }, 1000);
}

function pauseTimer() {
    if (!isTimerRunning) return;
    
    clearInterval(timerInterval);
    isTimerRunning = false;
    
    const playPauseBtn = document.getElementById('play-pause-btn');
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
}

function stopTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    elapsedSeconds = 0;
    
    const playPauseBtn = document.getElementById('play-pause-btn');
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    
    const duration = isWorkMode ? workDuration * 60 : breakDuration * 60;
    updateTimerDisplay(duration);
}

function updateTimerDisplay(seconds) {
    const timerDisplay = document.getElementById('timer-display');
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${remainingSeconds}`;
}

function playNotificationSound() {
    // Create and play notification sound
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    audio.play().catch(e => console.error('Audio play error:', e));
}

function showTimerNotification() {
    if (isWorkMode) {
        window.showPopup('Work session completed!', 'Time for a break.');
    } else {
        window.showPopup('Break completed!', 'Ready to start working?');
    }
}

function updateAnalytics(minutes) {
    // Send focus time data to server
    fetch('/api/analytics', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ minutes: minutes }),
    })
    .then(response => response.json())
    .then(data => {
        // Refresh analytics chart
        loadAnalyticsData();
    })
    .catch(error => {
        console.error('Error updating analytics:', error);
    });
}
