const gifFrames = require('gif-frames');
const fs = require('fs');
const path = require('path');

// Configuration
const downloads = `${process.env.USERPROFILE}/Downloads`;
const output = `${__dirname}/public/game/sprites`;

// GIF files to extract
const gifFiles = [
  {
    name: 'shirtless_martial_artist_fighter_with_red_headband_rotations_8dir.gif',
    prefix: 'liukang', // PYROVEX
  },
  {
    name: 'thunder_god_warrior_with_white_robe_and_straw_hat_rotations_8dir.gif',
    prefix: 'raiden', // VOLTRAX
  }
];

async function extractGifs() {
  console.log('🎬 Starting GIF extraction...\n');

  for (const gif of gifFiles) {
    const gifPath = path.join(downloads, gif.name);
    
    if (!fs.existsSync(gifPath)) {
      console.log(`❌ File not found: ${gifPath}`);
      continue;
    }

    console.log(`📂 Extracting: ${gif.name}`);
    console.log(`   → Prefix: ${gif.prefix}`);

    try {
      const frames = await gifFrames({ url: gifPath, frames: 'all' });
      
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const outputPath = path.join(output, `${gif.prefix}_rot_${i}.png`);
        
        // Save frame as PNG
        const buffer = await frame.getImage();
        fs.writeFileSync(outputPath, buffer);
        console.log(`   ✅ Frame ${i}: ${gif.prefix}_rot_${i}.png`);
      }

      console.log(`✅ Extracted ${frames.length} frames from ${gif.name}\n`);
    } catch (err) {
      console.error(`❌ Error extracting ${gif.name}:`, err.message);
    }
  }

  console.log('🎉 All GIFs extracted!');
}

extractGifs();
