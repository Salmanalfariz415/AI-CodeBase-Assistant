const {exec}=require('child_process');
const path = require('path');

const uploader = async (req, res) => {
    const { url } = req.body;
    const folderName = `repo-${Date.now()}`;
    const targetPath = path.join(__dirname, '../cloned_repos', folderName);
    const command = `git clone ${url} ${targetPath}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec Error: ${error.message}`);
            return res.status(500).json({ 
                error: "Failed to clone repository.",
                details: error.message 
            });
        }
        res.status(200).json({
            message: "Repository successfully cloned",
            folderName: folderName,
            localPath: targetPath
        });
    });
    
};

module.exports = { uploader };