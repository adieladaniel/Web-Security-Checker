import { normalizeDomain, toHttpsUrl } from "../utils/normalizeDomain.js";

import { getDnsRecords } from "./dns.service.js";
import { getSslCertificate } from "./ssl.service.js";
import { getHeaders } from "./headers.service.js";
import { getWhoisInfo } from "./whois.service.js";
import { getRobotsTxt } from "./robots.service.js";
import { getSitemap } from "./sitemap.service.js";
import { getRedirects } from "./redirects.service.js";
import { getVirusTotalReport } from "./virustotal.service.js";
import { checkSafeBrowsing } from "./safebrowsing.service.js";
import { getWaybackHistory } from "./wayback.service.js";

import { calculateSecurityScore } from "./vulnerability/score.service.js";
import { checkCookies } from "./vulnerability/cookies.service.js";
import { checkCORS } from "./vulnerability/cors.service.js";
import { scanSensitivePaths } from "./vulnerability/paths.service.js";
import { detectTechStack } from "./vulnerability/techStack.service.js";
import { scanPorts } from "./vulnerability/ports.service.js";

import { getSubdomains } from "./intelligence/subdomains.service.js";
import { detectWAF } from "./intelligence/waf.service.js";
import { detectTechnologies } from "./intelligence/technology.service.js";
import { getGeoIPInfo } from "./intelligence/geoip.service.js";

export const runFullScan = async (inputDomain) => {
  const domain = normalizeDomain(inputDomain);
  const url = toHttpsUrl(domain);

  const [
    dns,
    ssl,
    headers,
    whois,
    robots,
    sitemap,
    redirects,
    virusTotal,
    safeBrowsing,
    wayback,
    cookies,
    cors,
    sensitivePaths,
    openPorts,
    subdomains
  ] = await Promise.allSettled([
    getDnsRecords(domain),
    getSslCertificate(domain),
    getHeaders(url),
    getWhoisInfo(domain),
    getRobotsTxt(domain),
    getSitemap(domain),
    getRedirects(domain),
    getVirusTotalReport(domain),
    checkSafeBrowsing(domain),
    getWaybackHistory(domain),
    checkCookies(domain),
    checkCORS(domain),
    scanSensitivePaths(domain),
    scanPorts(domain),
    getSubdomains(domain)
  ]);

  const unwrap = (item) =>
    item.status === "fulfilled"
      ? item.value
      : { error: item.reason?.message || "Scan failed" };

  const dnsData = unwrap(dns);
  const sslData = unwrap(ssl);
  const headersData = unwrap(headers);
  const whoisData = unwrap(whois);
  const robotsData = unwrap(robots);
  const sitemapData = unwrap(sitemap);
  const redirectsData = unwrap(redirects);
  const virusTotalData = unwrap(virusTotal);
  const safeBrowsingData = unwrap(safeBrowsing);
  const waybackData = unwrap(wayback);
  const cookiesData = unwrap(cookies);
  const corsData = unwrap(cors);
  const sensitivePathsData = unwrap(sensitivePaths);
  const openPortsData = unwrap(openPorts);
  const subdomainsData = unwrap(subdomains);

  const isReachable =
    headersData &&
    !headersData.error &&
    headersData.status &&
    headersData.status >= 100 &&
    headersData.status < 600;

  const hasDns =
    (dnsData?.A?.length || 0) > 0 ||
    (dnsData?.AAAA?.length || 0) > 0 ||
    (dnsData?.CNAME?.length || 0) > 0;

  if (!isReachable && !hasDns) {
    return {
      domain,
      scannedAt: new Date().toISOString(),
      reachable: false,
      message:
        "Website not found or unreachable. Please check the domain and try again.",
      errorDetails: {
        dns: dnsData,
        headers: headersData
      }
    };
  }

  const [technologies, infrastructure] = await Promise.allSettled([
    detectTechnologies(domain, headersData?.headers || {}),
    getGeoIPInfo(dnsData)
  ]);

  const technologiesData = unwrap(technologies);
  const infrastructureData = unwrap(infrastructure);
  const wafData = detectWAF(headersData?.headers || {});

  const scoreResult = calculateSecurityScore({
    headers: headersData,
    whois: whoisData,
    robots: robotsData,
    threatIntel: {
      virusTotal: virusTotalData,
      safeBrowsing: safeBrowsingData
    },
    cookies: cookiesData,
    cors: corsData,
    sensitivePaths: sensitivePathsData,
    openPorts: openPortsData
  });

  return {
    domain,
    reachable: true,
    scannedAt: new Date().toISOString(),

    dns: dnsData,
    ssl: sslData,
    headers: headersData,
    whois: whoisData,
    robots: robotsData,
    sitemap: sitemapData,
    redirects: redirectsData,

    threatIntel: {
      virusTotal: virusTotalData,
      safeBrowsing: safeBrowsingData
    },

    archiveHistory: waybackData,

    intelligence: {
      subdomains: subdomainsData,
      waf: wafData,
      technologies: technologiesData,
      infrastructure: infrastructureData
    },

    vulnerabilities: {
      score: scoreResult.score,
      riskLevel: scoreResult.riskLevel,
      findings: scoreResult.findings,
      cookies: cookiesData,
      cors: corsData,
      sensitivePaths: sensitivePathsData,
      openPorts: openPortsData,
      techStack: [
        ...new Set([
          ...(detectTechStack(headersData?.headers || {}) || []),
          ...(technologiesData?.technologies || [])
        ])
      ]
    }
  };
};