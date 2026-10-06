const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function createIcons() {
    const inputImagePath = path.join(__dirname, 'public', 'logotipo.png');
    // Using a charcoal background color for the icon #282f32
    const bg = { r: 40, g: 47, b: 50, alpha: 1 }; 

    if (!fs.existsSync(inputImagePath)) {
        console.error('Input image not found:', inputImagePath);
        return;
    }

    try {
        await sharp(inputImagePath)
            .resize(192, 192, {
                fit: 'contain',
                background: bg
            })
            .toFile(path.join(__dirname, 'public', 'icon-192x192.png'));

        await sharp(inputImagePath)
            .resize(512, 512, {
                fit: 'contain',
                background: bg
            })
            .toFile(path.join(__dirname, 'public', 'icon-512x512.png'));

        await sharp(inputImagePath)
            .resize(180, 180, {
                fit: 'contain',
                background: bg
            })
            .toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));

        console.log('PWA icons created successfully!');
    } catch (err) {
        console.error('Error creating icons:', err);
    }
}

createIcons();
