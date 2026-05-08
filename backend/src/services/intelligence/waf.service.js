export const detectWAF = (headers = {}) => {
  const h = JSON.stringify(headers).toLowerCase();

  const providers = [
    {
      name: "Google Frontend / Google Edge",
      patterns: ["gws", "google frontend", "x-guploader-uploadid"]
    },
    {
      name: "Cloudflare",
      patterns: ["cf-ray", "cloudflare", "cf-cache-status"]
    },
    {
      name: "Akamai",
      patterns: ["akamai", "akamaighost"]
    },
    {
      name: "AWS CloudFront / AWS WAF",
      patterns: ["cloudfront", "x-amz-cf-id", "x-amz-cf-pop"]
    },
    {
      name: "Sucuri",
      patterns: ["sucuri", "x-sucuri-id"]
    },
    {
      name: "Imperva",
      patterns: ["imperva", "incapsula", "visid_incap"]
    },
    {
      name: "Fastly",
      patterns: ["fastly", "x-served-by", "x-cache-hits"]
    }
  ];

  for (const provider of providers) {
    if (provider.patterns.some((p) => h.includes(p))) {
      return {
        detected: true,
        provider: provider.name
      };
    }
  }

  return {
    detected: false,
    provider: "Not detected"
  };
};