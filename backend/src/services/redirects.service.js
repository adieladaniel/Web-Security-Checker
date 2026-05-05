import axios from "axios";

export const getRedirects = async (domain) => {
  const url = `http://${domain}`;

  try {
    const redirects = [];

    await axios.get(url, {
      timeout: 10000,
      maxRedirects: 10,
      validateStatus: () => true,
      beforeRedirect: (options, responseDetails) => {
        redirects.push({
          statusCode: responseDetails.statusCode,
          location: responseDetails.headers.location
        });
      }
    });

    return redirects;
  } catch (error) {
    return {
      error: error.message
    };
  }
};