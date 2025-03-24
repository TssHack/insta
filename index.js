const express = require("express");
const axios = require("axios");
const { JSDOM } = require("jsdom");

const app = express();
const PORT = 3000;

app.use(express.json());

function mimeType(url) {
    return url.includes(".jpg") || url.includes(".webp") ? "photo" : "video";
}

async function fetchDownloadLinks(html) {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const links = document.querySelectorAll('a[download="true"]');

    return Array.from(links).map(link => ({
        type: mimeType(link.href),
        media: link.href
    }));
}

async function postData(url) {
    try {
        const postData = new URLSearchParams({
            url: url,
            ajax: "1",
            lang: "en"
        });

        const { data } = await axios.post("https://ins1d.net/mates/en/analyze/ajax?retry=undefined&platform=instagram", postData, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36",
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
                "Referer": "https://ins1d.net/"
            }
        });

        return data.result;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

app.get("/ehsan", async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: "URL parameter is required" });
    }

    const postResponse = await postData(url);
    if (!postResponse) {
        return res.status(500).json({ error: "Failed to fetch data" });
    }

    const result = await fetchDownloadLinks(postResponse);
    res.json({
        dev: "ehsan fazli",
        id: "@abj0o",
        data: result
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
