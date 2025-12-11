const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function convertJpegToIco() {
  try {
    const jpegPath = path.join(__dirname, 'icon.jpeg');
    const pngPath = path.join(__dirname, 'icon.png');
    const icoPath = path.join(__dirname, 'icon.ico');
    
    console.log('Converting JPEG to PNG...');
    // Read JPEG and convert to PNG
    await sharp(jpegPath)
      .resize(256, 256, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(pngPath);
    
    console.log('✓ Converted JPEG to PNG');
    console.log('Now converting PNG to ICO...');
    
    // Convert PNG to ICO using png-to-ico
    execSync(`png-to-ico "${pngPath}" > "${icoPath}"`);
    
    console.log('✓ Successfully created icon.ico');
    
    // Clean up PNG
    fs.unlinkSync(pngPath);
    console.log('✓ Icon.ico is ready for your app!');
    console.log(`Icon saved to: ${icoPath}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

convertJpegToIco();
