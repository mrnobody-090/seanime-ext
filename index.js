/**
 * Seanime Online Streaming Extension
 * Logic adapted from custom Python CLI tool
 */

function search(query) {
    const sites = {
        "pornhub": {
            base: "https://www.pornhub.com",
            searchPath: "/video/search?search=",
            item: "li.pcVideoListItem",
            title: "a.thumbnailTitle",
            link: "a.thumbnailTitle",
            thumb: "img.js-videoThumb"
        },
        "1porn": {
            base: "https://www.1porn.tv",
            searchPath: "/search/",
            suffix: "/1/",
            item: "div.item",
            title: "strong.title",
            link: "a.thumb_title",
            thumb: "img.thumb"
        }
    };

    let allResults = [];

    for (let name in sites) {
        let site = sites[name];
        try {
            // Construct search URL
            let searchUrl = site.base + site.searchPath + encodeURIComponent(query) + (site.suffix || "");
            
            // Use Seanime internal HTTP helper
            let response = http.get(searchUrl);
            if (!response || !response.body) continue;

            let doc = dom.parse(response.body);
            let items = doc.querySelectorAll(site.item);

            items.forEach(el => {
                let titleEl = el.querySelector(site.title);
                let linkEl = el.querySelector(site.link);
                let thumbEl = el.querySelector(site.thumb);

                if (titleEl && linkEl) {
                    let rawLink = linkEl.attr("href");
                    let finalLink = rawLink.startsWith("http") ? rawLink : site.base + rawLink;
                    
                    let thumbSrc = "";
                    if (thumbEl) {
                        thumbSrc = thumbEl.attr("src") || thumbEl.attr("data-src") || "";
                    }

                    allResults.push({
                        title: "[" + name.toUpperCase() + "] " + titleEl.text().trim(),
                        url: finalLink,
                        image: thumbSrc,
                        description: "Source: " + name
                    });
                }
            });
        } catch (e) {
            console.log("Error fetching from " + name + ": " + e);
        }
    }
    return allResults;
}

/**
 * Required for the 'Play' button to appear in Seanime
 */
function info(url) {
    return {
        videos: [
            {
                url: url,
                quality: "Standard",
                type: "video"
            }
        ]
    };
}
