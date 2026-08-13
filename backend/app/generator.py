import os
import urllib.request
import logging
import ssl
from PIL import Image, ImageDraw, ImageFont
import io
import random

logger = logging.getLogger(__name__)

# Directory for caching Google Fonts
FONTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "fonts")
os.makedirs(FONTS_DIR, exist_ok=True)

# Templates assets
TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "templates")
PFP_TEMPLATE_PATH = os.path.join(TEMPLATES_DIR, "pfp_frame_template.jpg")
CARD_TEMPLATE_PATH = os.path.join(TEMPLATES_DIR, "builder_card_template.jpg")

FONT_URLS = {
    "SpaceGrotesk-Bold.ttf": "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj4PVksj.ttf",
    "JetBrainsMono-Regular.ttf": "https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPQ.ttf",
    "JetBrainsMono-Bold.ttf": "https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8L6tjPQ.ttf",
}

def get_cached_font(font_name: str, size: int) -> ImageFont.FreeTypeFont:
    """Downloads the font from Google Fonts raw repository if not cached locally, then loads it."""
    font_path = os.path.join(FONTS_DIR, font_name)
    
    if not os.path.exists(font_path) or os.path.getsize(font_path) < 1000:
        try:
            url = FONT_URLS[font_name]
            logger.info(f"Downloading font {font_name} from {url}...")
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            # Bypasses local SSL certificate issues on Linux servers
            context = ssl._create_unverified_context()
            with urllib.request.urlopen(req, context=context) as response, open(font_path, 'wb') as out_file:
                out_file.write(response.read())
            logger.info(f"Font {font_name} downloaded successfully.")
        except Exception as e:
            logger.error(f"Failed to download font {font_name}: {e}. Falling back to default system font.")
            # Remove corrupted file if it exists to allow clean download on next run
            if os.path.exists(font_path):
                try:
                    os.remove(font_path)
                except:
                    pass
            return ImageFont.load_default()

    try:
        return ImageFont.truetype(font_path, size)
    except Exception as e:
        logger.error(f"Error loading font {font_path}: {e}")
        return ImageFont.load_default()

