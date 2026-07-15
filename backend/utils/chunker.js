const fs = require('fs');
const path = require('path');


function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);//returns an array of files and folders

    files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        
        //skip these
        if (file === '.git' || file === 'node_modules') return;

        if (fs.statSync(filePath).isDirectory()) {
            arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
        } else {
            // Only process text-based code files (adjust extensions as needed)
            const ext = path.extname(filePath);
            if (['.js', '.ts', '.py', '.json', '.html', '.css', '.md'].includes(ext)) {
                arrayOfFiles.push(filePath);
            }
        }
    });

    return arrayOfFiles;
}

function chunkFileContent(filePath, chunkSize = 1000, chunkOverlap = 200) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const chunks = [];//array is made
    let i = 0;

    // Sliding window is used
    while (i < content.length) {
        const chunk = content.substring(i, i + chunkSize);
        //in js, arrays hold objects with key and val pair
        chunks.push({
            id: `${path.basename(filePath)}-chunk-${i}`, // Unique ID for the DB
            content: chunk,// The raw code string to embed
            metadata: {
                fileName: path.basename(filePath),
                filePath: filePath,// Helps the AI tell you exactly where the code is
                language: path.extname(filePath).substring(1), // e.g., 'js', 'py' 
                startIndex: i
            }
        });
        // Move forward i by chunk size minus overlap to keep context continuous
        i += (chunkSize - chunkOverlap);
    }

    return chunks;
}

module.exports = { getAllFiles, chunkFileContent };