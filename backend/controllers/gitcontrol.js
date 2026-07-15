const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const { embedAndStoreChunks } = require('../utils/vectorService');
const { getAllFiles, chunkFileContent } = require('../utils/chunker'); 

const uploader = (req, res) => {
    const { url } = req.body;
    const baseClonePath = path.join(__dirname, '../cloned_repos');
    const folderName = `repo-${Date.now()}`;
    const targetPath = path.join(baseClonePath, folderName);

    if (!fs.existsSync(baseClonePath)){
        fs.mkdirSync(baseClonePath, { recursive: true });
    }

   //running terminal command
    exec(`git clone --depth 1 ${url} ${targetPath}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: "Clone failed", details: error.message });
        }
        
        try {
            // get files
            const allFiles = getAllFiles(targetPath);
            let allRepositoryChunks = [];//array

            //chunk them
            allFiles.forEach(filePath => {
                const fileChunks = chunkFileContent(filePath);
                allRepositoryChunks.push(...fileChunks);
            });

            //embedding and storing into vector databases
            await embedAndStoreChunks(allRepositoryChunks);

            res.status(200).json({
                message: "Repository cloned and chunked successfully!",
                totalChunks: allRepositoryChunks.length,
                chunks: allRepositoryChunks 
            });

        } catch (err) {
            res.status(500).json({ error: "Chunking failed", details: err.message });
        }
    });
};

module.exports = { uploader };