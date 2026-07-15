const { exec } = require('child_process');
const path = require('path');
const { getAllFiles, chunkFileContent } = require('../utils/chunker');
const { generateEmbeddings, storeInSupabase } = require('../utils/vectorService'); // Import both utilities

const uploader = (req, res) => {
    const { url } = req.body;
    const targetPath = path.join(__dirname, '../cloned_repos', `repo-${Date.now()}`);

    exec(`git clone --depth 1 ${url} ${targetPath}`, async (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: "Clone failed" });

        try {
            const allFiles = getAllFiles(targetPath);
            let allRepositoryChunks = [];
            allFiles.forEach(filePath => {
                allRepositoryChunks.push(...chunkFileContent(filePath));
            });

            const embeddedChunks = await generateEmbeddings(allRepositoryChunks);

            await storeInSupabase(embeddedChunks);

            res.status(200).json({
                message: "Repository successfully processed!",
                totalChunksStored: embeddedChunks.length
            });

        } catch (pipelineError) {
            res.status(500).json({ error: "Pipeline failed", details: pipelineError.message });
        }
    });
};

module.exports = { uploader };