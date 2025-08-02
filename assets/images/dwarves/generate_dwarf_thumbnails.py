#!/usr/bin/env python3
"""
Generate thumbnails and metadata for dwarf images
"""
import os
import json
from datetime import datetime
from PIL import Image
import glob

def get_image_metadata(image_path):
    """Extract metadata from an image file."""
    try:
        with Image.open(image_path) as img:
            width, height = img.size
            mode = img.mode
            format_type = img.format
            file_size = os.path.getsize(image_path)
            file_modified = datetime.fromtimestamp(os.path.getmtime(image_path)).isoformat()
            
            return {
                "filename": os.path.basename(image_path),
                "width": width,
                "height": height,
                "mode": mode,
                "format": format_type,
                "file_size_bytes": file_size,
                "file_size_mb": round(file_size / (1024 * 1024), 2),
                "aspect_ratio": round(width / height, 2),
                "last_modified": file_modified
            }
    except Exception as e:
        return {
            "filename": os.path.basename(image_path),
            "error": str(e)
        }

def create_thumbnail(image_path, thumbnail_dir, max_size=200):
    """Create a thumbnail for an image."""
    try:
        filename = os.path.basename(image_path)
        name, ext = os.path.splitext(filename)
        thumbnail_path = os.path.join(thumbnail_dir, f"{name}-thumb{ext}")
        
        with Image.open(image_path) as img:
            img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            img.save(thumbnail_path, optimize=True, quality=85)
            
        return {
            "original": filename,
            "thumbnail": os.path.basename(thumbnail_path),
            "thumbnail_size": img.size
        }
    except Exception as e:
        return {
            "original": os.path.basename(image_path),
            "error": str(e)
        }

def main():
    os.chdir("full")
    thumbnail_dir = "../thumbs"
    os.makedirs(thumbnail_dir, exist_ok=True)
    
    png_files = glob.glob("*.png")
    png_files.sort()
    
    print(f"Found {len(png_files)} dwarf images")
    
    metadata_list = []
    thumbnail_info = []
    
    for i, image_path in enumerate(png_files, 1):
        print(f"Processing {i}/{len(png_files)}: {image_path}")
        
        metadata = get_image_metadata(image_path)
        metadata_list.append(metadata)
        
        thumb_info = create_thumbnail(image_path, thumbnail_dir)
        thumbnail_info.append(thumb_info)
    
    output_data = {
        "generated_at": datetime.now().isoformat(),
        "total_images": len(png_files),
        "collection": "dwarves",
        "images": metadata_list,
        "thumbnails": thumbnail_info
    }
    
    with open("../metadata.json", "w") as f:
        json.dump(output_data, f, indent=2)
    
    print(f"\nCompleted! Generated {len(thumbnail_info)} thumbnails")
    
    total_size = sum(img.get("file_size_bytes", 0) for img in metadata_list if "error" not in img)
    print(f"Total collection size: {round(total_size / (1024 * 1024), 2)} MB")

if __name__ == "__main__":
    main()