import axios from "axios";

export const checkSafeBrowsing = async (domain) => {
  try {
    if (!process.env.GOOGLE_SAFE_BROWSING_API_KEY) {
      return { error: "Google Safe Browsing API key missing" };
    }

    const url = `https://${domain}`;

    const body = {
      client: {
        clientId: "web-osint-scanner",
        clientVersion: "1.0.0"
      },
      threatInfo: {
        threatTypes: [
          "MALWARE",
          "SOCIAL_ENGINEERING",
          "UNWANTED_SOFTWARE",
          "POTENTIALLY_HARMFUL_APPLICATION"
        ],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url }]
      }
    };

    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_API_KEY}`,
      body,
      { timeout: 10000 }
    );

    return {
      safe: !response.data.matches,
      matches: response.data.matches || []
    };
  } catch (error) {
    return {
      error: error.response?.data || error.message
    };
  }
};