const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);


async function generateEmbeddings(chunks) {
    try {
        if (!chunks || chunks.length === 0) {
            console.log("No chunks provided for embedding.");
            return [];
        }

        console.log(`Generating embeddings for ${chunks.length} chunks...`);

        const textInputs = chunks.map(chunk => chunk.content);
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small', // Outputs a 1536-dimension vector
            input: textInputs,
        });

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

async function storeInSupabase(finalizedChunks) {
    try {
        console.log(`Preparing to store ${finalizedChunks.length} chunks in Supabase...`);

        // Format the chunks to match our Postgres column structure
        const rowsToInsert = finalizedChunks.map(chunk => ({
            content: chunk.content,
            embedding: chunk.embedding, // JS array directly maps to pgvector column
            metadata: {
                fileName: chunk.metadata.fileName,
                filePath: chunk.metadata.filePath,
                language: chunk.metadata.language,
                startIndex: chunk.metadata.startIndex
            }
        }));

        // Batch insert the rows into Postgres
        const { data, error } = await supabase
            .from('code_chunks')
            .insert(rowsToInsert);

        if (error) {
            throw new Error(`Supabase DB Insert Error: ${error.message}`);
        }

        console.log("Successfully stored all chunks in Supabase pgvector!");
        return true;
    } catch (error) {
        console.error("Error in storeInSupabase:", error.message);
        throw error;
    }
}
module.exports = { generateEmbeddings, storeInSupabase };