const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const { getAllFiles, chunkFileContent } = require('../utils/chunker');
const { generateEmbeddings, storeInSupabase, clearDatabase } = require('../utils/vectorService');
const { generateReadme } = require('../utils/readmeGenerator');

const uploader = (req, res) => {
    const { url } = req.body;
    const targetPath = path.join(__dirname, '../cloned_repos', `repo-${Date.now()}`);

    console.log(`[UPLOADER] Starting clone of ${url} to ${targetPath}`);

    // Use execFile instead of exec to avoid shell quoting issues with paths containing spaces
    execFile('git', ['clone', '--depth', '1', url, targetPath], (error, stdout, stderr) => {
        if (error) {
            console.error('[UPLOADER] Git clone error:', stderr || error.message);
            return res.status(500).json({ error: "Clone failed", details: stderr || error.message });
        }

        console.log(`[UPLOADER] Clone completed successfully`);

        // Handle async operations properly
        (async () => {
            try {
                // Step 0: Clear database for fresh analysis
                console.log('[UPLOADER] Clearing database for fresh analysis...');
                await clearDatabase();
                
                console.log('[UPLOADER] Getting all files...');
                const allFiles = getAllFiles(targetPath);
                console.log(`[UPLOADER] Found ${allFiles.length} files`);

                let allRepositoryChunks = [];
                allFiles.forEach(filePath => {
                    const fileChunks = chunkFileContent(filePath);
                    console.log(`[UPLOADER] File ${filePath}: ${fileChunks.length} chunks`);
                    allRepositoryChunks.push(...fileChunks);
                });
                console.log(`[UPLOADER] Total chunks: ${allRepositoryChunks.length}`);

                // Add repositoryId to each chunk for filtering during search
                const repositoryId = url; // Use URL as unique repository identifier
                const chunksWithRepoId = allRepositoryChunks.map(chunk => ({
                    ...chunk,
                    metadata: {
                        ...chunk.metadata,
                        repositoryId: repositoryId
                    }
                }));

                console.log('[UPLOADER] Generating embeddings...');
                const embeddedChunks = await generateEmbeddings(chunksWithRepoId);
                console.log(`[UPLOADER] Generated embeddings for ${embeddedChunks.length} chunks`);

                console.log('[UPLOADER] Storing in Supabase...');
                await storeInSupabase(embeddedChunks);
                console.log('[UPLOADER] Successfully stored in Supabase');

                // Extract repo info from package.json if available
                let repoInfo = {
                    name: "Unknown",
                    description: "No description",
                    url: url,
                    stars: 0,
                    forks: 0,
                    issues: 0,
                    language: "Mixed"
                };

                try {
                    const pkgPath = path.join(targetPath, 'package.json');
                    if (fs.existsSync(pkgPath)) {
                        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
                        repoInfo.name = pkg.name || "Unknown";
                        repoInfo.description = pkg.description || "No description";
                    }
                } catch (e) {
                    console.log('[UPLOADER] Could not read package.json');
                }

                // Step 5: AI - Generate README
                console.log('[UPLOADER] Generating AI-powered README with semantic search...');
                let generatedReadme = null;
                try {
                    generatedReadme = await generateReadme(repoInfo, repositoryId);
                    
                    // Save README to cloned repo folder
                    const readmePath = path.join(targetPath, 'GENERATED_README.md');
                    fs.writeFileSync(readmePath, generatedReadme, 'utf-8');
                    console.log('[UPLOADER] README saved to:', readmePath);
                } catch (readmeError) {
                    console.error('[UPLOADER] README generation failed:', readmeError.message);
                    generatedReadme = null; // Don't fail the entire pipeline
                }

                res.status(200).json({
                    ...repoInfo,
                    message: "Repository successfully processed!",
                    totalChunksStored: embeddedChunks.length,
                    generatedReadme: generatedReadme
                });

            } catch (pipelineError) {
                console.error('[UPLOADER] Pipeline error:', pipelineError.message);
                console.error('[UPLOADER] Stack:', pipelineError.stack);
                res.status(500).json({ error: "Pipeline failed", details: pipelineError.message });
            }
        })();
    });
};

module.exports = { uploader };