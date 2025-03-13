function initSchedules() {
    // Get schedule elements
    const scheduleForm = document.getElementById('schedule-form');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const saveScheduleBtn = document.getElementById('save-schedule');
    
    // Load existing schedule
    loadSchedule();
    
    // Save schedule on form submit
    scheduleForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveSchedule();
    });
    
    // Save schedule on button click
    saveScheduleBtn.addEventListener('click', function() {
        saveSchedule();
    });
    
    // Check schedule every minute to see if websites should be blocked
    setInterval(checkScheduleBlockStatus, 60000);
    
    // Initial check
    checkScheduleBlockStatus();
}

function loadSchedule() {
    fetch('/api/schedule')
    .then(response => response.json())
    .then(schedule => {
        // Set input values with existing schedule
        const startTimeInput = document.getElementById('start-time');
        const endTimeInput = document.getElementById('end-time');
        
        if (schedule.start) {
            startTimeInput.value = schedule.start;
        }
        
        if (schedule.end) {
            endTimeInput.value = schedule.end;
        }
    })
    .catch(error => {
        console.error('Error loading schedule:', error);
    });
}

function saveSchedule() {
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    
    if (!startTime || !endTime) {
        window.showPopup('Please select both start and end times.');
        return;
    }
    
    fetch('/api/schedule', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            start_time: startTime,
            end_time: endTime
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            window.showPopup(data.error);
            return;
        }
        
        window.showPopup('Schedule saved', `Focus time set from ${startTime} to ${endTime}`);
        
        // Check schedule status immediately after saving
        checkScheduleBlockStatus();
    })
    .catch(error => {
        console.error('Error saving schedule:', error);
        window.showPopup('Error saving schedule.');
    });
}

// Check if current time is within schedule time
function checkScheduleBlockStatus() {
    fetch('/api/schedule')
    .then(response => response.json())
    .then(schedule => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute; // Convert to minutes
        
        if (schedule.start && schedule.end) {
            const [startHour, startMinute] = schedule.start.split(':').map(Number);
            const [endHour, endMinute] = schedule.end.split(':').map(Number);
            
            const startTimeMinutes = startHour * 60 + startMinute;
            const endTimeMinutes = endHour * 60 + endMinute;
            
            // Check if current time is within schedule
            const isWithinSchedule = (currentTime >= startTimeMinutes && currentTime <= endTimeMinutes);
            
            // Set a data attribute on body to indicate blocking status for the Java component
            document.body.setAttribute('data-blocking-active', isWithinSchedule);
            
            // Update UI to show blocking status
            updateBlockingStatus(isWithinSchedule);
        }
    })
    .catch(error => {
        console.error('Error checking schedule:', error);
    });
}

// Update UI to show blocking status
function updateBlockingStatus(isBlocking) {
    const scheduleStatus = document.createElement('div');
    scheduleStatus.id = 'schedule-status';
    scheduleStatus.className = isBlocking ? 'blocking-active' : 'blocking-inactive';
    
    // Remove existing status element if it exists
    const existingStatus = document.getElementById('schedule-status');
    if (existingStatus) {
        existingStatus.remove();
    }
    
    // Add status message to the schedule card
    const scheduleCard = document.querySelector('.card:nth-child(2)');
    if (scheduleCard) {
        scheduleCard.appendChild(scheduleStatus);
        
        // Only show popup notification on first load, not on subsequent checks
        if (isBlocking && !document.body.hasAttribute('data-schedule-notified')) {
            window.showPopup('Schedule active', 'Blacklisted websites are now blocked.');
            document.body.setAttribute('data-schedule-notified', 'true');
        }
    }
}
