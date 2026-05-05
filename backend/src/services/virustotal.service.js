import axios from "axios";

export const getVirusTotalReport = async (domain) => {
  try {
    if (!process.env.VIRUSTOTAL_API_KEY) {
      return { error: "VirusTotal API key missing" };
    }

    const response = await axios.get(
      `https://www.virustotal.com/api/v3/domains/${domain}`,
      {
        headers: {
          "x-apikey": process.env.VIRUSTOTAL_API_KEY
        },
        timeout: 10000
      }
    );

    const stats = response.data?.data?.attributes?.last_analysis_stats;

    return {
      reputation: response.data?.data?.attributes?.reputation,
      stats,
      categories: response.data?.data?.attributes?.categories
    };
  } catch (error) {
    return {
      error: error.response?.data || error.message
    };
  }
};