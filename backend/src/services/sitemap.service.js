import axios from "axios";
import * as cheerio from "cheerio";

export const getSitemap = async (domain) => {
  const urls = [
    `https://${domain}/sitemap.xml`,
    `https://${domain}/sitemap_index.xml`,
    `https://${domain}/page-sitemap.xml`
  ];

  for (const url of urls) {
    try {
      const response = await axios.get(url, {
        timeout: 7000,
        validateStatus: () => true
      });

      if (response.status === 200) {
        const $ = cheerio.load(response.data, { xmlMode: true });
        const links = [];

        $("loc").each((_, el) => {
          links.push($(el).text());
        });

        return {
          found: true,
          sitemapUrl: url,
          pages: links.slice(0, 100)
        };
      }
    } catch {}
  }

  return {
    found: false,
    pages: []
  };
};