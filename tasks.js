function initTasks() {
    // Get task elements
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const addTaskBtn = document.getElementById('add-task-btn');
    const clearTasksBtn = document.getElementById('clear-tasks-btn');
    
    // Load existing tasks
    loadTasks();
    
    // Add task event handlers
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addTask();
    });
    
    addTaskBtn.addEventListener('click', function() {
        addTask();
    });
    
    // Add task on Enter key in input
    taskInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTask();
        }
    });
    
    // Clear all tasks
    clearTasksBtn.addEventListener('click', function() {
        clearAllTasks();
    });
}

function loadTasks() {
    fetch('/api/tasks')
    .then(response => response.json())
    .then(tasks => {
        renderTasks(tasks);
    })
    .catch(error => {
        console.error('Error loading tasks:', error);
    });
}

function renderTasks(tasks) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="task-empty">No tasks yet. Add a task to get started.</div>';
        return;
    }
    
    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
            <span class="task-text ${task.completed ? 'task-completed' : ''}">${escapeHtml(task.text)}</span>
            <button class="task-delete" data-id="${task.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        taskList.appendChild(taskItem);
        
        // Add event listeners
        const checkbox = taskItem.querySelector('.task-checkbox');
        checkbox.addEventListener('change', function() {
            toggleTaskCompletion(task.id);
        });
        
        const deleteBtn = taskItem.querySelector('.task-delete');
        deleteBtn.addEventListener('click', function() {
            deleteTask(task.id);
        });
    });
}

function addTask() {
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value.trim();
    
    if (!taskText) {
        window.showPopup('Please enter a task.');
        return;
    }
    
    fetch('/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task: taskText }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            window.showPopup(data.error);
            return;
        }
        
        // Clear input and reload tasks
        taskInput.value = '';
        loadTasks();
    })
    .catch(error => {
        console.error('Error adding task:', error);
        window.showPopup('Error adding task.');
    });
}

function toggleTaskCompletion(taskId) {
    fetch(`/api/tasks/${taskId}/toggle`, {
        method: 'PUT',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadTasks();
        }
    })
    .catch(error => {
        console.error('Error toggling task:', error);
    });
}

function deleteTask(taskId) {
    fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadTasks();
        }
    })
    .catch(error => {
        console.error('Error deleting task:', error);
    });
}

function clearAllTasks() {
    fetch('/api/tasks/clear', {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadTasks();
        }
    })
    .catch(error => {
        console.error('Error clearing tasks:', error);
    });
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
