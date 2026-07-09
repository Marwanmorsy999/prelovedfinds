from PIL import Image
import os

assets_dir = "d:/prelovedfinds/src/assets"

# Compress hero.jpeg
hero_path = os.path.join(assets_dir, "hero.jpeg")
hero = Image.open(hero_path)
hero = hero.convert("RGB")
if hero.width > 1920:
    ratio = 1920.0 / hero.width
    hero = hero.resize((1920, int(hero.height * ratio)), Image.LANCZOS)
hero.save(hero_path, "JPEG", quality=70, optimize=True, progressive=True)
print(f"hero.jpeg: {os.path.getsize(hero_path) / 1024:.1f} KB")

# Compress logo.webp
logo_path = os.path.join(assets_dir, "logo.webp")
logo = Image.open(logo_path)
logo = logo.convert("RGBA")
if logo.width > 400:
    ratio = 400.0 / logo.width
    logo = logo.resize((400, int(logo.height * ratio)), Image.LANCZOS)
logo.save(logo_path, "WEBP", quality=60, optimize=True)
print(f"logo.webp: {os.path.getsize(logo_path) / 1024:.1f} KB")

# Compress about-founder.jpeg
about_path = os.path.join(assets_dir, "about-founder.jpeg")
about = Image.open(about_path)
about = about.convert("RGB")
if about.width > 1200:
    ratio = 1200.0 / about.width
    about = about.resize((1200, int(about.height * ratio)), Image.LANCZOS)
about.save(about_path, "JPEG", quality=70, optimize=True, progressive=True)
print(f"about-founder.jpeg: {os.path.getsize(about_path) / 1024:.1f} KB")

# Also create a smaller hero version for mobile
hero_mobile_path = os.path.join(assets_dir, "hero-mobile.jpeg")
hero_mobile = Image.open(hero_path)
hero_mobile = hero_mobile.convert("RGB")
if hero_mobile.width > 640:
    ratio = 640.0 / hero_mobile.width
    hero_mobile = hero_mobile.resize((640, int(hero_mobile.height * ratio)), Image.LANCZOS)
hero_mobile.save(hero_mobile_path, "JPEG", quality=65, optimize=True)

print("All images compressed successfully!")