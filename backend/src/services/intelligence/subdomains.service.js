import axios from "axios";

const fetchCrtSh = async (query) => {
  const res = await axios.get("https://crt.sh/", {
    params: {
      q: query,
      output: "json"
    },
    timeout: 20000,
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  return Array.isArray(res.data) ? res.data : [];
};

export const getSubdomains = async (domain) => {
  try {
    let rows = [];

    try {
      rows = await fetchCrtSh(`%.${domain}`);
    } catch {
      rows = await fetchCrtSh(domain);
    }

    const unique = new Set();

    rows.forEach((item) => {
      if (!item.name_value) return;

      item.name_value.split("\n").forEach((name) => {
        const clean = name.replace("*.", "").trim().toLowerCase();

        if (clean.endsWith(domain) && clean !== domain) {
          unique.add(clean);
        }
      });
    });

    const subdomains = [...unique].sort();

    const risky = subdomains.filter((s) =>
      ["admin", "dev", "test", "staging", "api", "portal", "dashboard", "login"].some(
        (word) => s.includes(word)
      )
    );

    return {
      total: subdomains.length,
      subdomains: subdomains.slice(0, 50),
      risky
    };
  } catch (error) {
    return {
      total: 0,
      subdomains: [],
      risky: [],
      source: "crt.sh",
      error: "Subdomain source unavailable or rate limited"
    };
  }
};