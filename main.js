// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize website blocker
    initWebsiteBlocker();
    
    // Initialize schedules
    initSchedules();
    
    // Initialize timer
    initTimer();
    
    // Initialize analytics
    initAnalytics();
    
    // Initialize tasks
    initTasks();
    
    // Show popup for error messages or notifications
    window.showPopup = function(message, subtitle) {
        // Remove any existing popups
        const existingPopups = document.querySelectorAll('.popup');
        existingPopups.forEach(p => {
            p.classList.add('fade-out');
            setTimeout(() => {
                if (document.body.contains(p)) {
                    p.remove();
                }
            }, 500);
        });
        
        const popup = document.createElement('div');
        popup.className = 'popup';
        
        // Format message for proper display
        let popupTitle = message;
        let popupSubtitle = subtitle || '';
        
        // If message contains a colon, split it into title and subtitle
        if (!subtitle && message.includes(':')) {
            const parts = message.split(':');
            popupTitle = parts[0].trim();
            popupSubtitle = parts.slice(1).join(':').trim();
        }
        
        popup.innerHTML = `
            <button class="popup-close">&times;</button>
            <div class="popup-content">
                <p>${popupTitle}</p>
                ${popupSubtitle ? `<p>${popupSubtitle}</p>` : ''}
            </div>
        `;
        
        document.body.appendChild(popup);
        popup.style.display = 'block';
        
        // Close popup on button click
        const closeBtn = popup.querySelector('.popup-close');
        closeBtn.addEventListener('click', function() {
            popup.classList.add('fade-out');
            setTimeout(() => {
                if (document.body.contains(popup)) {
                    popup.remove();
                }
            }, 500);
        });
        
        // No auto-close functionality
    };
});
