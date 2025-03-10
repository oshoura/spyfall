# Spyfall Scripts

This directory contains utility scripts for the Spyfall game.

## Image Generation Script

The `generate-location-images.js` script uses OpenAI's DALL-E API to generate images for all locations in the game.

### Prerequisites

- Node.js (v14 or higher)
- An OpenAI API key with access to DALL-E

### Installation

```bash
npm install
```

### Usage

1. Set your OpenAI API key as an environment variable:

```bash
export OPENAI_API_KEY=your_api_key_here
```

2. Run the script:

```bash
npm run generate-images
```

The script will:
- Generate images for all locations in all packs
- Save the images to `client/public/images/locations/{pack_id}/{location}.png`
- Skip locations that already have images

### Configuration

You can modify these settings in the script:

- `IMAGE_SIZE`: Size of the generated images (256x256, 512x512, or 1024x1024)
- `IMAGE_STYLE`: Style of the images (natural, vivid, or cartoon)

### Notes

- The script uses the OpenAI API which has usage costs. Check OpenAI's pricing before running.
- Image generation may take some time, especially for many locations.
- The script includes a small delay between requests to avoid rate limiting. 