const { searchSimilarChunks } = require('../utils/vectorService');

const searchCode = async (req, res) => {
    const { query } = req.body; 

    if (!query) {
        return res.status(400).json({ error: "Please provide a search query." });
    }

    try {
        // Search the top 3 most relevant code blocks
        const searchResults = await searchSimilarChunks(query, 3, 0.4);

        res.status(200).json({
            message: "Search completed!",
            results: searchResults
        });
    } catch (error) {
        res.status(500).json({ error: "Search failed", details: error.message });
    }
};

module.exports = { searchCode };