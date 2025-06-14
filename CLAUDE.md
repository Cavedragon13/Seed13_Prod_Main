# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a professional AI image gallery system for "Seed 13 Productions" featuring fantasy character images. The repository contains both the image assets and the complete web gallery infrastructure for showcasing them.

## Commands

### Development Server

Start a local development server to test the gallery:
```bash
python -m http.server 8000
# Navigate to http://localhost:8000
```

### Thumbnail and Metadata Generation

Generate thumbnails and extract metadata for all PNG images:
```bash
cd resources/
python generate_thumbnails_and_metadata.py
```

This creates:
- `thumbnails/` directory with 200px thumbnails (`*_thumb.png`)
- `metadata.json` with detailed image information and statistics

**Requirements:** `pip install pillow`

### PHP Contact Form Testing

Test the contact form locally:
```bash
php -S localhost:8000
```

The form submits to `submit-form.php` which processes uploads and sends emails.

## Architecture

### Image Asset Management System

**Current Asset Structure:**
- **Full Images**: `assets/images/gallery/full/*.png` - Fantasy character images with descriptive names
- **Thumbnails**: `assets/images/gallery/thumbs/*-thumb.png` - 200px optimized previews
- **Logos**: `assets/images/logos/seed13-*.jpg` - Branding assets
- **Metadata**: `assets/images/gallery/metadata.json` - Comprehensive image data

**Image Naming Convention:**
- Full images use descriptive names (e.g., `businessman-headshot.png`, `medieval-archer-warrior.png`)
- Thumbnails append `-thumb` suffix before extension
- Images are 1024×1536 pixels, typically 2-3MB each

### Web Gallery System

**Frontend Architecture:**
- Single-file HTML/CSS/JavaScript (no frameworks) for maximum compatibility
- Responsive grid layout with CSS custom properties
- Modal lightbox viewer with keyboard navigation
- Professional business theme with contact form integration

**JavaScript Components:**
- Hardcoded image array in `index.html` (lines 136-161) contains gallery data
- Dynamic gallery generation from image configuration
- Lightbox navigation with keyboard controls (arrow keys, escape)
- Client-side form validation for file uploads (3 files max, 5MB each)

**Image Configuration:**
Each image object contains:
- `fn`: filename without extension
- `title`: display name
- `desc`: description shown on hover

**Path Configuration:**
- Base path: `assets/gallery/`
- Thumbnails: `thumbs/`
- Full images: `full/`
- Extension: `.png`

### Contact Form System

**Form Processing:**
- `submit-form.php` handles form submissions
- Uploads to `uploads/` directory with unique filenames
- Sends email to `seed13@seed13productions.com`
- Redirects to `thank-you.html` on success

**Form Features:**
- File upload limit: 3 files, 5MB each
- Accepts PNG/JPG formats
- Style selection populated from gallery images
- Server-side PHP processing with basic sanitization

## File Dependencies

### Python Script
- **PIL (Pillow)**: Image processing and thumbnail generation
- **Standard library**: `os`, `json`, `datetime`, `glob`

### Web Gallery
- **External**: Google Fonts (Poppins)
- **Self-contained**: All CSS and JavaScript embedded in single HTML file
- **PHP**: Contact form processing requires PHP-enabled server

### Image Management
- Images must be placed in `assets/images/gallery/full/`
- Thumbnails generated in `assets/images/gallery/thumbs/`
- Gallery configuration requires manual updates to JavaScript array in `index.html`

## Content Management

### Adding New Images

1. Place full-size PNG in `assets/images/gallery/full/`
2. Generate thumbnail: `cd resources/ && python generate_thumbnails_and_metadata.py`
3. Update image array in `index.html` (lines 136-161)
4. Add entry to `resources/Image_captions.txt` for reference

### Updating Gallery Configuration

The gallery is configured via hardcoded JavaScript array in `index.html`. Each entry requires:
- Filename without extension
- Display title
- Description for hover overlay

**Example:**
```javascript
{fn:'new-character-name',title:'Display Name',desc:'Hover description'}
```