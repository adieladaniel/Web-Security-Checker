// export const normalizeDomain = (input) =>{
//     return input
//     .replace(/^https?:\/\//, "")
//     .replace(/^www\./, "")
//     .split("/")[0]
//     .trim()
//     .toLowerCase();
// }

// export const toHttpsUrl = (domain) => {
//   return `https://${domain}`;
// };


export const normalizeDomain = (input = "") => {
  return input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .toLowerCase();
};

export const toHttpsUrl = (domain) => {
  return `https://${domain}`;
};