def crop_to_circle(img: Image.Image) -> Image.Image:
    """Utility to crop an image to a centered circle."""
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) / 2
    top = (h - min_dim) / 2
    right = (w + min_dim) / 2
    bottom = (h + min_dim) / 2
    img_square = img.crop((left, top, right, bottom))
    
    mask = Image.new("L", img_square.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse([0, 0, img_square.size[0], img_square.size[1]], fill=255)
    
    result = Image.new("RGBA", img_square.size, (0, 0, 0, 0))
    result.paste(img_square, (0, 0), mask=mask)
    return result

def draw_goa_devanagari(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float, color: tuple):
    """Draws the Hindi text 'गोवा' procedurally using vector lines and loops (Shirorekha & Aksharas)."""
    # Top horizontal bar (Shirorekha)
    draw.line([(x - int(90 * scale), y), (x + int(90 * scale), y)], fill=color, width=int(10 * scale))
    
    # ग strokes
    # Left loop vertical
    draw.line([(x - int(65 * scale), y), (x - int(65 * scale), y + int(45 * scale))], fill=color, width=int(8 * scale))
    draw.ellipse([x - int(75 * scale), y + int(35 * scale), x - int(55 * scale), y + int(55 * scale)], fill=color)
    # Right vertical bar of ग
    draw.line([(x - int(30 * scale), y), (x - int(30 * scale), y + int(60 * scale))], fill=color, width=int(8 * scale))
    
    # Right vertical matra of गो
    draw.line([(x - int(5 * scale), y), (x - int(5 * scale), y + int(60 * scale))], fill=color, width=int(8 * scale))
    # Top slant matra of गो
    draw.line([(x - int(5 * scale), y), (x - int(25 * scale), y - int(25 * scale))], fill=color, width=int(6 * scale))
    draw.ellipse([x - int(29 * scale), y - int(29 * scale), x - int(21 * scale), y - int(21 * scale)], fill=color)

    # व strokes
    # Loop on left of vertical
    draw.ellipse([x + int(15 * scale), y + int(15 * scale), x + int(45 * scale), y + int(45 * scale)], outline=color, width=int(6 * scale))
    # Right vertical bar of व
    draw.line([(x + int(45 * scale), y), (x + int(45 * scale), y + int(60 * scale))], fill=color, width=int(8 * scale))
    
    # Right vertical matra of वा
    draw.line([(x + int(70 * scale), y), (x + int(70 * scale), y + int(60 * scale))], fill=color, width=int(8 * scale))

def generate_pfp_frame(photo_bytes: bytes) -> bytes:
    """Composites a circular cropped photo inside the Beige Retro Beach PFP Frame."""
    photo = Image.open(io.BytesIO(photo_bytes)).convert("RGBA")
    photo_circle = crop_to_circle(photo).resize((660, 660), Image.Resampling.LANCZOS)
    
    # 1. Load background template if available, otherwise draw procedural fallback
    if os.path.exists(PFP_TEMPLATE_PATH):
        logger.info("Loading pre-generated PFP Frame background template...")
        canvas = Image.open(PFP_TEMPLATE_PATH).convert("RGBA").resize((1080, 1080))
    else:
        logger.warning(f"Template not found at {PFP_TEMPLATE_PATH}. Drawing fallback...")
        canvas = Image.new("RGBA", (1080, 1080), (247, 244, 235, 255))
        draw_fallback = ImageDraw.Draw(canvas)
        # Left Sun
        draw_fallback.ellipse([20, 320, 320, 620], fill=(255, 110, 0, 255))
        # Hills
        draw_fallback.polygon([(0, 650), (200, 580), (450, 660), (450, 1080), (0, 1080)], fill=(27, 94, 32, 255))
        # Ocean water
        draw_fallback.polygon([(300, 1080), (1080, 1080), (1080, 620), (750, 780), (480, 880)], fill=(0, 162, 181, 255))
        # Left Palm Tree Trunk and Crown
        draw_fallback.line([(80, 1080), (60, 850), (100, 550)], fill=(93, 64, 55, 255), width=24)
        for angle in [-15, -45, -90, -135, -165]:
            rad = angle * 3.14159 / 180
            lx = 100 + int(math_cos(rad) * 140)
            ly = 550 + int(math_sin(rad) * 140)
            draw_fallback.line([(100, 550), (lx, ly)], fill=(27, 94, 32, 255), width=10)

    draw = ImageDraw.Draw(canvas)

    # 2. Draw solid beige background over the template's white cutout circle
    draw.ellipse([210, 210, 870, 870], fill=(247, 244, 235, 255))

    # 3. Paste User Photo in center
    canvas.paste(photo_circle, (210, 210), photo_circle)
    
    # 4. Draw yellow circular border with pink tabs on top for crisp overlay
    draw.ellipse([205, 205, 875, 875], outline=(235, 190, 20, 255), width=12)
    # Pink tabs overlaying at 4 corners
    for tx, ty in [(235, 235), (800, 235), (235, 800), (800, 800)]:
        draw.ellipse([tx, ty, tx + 45, ty + 45], fill=(216, 27, 96, 255))

    # 5. Load Fonts
    space_g = get_cached_font("SpaceGrotesk-Bold.ttf", 46)
    jb_mono_micro = get_cached_font("JetBrainsMono-Bold.ttf", 15)
    jb_mono_bold = get_cached_font("JetBrainsMono-Bold.ttf", 20)

    # Top Header Text: "HACKER HOUSE" (Underlined with pink)
    draw.text((370, 70), "HACKER HOUSE", font=space_g, fill=(13, 30, 25, 255))
    draw.line([(370, 130), (710, 130)], fill=(216, 27, 96, 255), width=5)

    # Top Right Code Stamp tag and Circular Stamp
    draw.rectangle([850, 60, 970, 110], fill=(235, 190, 20, 255))
    draw.text((885, 70), "</>", font=space_g, fill=(13, 30, 25, 255))
    # Circular Stamp
    draw.ellipse([880, 130, 1020, 270], outline=(216, 27, 96, 255), width=3)
    draw.text((915, 180), "GOA", font=jb_mono_bold, fill=(216, 27, 96, 255))

    # Bottom Black Capsule: "GOA / 2026"
    draw.rectangle([380, 930, 700, 995], fill=(13, 20, 23, 255))
    draw.text((450, 948), "GOA / 2026", font=space_g, fill=(247, 245, 240, 255))

    # Bottom Right studio pill: "2:47 PM STUDIO"
    draw.rectangle([730, 860, 920, 920], fill=(1, 55, 30, 255))
    draw.text((750, 880), "2:47 PM STUDIO", font=jb_mono_micro, fill=(0, 240, 255, 255))

    # Combine & Save Output PNG
    out_io = io.BytesIO()
    canvas.save(out_io, format="PNG")
    return out_io.getvalue()

def generate_builder_card(photo_bytes: bytes, metadata: dict) -> bytes:
    """Generates the premium Goa Beach Theme Builder ID Card."""
    photo = Image.open(io.BytesIO(photo_bytes)).convert("RGBA")
    photo_circle = crop_to_circle(photo).resize((560, 560), Image.Resampling.LANCZOS)
    
    # 1. Load background template if available, otherwise draw fallback
    if os.path.exists(CARD_TEMPLATE_PATH):
        logger.info("Loading pre-generated Goa Beach Card template...")
        canvas = Image.open(CARD_TEMPLATE_PATH).convert("RGBA").resize((1200, 1500))
    else:
        logger.warning(f"Template not found at {CARD_TEMPLATE_PATH}. Drawing fallback...")
        canvas = Image.new("RGBA", (1200, 1500), (247, 244, 235, 255))
        draw_fallback = ImageDraw.Draw(canvas)
        draw_fallback.rectangle([30, 30, 1170, 1470], outline=(235, 182, 20, 255), width=4)

    draw = ImageDraw.Draw(canvas)

    # 2. Draw solid beige background over the template's white cutout circle
    draw.ellipse([320, 440, 880, 1000], fill=(247, 244, 235, 255))

    # 3. Paste circular cropped photo inside the center
    canvas.paste(photo_circle, (320, 440), photo_circle)
    # Yellow circular outline
    draw.ellipse([314, 434, 886, 1006], outline=(235, 182, 20, 255), width=10)

    # Fonts
    space_g_title = get_cached_font("SpaceGrotesk-Bold.ttf", 64)
    space_g_bold = get_cached_font("SpaceGrotesk-Bold.ttf", 46)
    jb_mono_tag = get_cached_font("JetBrainsMono-Bold.ttf", 26)
    jb_mono_text = get_cached_font("JetBrainsMono-Regular.ttf", 22)
    jb_mono_micro = get_cached_font("JetBrainsMono-Regular.ttf", 16)

    # Optional overlays if fallback is used
    if not os.path.exists(CARD_TEMPLATE_PATH):
        draw.text((100, 60), "HH GOA 2026", font=space_g_bold, fill=(13, 30, 25, 255))
        draw.text((100, 140), "HACKER HOUSE", font=space_g_title, fill=(13, 30, 25, 255))
        draw_goa_devanagari(draw, 700, 170, 1.4, (216, 27, 96, 255))
        subtitle_text = "— GOA, INDIA  •  28 – 31 OCT 2026  •  BUILT IN GOA FOR BUILDERS —"
        draw.text((100, 250), subtitle_text, font=jb_mono_micro, fill=(13, 30, 25, 255))

    # Name and Stack details from metadata (Centered using dark text shifted down by 120px)
    name = metadata.get("name", "ANONYMOUS BUILDER").upper()
    space_g_name = get_cached_font("SpaceGrotesk-Bold.ttf", 64)
    draw.text((600, 1030), name, font=space_g_name, fill=(13, 30, 25, 255), anchor="mt")
    
    role = metadata.get("role", "BUILDER").upper()
    jb_mono_role = get_cached_font("JetBrainsMono-Bold.ttf", 42)
    draw.text((600, 1100), role, font=jb_mono_role, fill=(216, 27, 96, 255), anchor="mt")

    # Dividers and parameters (Only drawn if using fallback template background)
    if not os.path.exists(CARD_TEMPLATE_PATH):
        draw.line([(100, 1165), (1100, 1165)], fill=(216, 27, 96, 255), width=4)
    
    team_name = metadata.get("team_name", "AI & FULL-STACK").upper()
    space_g_team = get_cached_font("SpaceGrotesk-Bold.ttf", 48)
    draw.text((600, 1150), team_name, font=space_g_team, fill=(13, 30, 25, 255), anchor="mt")

    if not os.path.exists(CARD_TEMPLATE_PATH):
        draw.line([(100, 1260), (1100, 1260)], fill=(216, 27, 96, 255), width=4)

    # Custom quote / Team members list (Stacked vertically one below another)
    team_members = metadata.get("team_members", [])
    if team_members and isinstance(team_members, list) and len(team_members) > 0:
        jb_mono_hdr = get_cached_font("JetBrainsMono-Bold.ttf", 30)
        jb_mono_name = get_cached_font("JetBrainsMono-Bold.ttf", 26)
        
        # Draw "TEAM MEMBERS" header
        draw.text((600, 1270), "TEAM MEMBERS", font=jb_mono_hdr, fill=(216, 27, 96, 255), anchor="mt")
        
        # Compile all members list
        all_members = [name] + [m.upper() for m in team_members]
        for idx, member_name in enumerate(all_members):
            draw.text((600, 1310 + (idx * 32)), member_name, font=jb_mono_name, fill=(13, 30, 25, 255), anchor="mt")
    else:
        quote_text = '"I BUILD INTERFACES THAT INSPIRE"'
        jb_mono_quote = get_cached_font("JetBrainsMono-Bold.ttf", 30)
        draw.text((600, 1295), quote_text, font=jb_mono_quote, fill=(13, 30, 25, 255), anchor="mt")

    # Footer boarding details
    draw.text((130, 1430), "#FrameInGoa", font=space_g_bold, fill=(216, 27, 96, 255))
    draw.text((950, 1430), "HH GOA 2026", font=jb_mono_tag, fill=(13, 30, 25, 255))

    # Output PNG bytes
    out_io = io.BytesIO()
    canvas.save(out_io, format="PNG")
    return out_io.getvalue()

def math_cos(val):
    import math
    return math.cos(val)

def math_sin(val):
    import math
    return math.sin(val)
