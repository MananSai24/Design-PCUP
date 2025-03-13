from flask import Flask, render_template, request, jsonify, session
import os
import json
import datetime
from pathlib import Path

app = Flask(__name__)
app.secret_key = os.urandom(24)

# Ensure data directory exists
data_dir = Path("data")
data_dir.mkdir(exist_ok=True)

# Ensure data files exist with default content
whitelist_file = data_dir / "whitelist.json"
analytics_file = data_dir / "analytics.json"
tasks_file = data_dir / "tasks.json"
schedules_file = data_dir / "schedules.json"

# Initialize whitelist file
if not whitelist_file.exists():
    with open(whitelist_file, "w") as f:
        json.dump([], f)

# Initialize analytics file with empty data for each day of the week
if not analytics_file.exists():
    default_analytics = {
        "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0
    }
    with open(analytics_file, "w") as f:
        json.dump(default_analytics, f)

# Initialize tasks file
if not tasks_file.exists():
    with open(tasks_file, "w") as f:
        json.dump([], f)

# Initialize schedules file
if not schedules_file.exists():
    with open(schedules_file, "w") as f:
        json.dump({"start": "", "end": ""}, f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/whitelist', methods=['GET'])
def get_whitelist():
    try:
        with open(whitelist_file, "r") as f:
            whitelist = json.load(f)
        return jsonify(whitelist)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/whitelist', methods=['POST'])
def add_whitelist():
    try:
        website = request.json.get('website', '').strip()
        if not website:
            return jsonify({"error": "Please enter a website."}), 400
        
        # Load current whitelist
        with open(whitelist_file, "r") as f:
            whitelist = json.load(f)
        
        # Add website if not already in whitelist
        if website not in whitelist:
            whitelist.append(website)
            
            with open(whitelist_file, "w") as f:
                json.dump(whitelist, f)
        
        return jsonify({"success": True, "website": website})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/whitelist/<website>', methods=['DELETE'])
def remove_whitelist(website):
    try:
        # Load current whitelist
        with open(whitelist_file, "r") as f:
            whitelist = json.load(f)
        
        # Remove website if in whitelist
        if website in whitelist:
            whitelist.remove(website)
            
            with open(whitelist_file, "w") as f:
                json.dump(whitelist, f)
        
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/schedule', methods=['GET'])
def get_schedule():
    try:
        with open(schedules_file, "r") as f:
            schedule = json.load(f)
        return jsonify(schedule)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/schedule', methods=['POST'])
def save_schedule():
    try:
        start_time = request.json.get('start_time', '')
        end_time = request.json.get('end_time', '')
        
        if not start_time or not end_time:
            return jsonify({"error": "Please select both start and end times."}), 400
        
        # Save schedule
        schedule = {"start": start_time, "end": end_time}
        with open(schedules_file, "w") as f:
            json.dump(schedule, f)
        
        return jsonify({"success": True, "schedule": schedule})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    try:
        with open(analytics_file, "r") as f:
            analytics = json.load(f)
        return jsonify(analytics)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analytics', methods=['POST'])
def update_analytics():
    try:
        minutes = request.json.get('minutes', 0)
        
        # Get current day of week
        day = datetime.datetime.now().strftime("%a")
        
        # Load current analytics
        with open(analytics_file, "r") as f:
            analytics = json.load(f)
        
        # Update analytics for the current day
        analytics[day] += minutes
        
        # Save updated analytics
        with open(analytics_file, "w") as f:
            json.dump(analytics, f)
        
        return jsonify({"success": True, "analytics": analytics})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    try:
        with open(tasks_file, "r") as f:
            tasks = json.load(f)
        return jsonify(tasks)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tasks', methods=['POST'])
def add_task():
    try:
        task = request.json.get('task', '').strip()
        if not task:
            return jsonify({"error": "Please enter a task."}), 400
        
        # Load current tasks
        with open(tasks_file, "r") as f:
            tasks = json.load(f)
        
        # Add task
        new_task = {"id": len(tasks) + 1, "text": task, "completed": False}
        tasks.append(new_task)
        
        # Save updated tasks
        with open(tasks_file, "w") as f:
            json.dump(tasks, f)
        
        return jsonify({"success": True, "task": new_task})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        # Load current tasks
        with open(tasks_file, "r") as f:
            tasks = json.load(f)
        
        # Filter out the task to delete
        tasks = [task for task in tasks if task["id"] != task_id]
        
        # Save updated tasks
        with open(tasks_file, "w") as f:
            json.dump(tasks, f)
        
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tasks/<int:task_id>/toggle', methods=['PUT'])
def toggle_task(task_id):
    try:
        # Load current tasks
        with open(tasks_file, "r") as f:
            tasks = json.load(f)
        
        # Toggle the completed status of the task
        for task in tasks:
            if task["id"] == task_id:
                task["completed"] = not task["completed"]
                break
        
        # Save updated tasks
        with open(tasks_file, "w") as f:
            json.dump(tasks, f)
        
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tasks/clear', methods=['DELETE'])
def clear_tasks():
    try:
        # Clear all tasks
        with open(tasks_file, "w") as f:
            json.dump([], f)
        
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
