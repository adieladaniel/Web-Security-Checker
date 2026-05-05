export const normalizeDomain = (input) =>{
    return input
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .trim()
    .toLowerCase();
}

export const toHttpsUrl = (domain) => {
  return `https://${domain}`;
};