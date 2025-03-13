import sys
import os
import threading
import webbrowser
import subprocess
from PyQt5.QtWidgets import QApplication, QMainWindow, QLabel, QPushButton, QVBoxLayout, QWidget, QSystemTrayIcon, QMenu, QAction
from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QIcon, QPixmap

class FocusMateGUI(QMainWindow):
    def __init__(self):
        super().__init__()
        
        # Set window properties
        self.setWindowTitle("FocusMate")
        self.setGeometry(100, 100, 400, 300)
        self.setWindowIcon(QIcon("static/images/logo.svg"))
        
        # Setup central widget and layout
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.layout = QVBoxLayout(self.central_widget)
        
        # Add logo
        self.logo_label = QLabel()
        pixmap = QPixmap("static/images/logo.svg")
        if not pixmap.isNull():
            self.logo_label.setPixmap(pixmap.scaled(64, 64, Qt.KeepAspectRatio, Qt.SmoothTransformation))
            self.logo_label.setAlignment(Qt.AlignCenter)
            self.layout.addWidget(self.logo_label)
        
        # Add title
        self.title_label = QLabel("FocusMate")
        self.title_label.setStyleSheet("font-size: 24px; font-weight: bold; color: #6d4aff;")
        self.title_label.setAlignment(Qt.AlignCenter)
        self.layout.addWidget(self.title_label)
        
        # Add subtitle
        self.subtitle_label = QLabel("Your productivity companion")
        self.subtitle_label.setStyleSheet("font-size: 16px; color: #666;")
        self.subtitle_label.setAlignment(Qt.AlignCenter)
        self.layout.addWidget(self.subtitle_label)
        
        # Add spacing
        self.layout.addSpacing(20)
        
        # Add buttons
        self.open_web_button = QPushButton("Open Web Interface")
        self.open_web_button.setStyleSheet("""
            QPushButton {
                background-color: #6d4aff;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 10px;
                font-size: 16px;
            }
            QPushButton:hover {
                background-color: #5536d9;
            }
        """)
        self.open_web_button.clicked.connect(self.open_web_interface)
        self.layout.addWidget(self.open_web_button)
        
        # Add status
        self.status_label = QLabel("Server status: Starting...")
        self.status_label.setAlignment(Qt.AlignCenter)
        self.layout.addWidget(self.status_label)
        
        # Add system tray icon
        self.tray_icon = QSystemTrayIcon(self)
        self.tray_icon.setIcon(QIcon("static/images/logo.svg"))
        
        # Create tray menu
        tray_menu = QMenu()
        show_action = QAction("Show", self)
        show_action.triggered.connect(self.show)
        quit_action = QAction("Quit", self)
        quit_action.triggered.connect(self.close_application)
        
        tray_menu.addAction(show_action)
        tray_menu.addAction(quit_action)
        
        self.tray_icon.setContextMenu(tray_menu)
        self.tray_icon.activated.connect(self.tray_icon_activated)
        self.tray_icon.show()
        
        # Start Flask server in a separate thread
        self.server_thread = threading.Thread(target=self.run_flask_server)
        self.server_thread.daemon = True
        self.server_thread.start()
        
        # Check server status periodically
        self.server_timer = QTimer()
        self.server_timer.timeout.connect(self.check_server_status)
        self.server_timer.start(1000)  # Check every 1 second
        
        # Flag for minimizing to tray on close
        self.minimize_to_tray = True
    
    def run_flask_server(self):
        """Run the Flask server in a separate process."""
        try:
            # Run the Flask app
            self.process = subprocess.Popen([sys.executable, "app.py"])
            
        except Exception as e:
            print(f"Error starting Flask server: {e}")
    
    def check_server_status(self):
        """Check if the server is running."""
        import requests
        try:
            response = requests.get("http://localhost:5000")
            if response.status_code == 200:
                self.status_label.setText("Server status: Running")
                self.status_label.setStyleSheet("color: green;")
                # Stop checking once we know server is running
                self.server_timer.stop()
        except:
            # Still waiting for server to start
            pass
    
    def open_web_interface(self):
        """Open the web interface in a browser."""
        webbrowser.open("http://localhost:5000")
    
    def tray_icon_activated(self, reason):
        """Handle tray icon activation."""
        if reason == QSystemTrayIcon.DoubleClick:
            if self.isHidden():
                self.show()
            else:
                self.hide()
    
    def closeEvent(self, event):
        """Handle application close event."""
        if self.minimize_to_tray:
            event.ignore()
            self.hide()
            self.tray_icon.showMessage(
                "FocusMate",
                "FocusMate is still running in the background.",
                QSystemTrayIcon.Information,
                2000
            )
        else:
            self.close_application()
            event.accept()
    
    def close_application(self):
        """Completely close the application."""
        self.minimize_to_tray = False
        
        # Terminate the Flask server
        if hasattr(self, 'process'):
            self.process.terminate()
        
        # Remove tray icon
        self.tray_icon.hide()
        
        # Exit application
        QApplication.quit()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion")  # Use Fusion style for consistent look across platforms
    window = FocusMateGUI()
    window.show()
    sys.exit(app.exec_())