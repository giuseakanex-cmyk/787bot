'use strict';

const fs = require('fs');
const path = require('path');

// Function to normalize content
function normalizeContent(content) {
    return content.replace(/[^0-9A-Za-z\s\p{Emoji}\p{L}]/gu, '');
}

// Function to read all plugin files
function normalizePluginsInDir(directory) {
    fs.readdirSync(directory).forEach(file => {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Recursively normalize plugins in subdirectories
            normalizePluginsInDir(filePath);
        } else if (file.endsWith('.js')) { // Assuming plugins are JavaScript files
            const content = fs.readFileSync(filePath, 'utf-8');
            const normalizedContent = normalizeContent(content);
            fs.writeFileSync(filePath, normalizedContent, 'utf-8');
            console.log(`Normalized: ${filePath}`);
        }
    });
}

// Start normalizing from the current directory
normalizePluginsInDir(__dirname);
