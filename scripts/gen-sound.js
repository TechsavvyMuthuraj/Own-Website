const fs = require('fs');
const b64 = fs.readFileSync('public/sounds/click.mp3').toString('base64');
const content = `export const CLICK_SOUND_BASE64 = "data:audio/mp3;base64,${b64}";\n`;
fs.writeFileSync('src/lib/sound-data.ts', content, 'utf8');
console.log('sound-data.ts written successfully. Length:', content.length);
