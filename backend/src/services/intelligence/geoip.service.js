import axios from "axios";

export const getGeoIPInfo = async (dnsData) => {
  try {
    const ip = dnsData?.A?.[0];

    if (!ip) {
      return {
        found: false,
        message: "No IPv4 address found"
      };
    }

    const response = await axios.get(`https://ipwho.is/${ip}`, {
      timeout: 10000
    });

    const data = response.data;

    if (!data.success) {
      return {
        found: false,
        ip,
        message: data.message || "GeoIP lookup failed"
      };
    }

    return {
      found: true,
      ip,
      country: data.country,
      city: data.city,
      region: data.region,
      isp: data.connection?.isp,
      org: data.connection?.org,
      asn: data.connection?.asn,
      timezone: data.timezone?.id,
      latitude: data.latitude,
      longitude: data.longitude
    };
  } catch (error) {
    return {
      found: false,
      error: error.message
    };
  }
};