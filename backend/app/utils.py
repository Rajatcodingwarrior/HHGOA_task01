import io
import cv2
import numpy as np
from PIL import Image, ImageOps
from pillow_heif import register_heif_opener

# Register HEIF opener to handle HEIC images seamlessly via Image.open
register_heif_opener()

def normalize_and_crop_image(image_bytes: bytes, target_width: int, target_height: int) -> bytes:
    """
    1. Reads image orientation EXIF headers and rotates image if necessary.
    2. Converts to standard RGB format.
    3. Detects faces to calculate smart cropping focal points.
    4. Crops and resizes image to exactly target_width x target_height.
    5. Returns processed image bytes as PNG.
    """
    # Open image from bytes
    img = Image.open(io.BytesIO(image_bytes))
    
    # Auto-rotate image based on EXIF headers
    img = ImageOps.exif_transpose(img)
    
    # Ensure RGB color space (converts HEIC/CMYK/RGBA to RGB)
    if img.mode != "RGB":
        img = img.convert("RGB")
        
    width, height = img.size
    aspect_ratio = width / height
    target_aspect = target_width / target_height

    # Convert to NumPy array for OpenCV face detection
    img_np = np.array(img)
    
    # Detect faces
    face_center_x = width / 2
    face_center_y = height / 3 # Default fallback: slightly above center

    try:
        # Load OpenCV's built-in Haar Cascade face classifier
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30))

        if len(faces) > 0:
            # If multiple faces exist, find the largest face (main subject)
            largest_face = max(faces, key=lambda f: f[2] * f[3])
            fx, fy, fw, fh = largest_face
            
            # Focal center is the center of the face
            face_center_x = fx + fw / 2
            face_center_y = fy + fh / 2
    except Exception as e:
        # Fall back to default center-weighted cropping if OpenCV errors
        pass

    # Crop calculations: Determine box coordinates centering around focal point
    if aspect_ratio > target_aspect:
        # Original is wider than target. Crop left/right borders.
        crop_width = int(height * target_aspect)
        left = int(face_center_x - crop_width / 2)
        left = max(0, min(left, width - crop_width))
        right = left + crop_width
        top = 0
        bottom = height
    else:
        # Original is taller than target. Crop top/bottom borders.
        crop_height = int(width / target_aspect)
        top = int(face_center_y - crop_height * 0.4) # Keep face in the upper 40% of crop box
        top = max(0, min(top, height - crop_height))
        bottom = top + crop_height
        left = 0
        right = width

    # Crop and Resize
    cropped_img = img.crop((left, top, right, bottom))
    resized_img = cropped_img.resize((target_width, target_height), Image.Resampling.LANCZOS)

    # Convert back to PNG bytes
    out_io = io.BytesIO()
    resized_img.save(out_io, format="PNG")
    return out_io.getvalue()
