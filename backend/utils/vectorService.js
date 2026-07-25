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
                startIndex: chunk.metadata.startIndex,
                repositoryId: chunk.metadata.repositoryId
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

async function searchSimilarChunks(userQuery, limit = 5, similarityThreshold = 0.5, repositoryId = null) {
    try {
        console.log(`Embedding user query: "${userQuery}"` + (repositoryId ? ` for repo: ${repositoryId.substring(0, 50)}...` : ''));

        // 1. Generate the vector for the user's query (Must use the exact same model!)
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: userQuery,
        });
        const queryVector = embeddingResponse.data[0].embedding;

        // 2. Call the Postgres function 'match_code_chunks' created inside Supabase
        const { data, error } = await supabase.rpc('match_code_chunks', {
            query_embedding: queryVector,
            match_threshold: similarityThreshold, // e.g. 0.5 (only return semi-relevant results)
            match_count: limit * 2  // Get more to filter by repo
        });

        if (error) throw error;

        // Filter by repositoryId if provided
        let results = data || [];
        if (repositoryId) {
            results = results.filter(chunk => {
                const metadata = typeof chunk.metadata === 'string' ? JSON.parse(chunk.metadata) : chunk.metadata;
                return metadata.repositoryId === repositoryId;
            });
        }

        // Return only the requested limit
        return results.slice(0, limit);

    } catch (error) {
        console.error("Search pipeline error:", error.message);
        throw error;
    }
}

async function clearDatabase() {
    try {
        console.log("[VECTOR_SERVICE] Clearing all chunks from database...");
        
        // Delete all records from code_chunks table
        const { error } = await supabase
            .from('code_chunks')
            .delete()
            .gte('id', 0); // This deletes all rows (id >= 0 matches everything)
        
        if (error) {
            throw new Error(`Failed to clear database: ${error.message}`);
        }
        
        console.log("[VECTOR_SERVICE] Database cleared successfully!");
        return true;
    } catch (error) {
        console.error("Error clearing database:", error.message);
        throw error;
    }
}

module.exports = { generateEmbeddings, storeInSupabase, searchSimilarChunks, clearDatabase };