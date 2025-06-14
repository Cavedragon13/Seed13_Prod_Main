#!/usr/bin/env python3
"""
Generate thumbnails and extract metadata for all PNG images in the current directory.
Creates a thumbnails/ directory and metadata.json file.
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
            # Get basic image info
            width, height = img.size
            mode = img.mode
            format_type = img.format
            
            # Get file info
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
        thumbnail_path = os.path.join(thumbnail_dir, f"{name}_thumb{ext}")
        
        with Image.open(image_path) as img:
            # Calculate thumbnail size while maintaining aspect ratio
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
    # Create thumbnails directory
    thumbnail_dir = "thumbnails"
    os.makedirs(thumbnail_dir, exist_ok=True)
    
    # Find all PNG files
    png_files = glob.glob("*.png")
    png_files.sort()
    
    print(f"Found {len(png_files)} PNG files")
    
    metadata_list = []
    thumbnail_info = []
    
    for i, image_path in enumerate(png_files, 1):
        print(f"Processing {i}/{len(png_files)}: {image_path}")
        
        # Extract metadata
        metadata = get_image_metadata(image_path)
        metadata_list.append(metadata)
        
        # Create thumbnail
        thumb_info = create_thumbnail(image_path, thumbnail_dir)
        thumbnail_info.append(thumb_info)
    
    # Save metadata to JSON
    output_data = {
        "generated_at": datetime.now().isoformat(),
        "total_images": len(png_files),
        "images": metadata_list,
        "thumbnails": thumbnail_info
    }
    
    with open("metadata.json", "w") as f:
        json.dump(output_data, f, indent=2)
    
    print(f"\nCompleted!")
    print(f"- Generated {len(thumbnail_info)} thumbnails in '{thumbnail_dir}/' directory")
    print(f"- Saved metadata to 'metadata.json'")
    
    # Print summary statistics
    total_size = sum(img.get("file_size_bytes", 0) for img in metadata_list if "error" not in img)
    avg_width = sum(img.get("width", 0) for img in metadata_list if "error" not in img) / len([img for img in metadata_list if "error" not in img])
    avg_height = sum(img.get("height", 0) for img in metadata_list if "error" not in img) / len([img for img in metadata_list if "error" not in img])
    
    print(f"\nSummary:")
    print(f"- Total collection size: {round(total_size / (1024 * 1024), 2)} MB")
    print(f"- Average dimensions: {int(avg_width)} × {int(avg_height)}")

if __name__ == "__main__":
    main()