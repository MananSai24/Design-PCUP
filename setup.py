from setuptools import setup

APP = ['desktop_app.py']
DATA_FILES = [
    ('', ['app.py']),
    ('templates', ['templates/index.html']),
    ('static/css', ['static/css/style.css']),
    ('static/images', ['static/images/logo.svg']),
    ('static/js', [
        'static/js/main.js',
        'static/js/website_blocker.js',
        'static/js/schedules.js',
        'static/js/timer.js',
        'static/js/analytics.js',
        'static/js/tasks.js'
    ])
]

OPTIONS = {
    'argv_emulation': True,
    'iconfile': 'static/images/logo.icns',
    'plist': {
        'CFBundleName': 'FocusMate',
        'CFBundleDisplayName': 'FocusMate',
        'CFBundleGetInfoString': 'Productivity application with website blocking',
        'CFBundleIdentifier': 'com.focusmate.app',
        'CFBundleVersion': '1.0.0',
        'CFBundleShortVersionString': '1.0.0',
        'NSHumanReadableCopyright': 'Copyright © 2025, FocusMate, All Rights Reserved',
    },
    'packages': ['flask', 'requests'],
}

setup(
    app=APP,
    data_files=DATA_FILES,
    options={'py2app': OPTIONS},
    setup_requires=['py2app'],
)