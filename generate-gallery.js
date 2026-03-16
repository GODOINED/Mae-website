const fs = require('fs');
const path = require('path');

const galleryDir = path.join(__dirname, 'gallery');
const outputFile = path.join(__dirname, 'gallery-structure.json');

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

function scanDir(dir) {
    const result = {};
    const items = fs.readdirSync(dir);

    items.sort((a, b) => a.localeCompare(b));

    const folders = [];
    const files = [];

    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        const relativePath = path.relative(galleryDir, fullPath).replace(/\\/g, '/');

        if (stat.isDirectory()) {
            folders.push(item);
        } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            if (allowedExtensions.includes(ext)) {
                files.push(relativePath);
            }
        }
    });

    folders.forEach(folder => {
        const folderPath = path.join(dir, folder);
        result[folder] = scanDir(folderPath);
    });

    if (files.length > 0) {
        result.images = files;
    }

    return result;
}

try {
    if (!fs.existsSync(galleryDir)) {
        console.error('❌ Папка gallery не найдена!');
        process.exit(1);
    }

    const structure = scanDir(galleryDir);
    fs.writeFileSync(outputFile, JSON.stringify(structure, null, 2));
    console.log('✅ gallery-structure.json создан!');
} catch (err) {
    console.error('❌ Ошибка:', err);
}
