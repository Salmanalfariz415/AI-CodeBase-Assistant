const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Takes an array of text chunks, generates vector embeddings using OpenAI,
 * and attaches the vectors directly to each chunk object.
 */
async function generateEmbeddings(chunks) {
    try {
        if (!chunks || chunks.length === 0) {
            console.log("No chunks provided for embedding.");
            return [];
        }

        console.log(`Generating embeddings for ${chunks.length} chunks...`);

        // 1. Extract just the raw text content from each chunk object
        const textInputs = chunks.map(chunk => chunk.content);

        // 2. Open API is used to perform the embedding.
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small', // Outputs a 1536-dimension vector
            input: textInputs,
        });

        // 3. Map the generated vectors back to their original chunk objects
        // Creates a property for chunk called "embedding" and adds the embedding into it.
        const chunksWithEmbeddings = chunks.map((chunk, index) => {
            return {
                ...chunk,
                embedding: embeddingResponse.data[index].embedding // The array of numbers (Embedding)
            };
        });

        console.log("Embeddings generated successfully!");
        return chunksWithEmbeddings;

    } catch (error) {
        console.error("Error generating embeddings:", error.message);
        throw error;
    }
}

module.exports = { generateEmbeddings };