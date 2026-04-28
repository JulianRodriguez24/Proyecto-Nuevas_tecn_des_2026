"""
Genera los iconos icon-192.png e icon-512.png para la PWA.
Ejecutar una sola vez: python generate_icons.py
Requiere: pip install Pillow
"""
from PIL import Image, ImageDraw, ImageFont
import os

def make_icon(size, path):
    img = Image.new('RGB', (size, size), color='#1a1a1a')
    draw = ImageDraw.Draw(img)

    # Círculo decorativo
    margin = size * 0.15
    draw.ellipse([margin, margin, size - margin, size - margin], fill='#2a2a2a')

    # Letra "S"
    font_size = int(size * 0.45)
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', font_size)
    except:
        font = ImageFont.load_default()

    text = 'S'
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (size - tw) / 2 - bbox[0]
    y = (size - th) / 2 - bbox[1]
    draw.text((x, y), text, fill='#ffffff', font=font)

    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path)
    print(f'Icono generado: {path}')

make_icon(192, 'icons/icon-192.png')
make_icon(512, 'icons/icon-512.png')
print('Listo. Iconos creados en la carpeta icons/')
