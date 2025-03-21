/**
 * Script to generate location images using OpenAI's DALL-E API
 * 
 * Usage:
 * 1. Set your OpenAI API key in the OPENAI_API_KEY environment variable
 * 2. Run: node generate-location-images.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const locationPacks = require('../server/src/data/locations');

const OUTPUT_DIR = path.join(__dirname, '../client/public/images/locations');
const IMAGE_SIZE = '1024x1024'; // Options: 256x256, 512x512, 1024x1024 
const IMAGE_STYLE = 'natural'; // Options: natural, vivid
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Created directory: ${directory}`);
  }
}

function generatePrompt(location, packId) {
  return `Generate a simple cartoonish style image that accurately represents a ${location}.`;
}

async function generateImage(prompt, outputPath) {
  if (!OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is not set');
    process.exit(1);
  }
  
  try {
    console.log(`Generating image for prompt: ${prompt}`);
    
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: IMAGE_SIZE,
        style: IMAGE_STYLE,
        response_format: 'url'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    
    const imageUrl = response.data.data[0].url;
    
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(outputPath, imageResponse.data);
    
    console.log(`Image saved to: ${outputPath}`);
    return true;
  } catch (error) {
    console.error('Error generating image:', error.response?.data || error.message);
    return false;
  }
}

async function main() {
  if (!OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is not set');
    process.exit(1);
  }
  
  ensureDirectoryExists(OUTPUT_DIR);
  
  for (const [packId, pack] of Object.entries(locationPacks)) {
    console.log(`\nProcessing pack: ${pack.name}`);
    
    const packDir = path.join(OUTPUT_DIR, packId);
    ensureDirectoryExists(packDir);
    
    for (const location of pack.locations) {
      const sanitizedName = location.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const outputPath = path.join(packDir, `${sanitizedName}.png`);
      
      if (fs.existsSync(outputPath)) {
        console.log(`Image for ${location} already exists, skipping...`);
        continue;
      }
      
      const prompt = generatePrompt(location, packId);
      const success = await generateImage(prompt, outputPath);
      
      if (success) {
        console.log(`Generated image for ${location}`);
      } else {
        console.error(`Failed to generate image for ${location}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\nImage generation complete!');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});