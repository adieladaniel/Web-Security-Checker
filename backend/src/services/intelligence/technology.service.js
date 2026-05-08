import axios from "axios";

export const detectTechnologies = async (domain, headers = {}) => {
  const technologies = new Set();

  const server = headers.server || "";
  const poweredBy = headers["x-powered-by"] || "";

  if (server.toLowerCase().includes("apache")) technologies.add("Apache");
  if (server.toLowerCase().includes("nginx")) technologies.add("Nginx");
  if (server.toLowerCase().includes("iis")) technologies.add("Microsoft IIS");
  if (poweredBy) technologies.add(poweredBy);

  try {
    const response = await axios.get(`https://${domain}`, {
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: () => true,
        headers: {
            "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36"
        }
        });

    const html = String(response.data).toLowerCase();

    if (html.includes("wp-content")) technologies.add("WordPress");
    if (html.includes("react")) technologies.add("React");
    if (html.includes("next/static")) technologies.add("Next.js");
    if (html.includes("vue")) technologies.add("Vue.js");
    if (html.includes("angular")) technologies.add("Angular");
    if (html.includes("jquery")) technologies.add("jQuery");
    if (html.includes("bootstrap")) technologies.add("Bootstrap");
    if (html.includes("google-analytics") || html.includes("gtag")) {
      technologies.add("Google Analytics");
    }
    if (html.includes("cloudflare")) technologies.add("Cloudflare");
    if (html.includes("php")) technologies.add("PHP");

    const generatorMatch = html.match(
      /<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i
    );

    if (generatorMatch?.[1]) {
      technologies.add(generatorMatch[1]);
    }

    return {
      total: technologies.size,
      technologies: [...technologies]
    };
  } catch (error) {
    return {
      total: technologies.size,
      technologies: [...technologies],
      error: error.message
    };
  }
};