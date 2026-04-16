const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const gif = require('gif-parse');

const downloads = `${process.env.USERPROFILE}/Downloads`;
const output = `${__dirname}/public/game/sprites`;

const gifFiles = [
  { name: 'shirtless_martial_artist_fighter_with_red_headband_rotations_8dir.gif', prefix: 'liukang' },
  { name: 'thunder_god_warrior_with_white_robe_and_straw_hat_rotations_8dir.gif', prefix: 'raiden' }
];

async function extractGifs() {
  console.log('🎬 Starting GIF extraction with Jimp...\n');

  for (const gifFile of gifFiles) {
    const gifPath = path.join(downloads, gifFile.name);
    
    if (!fs.existsSync(gifPath)) {
      console.log(`❌ Not found: ${gifPath}`);
      continue;
    }

    try {
      console.log(`📂 Processing: ${gifFile.name}`);
      
      // Read GIF file
      const gifData = fs.readFileSync(gifPath);
      
      // For now, just copy as placeholder
      // Note: Full GIF parsing is complex
      console.log(`   ✅ Found GIF (size: ${gifData.length} bytes)`);
      console.log(`   📝 Note: Manual frame extraction recommended for best quality\n`);
      
    } catch (err) {
      console.error(`❌ Error:`, err.message);
    }
  }
}

extractGifs();
