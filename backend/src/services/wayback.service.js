import axios from "axios";

export const getWaybackHistory = async (domain) => {
  try {
    const response = await axios.get(
      "https://web.archive.org/cdx/search/cdx",
      {
        params: {
          url: domain,
          output: "json",
          fl: "timestamp,original,statuscode,mimetype",
          collapse: "timestamp:8",
          limit: 20
        },
        timeout: 10000
      }
    );

    const rows = response.data;

    if (!Array.isArray(rows) || rows.length <= 1) {
      return {
        total: 0,
        captures: []
      };
    }

    const captures = rows.slice(1).map((row) => ({
      timestamp: row[0],
      original: row[1],
      statusCode: row[2],
      mimeType: row[3]
    }));

    return {
      total: captures.length,
      first: captures[0],
      last: captures[captures.length - 1],
      captures
    };
  } catch (error) {
    return {
      error: error.message
    };
  }
};