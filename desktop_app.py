import tkinter as tk
import threading
import webbrowser
import os
import sys
import subprocess
import time

class FocusMateDesktopApp:
    def __init__(self, root):
        self.root = root
        self.root.title("FocusMate")
        self.root.geometry("400x300")
        self.root.resizable(False, False)
        
        # Set background color
        self.root.configure(bg="#f5f5f7")
        
        # App title
        self.title_label = tk.Label(
            root, 
            text="FocusMate",
            font=("Helvetica", 24, "bold"),
            fg="#6d4aff",
            bg="#f5f5f7"
        )
        self.title_label.pack(pady=(20, 5))
        
        # App subtitle
        self.subtitle_label = tk.Label(
            root, 
            text="Your productivity companion",
            font=("Helvetica", 12),
            fg="#666666",
            bg="#f5f5f7"
        )
        self.subtitle_label.pack(pady=(0, 20))
        
        # Status display
        self.status_frame = tk.Frame(root, bg="#f5f5f7")
        self.status_frame.pack(fill=tk.X, padx=20, pady=10)
        
        self.status_label = tk.Label(
            self.status_frame,
            text="Server Status:",
            font=("Helvetica", 10),
            fg="#333333",
            bg="#f5f5f7"
        )
        self.status_label.pack(side=tk.LEFT)
        
        self.status_value = tk.Label(
            self.status_frame,
            text="Starting...",
            font=("Helvetica", 10),
            fg="#FF8C00",  # Orange for starting
            bg="#f5f5f7"
        )
        self.status_value.pack(side=tk.LEFT, padx=(5, 0))
        
        # Open Web Interface button
        self.open_button = tk.Button(
            root,
            text="Open Web Interface",
            font=("Helvetica", 12),
            fg="white",
            bg="#6d4aff",
            activebackground="#5536d9",
            activeforeground="white",
            relief=tk.FLAT,
            padx=15,
            pady=8,
            command=self.open_web_interface
        )
        self.open_button.pack(pady=20)
        
        # Minimize to tray info
        self.info_label = tk.Label(
            root,
            text="The application will continue running when closed.\nReopen from your system tray.",
            font=("Helvetica", 9),
            fg="#666666",
            bg="#f5f5f7"
        )
        self.info_label.pack(side=tk.BOTTOM, pady=15)
        
        # Flask server process
        self.server_process = None
        
        # Start Flask server in a thread
        self.server_thread = threading.Thread(target=self.start_server)
        self.server_thread.daemon = True
        self.server_thread.start()
        
        # Start status checking
        self.check_server_status()
        
        # Protocol for closing window
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)
        
        # Window is minimized flag
        self.is_minimized = False
    
    def start_server(self):
        """Start the Flask server as a subprocess"""
        try:
            # Use the Python executable from current env to run the Flask app
            python_executable = sys.executable
            
            # Start the process
            self.server_process = subprocess.Popen(
                [python_executable, "app.py"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
        except Exception as e:
            print(f"Error starting server: {e}")
            self.status_value.config(text="Error", fg="red")
    
    def check_server_status(self):
        """Check if the server is running by trying to connect to it"""
        try:
            import requests
            response = requests.get("http://localhost:5000", timeout=0.5)
            if response.status_code == 200:
                self.status_value.config(text="Running", fg="green")
            else:
                self.status_value.config(text="Error", fg="red")
        except:
            # Still starting or error occurred
            if self.status_value.cget("text") == "Starting...":
                # Keep trying every second if still starting
                self.root.after(1000, self.check_server_status)
    
    def open_web_interface(self):
        """Open the web interface in the default browser"""
        webbrowser.open("http://localhost:5000")
    
    def on_close(self):
        """Handle window close event - minimize to system tray"""
        self.root.withdraw()  # Hide the window instead of destroying it
        self.is_minimized = True
        
        # On some systems, you might want to use a notification here
        print("FocusMate is still running. Reopen from your system tray.")
    
    def on_exit(self):
        """Fully exit the application"""
        # Terminate the Flask server process
        if self.server_process:
            self.server_process.terminate()
            
        self.root.destroy()
        sys.exit()

def main():
    root = tk.Tk()
    app = FocusMateDesktopApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()