# First install required packages
# pip install cairosvg Pillow

import os
import cairosvg
from PIL import Image

# Create directory if it doesn't exist
os.makedirs('AppIcon.iconset', exist_ok=True)

# Define the sizes needed
sizes = {
    'icon_16x16.png': 16,
    'icon_32x32.png': 32,
    'icon_32x32@2x.png': 64,
    'icon_128x128.png': 128,
    'icon_128x128@2x.png': 256,
    'icon_256x256@2x.png': 512,
    'icon_512x512@2x.png': 1024
}

svg_path = 'static/images/logo.svg'

# Convert to each size
for filename, size in sizes.items():
    output_path = os.path.join('AppIcon.iconset', filename)
    # Convert SVG to PNG
    cairosvg.svg2png(url=svg_path, write_to=output_path, output_width=size, output_height=size)
    print(f"Created {output_path}")