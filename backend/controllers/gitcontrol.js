const axios = require('axios');//for reaching github
const cheerio = require('cheerio');//text parsing

const uploader = async (req, res) => {
    const { url } = req.body;
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' } 
        });
        const html = response.data;

        const $ = cheerio.load(html);

        const pageTitle = $('title').text();
        const mainHeading = $('h1').text().trim();

        res.status(200).json({ 
            message: "Link read successfully!", 
            url: url,
            scrapedData: {
                title: pageTitle,
                heading: mainHeading
            }
        });

    } catch (error) {
        console.error("Error reading the link:", error.message);
        res.status(500).json({error: "Failed to read the link."});
    }
};

module.exports = { uploader };