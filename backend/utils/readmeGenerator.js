const { OpenAI } = require('openai');
const { generateEmbeddings, searchSimilarChunks } = require('./vectorService');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a comprehensive README for the repository using AI
 * Uses semantic search to find the most relevant code chunks
 */
async function generateReadme(repoMetadata, repositoryId) {
    try {
        console.log('[README_GEN] Starting README generation with semantic search...');

        // Create a comprehensive query to find relevant code
        const searchQueries = [
            "main entry point server setup initialization",
            "API routes endpoints controllers",
            "configuration environment variables",
            "database models schemas",
            "authentication authorization middleware",
            "core business logic implementation",
            "utilities helper functions",
            "dependencies imports packages"
        ];

        console.log('[README_GEN] Searching for relevant code chunks...');
        
        // Search for relevant chunks for each query, filtered by repository
        let relevantChunks = [];
        for (const query of searchQueries) {
            try {
                const results = await searchSimilarChunks(query, 5, 0.3, repositoryId);
                if (results && results.length > 0) {
                    relevantChunks.push(...results);
                }
            } catch (e) {
                console.log(`[README_GEN] Search for "${query}" had issues, continuing...`);
            }
        }

        // Remove duplicates and limit to top 50 chunks
        const uniqueChunks = Array.from(
            new Map(relevantChunks.map(chunk => [chunk.id, chunk])).values()
        ).slice(0, 50);

        console.log(`[README_GEN] Found ${uniqueChunks.length} relevant code chunks via semantic search`);

        // Build context from semantically relevant chunks
        const chunkContext = uniqueChunks
            .map(chunk => {
                const metadata = typeof chunk.metadata === 'string' 
                    ? JSON.parse(chunk.metadata) 
                    : chunk.metadata;
                return `\n[${metadata.fileName || 'unknown'}]\n${chunk.content.substring(0, 500)}...`;
            })
            .join('\n\n');

        const prompt = `You are an expert technical writer and software documentation specialist. Your task is to analyze the entire GitHub repository provided to you and generate a comprehensive, professional README.md file.

**INSTRUCTIONS:**

1. **Analyze the Repository:**
   - Read ALL files in the repository (source code, configuration files, package manifests, tests, etc.)
   - Identify the programming language(s), framework(s), and dependencies used
   - Understand the project structure and architecture
   - Determine the primary purpose and functionality of the code
   - Look for entry points (main files, index files, app files)
   - Check for existing documentation, comments, or previous README files

2. **Generate a Complete README.md with these sections:**

   **# Project Title**
   - A clear, descriptive name based on the project purpose

   **## Description / Overview**
   - What does this project do? (2-3 paragraphs)
   - Key features and functionalities
   - Problem it solves or purpose it serves

   **## Table of Contents** (optional but recommended for large READMEs)

   **## 🚀 Getting Started**
   - Prerequisites (what needs to be installed)
   - Installation steps
   - Configuration instructions (if any)

   **## 💻 Usage**
   - How to run the project
   - Basic commands with examples
   - API endpoints or function usage (if applicable)

   **## 📁 Project Structure**
   - Brief explanation of folder/file organization
   - Key files and their purposes

   **## 🛠️ Built With**
   - Technologies, frameworks, libraries used
   - Version information if available

   **## 📦 Dependencies**
   - List of main dependencies (from package.json, requirements.txt, go.mod, Cargo.toml, etc.)
   - Development dependencies (if applicable)

   **## ⚙️ Configuration**
   - Environment variables needed
   - Configuration files explained
   - Sample configuration (if any)

   **## 🧪 Testing**
   - How to run tests
   - Test framework used

   **## 🤝 Contributing**
   - Guidelines for contributing (if applicable)
   - Code style, branch naming, PR process

   **## 📄 License**
   - Identify the license from the repo (check LICENSE file)
   - If none found, suggest adding one

   **## 👥 Authors/Maintainers**
   - If identifiable from code comments, git history, or package.json

   **## 🙏 Acknowledgments** (optional)
   - Credits, inspirations, or resources used

3. **Style Guidelines:**
   - Use proper Markdown formatting
   - Add badges (if relevant - build status, coverage, version, etc.)
   - Use emojis sparingly for visual appeal
   - Keep a professional but approachable tone
   - Include code blocks with language syntax highlighting
   - Make it scannable with clear headings and bullet points

4. **⚠️ IMPORTANT RULES:**
   - Base everything on ACTUAL code found in the repository - DO NOT invent features
   - If information is missing (like license or authors), clearly state that it wasn't found and suggest adding it
   - Extract real examples from the code when showing usage
   - Ensure all commands and code snippets are accurate and working
   - If there are multiple languages/frameworks, handle accordingly
   - For web apps: mention the port, endpoints, and how to access
   - For libraries: include installation via package managers
   - For CLI tools: show command examples

5. **Final Output:**
   - Provide ONLY the README.md content
   - Do not include analysis or commentary outside the README
   - Make it ready to copy-paste directly into a README.md file

**REPOSITORY CONTEXT** (semantically relevant code chunks):
${chunkContext}

**Repository Name:** ${repoMetadata.name}
**Repository URL:** ${repoMetadata.url}

Now generate the comprehensive README.md file:`;

        console.log('[README_GEN] Sending prompt with semantic search results to OpenAI...');

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert technical writer who creates clear, professional README documentation for software projects based on actual codebase analysis.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 3000,
            temperature: 0.7
        });

        const generatedReadme = response.choices[0].message.content;
        console.log('[README_GEN] README generated successfully using semantic search!');

        return generatedReadme;

    } catch (error) {
        console.error('[README_GEN] Error generating README:', error.message);
        throw new Error(`Failed to generate README: ${error.message}`);
    }
}

module.exports = { generateReadme };
