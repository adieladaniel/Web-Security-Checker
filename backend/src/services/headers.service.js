import axios from "axios";

export const getHeaders = async (url) => {
  try {
    const start = Date.now();

    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: () => true
    });

    const responseTime = Date.now() - start;

    return {
      status: response.status,
      responseTime,
      headers: response.headers,
      securityHeaders: {
        contentSecurityPolicy: response.headers["content-security-policy"] || null,
        strictTransportSecurity: response.headers["strict-transport-security"] || null,
        xFrameOptions: response.headers["x-frame-options"] || null,
        xContentTypeOptions: response.headers["x-content-type-options"] || null,
        referrerPolicy: response.headers["referrer-policy"] || null,
        permissionsPolicy: response.headers["permissions-policy"] || null
      }
    };
  } catch (error) {
    return {
      error: error.message
    };
  }
};