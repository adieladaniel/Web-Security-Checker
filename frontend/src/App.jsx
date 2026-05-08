import { useState, useCallback, useEffect } from "react";
import { scanDomain } from "./api/scanApi";
import ResultCard, { StatRow, StatusBadge } from "./components/ResultCard";
import SecurityScoreRing from "./components/SecurityScoreRing";
import ThreeBackground from "./components/ThreeBackground";
import InfoIcon from "./components/InfoIcon";
import "./index.css";

/* ─── tiny helpers ─── */
const fmt  = (v) => (v !== undefined && v !== null && v !== "" ? String(v) : "N/A");
const bool = (v) => (v ? <StatusBadge label="Present" ok /> : <StatusBadge label="Missing" ok={false} />);

const cardInfo = {
  securityScore: "Overall score calculated from security headers, DNSSEC, robots.txt exposure, threat reputation, CORS, cookies, sensitive paths and open ports.",
  vulnerabilities: "Detected weaknesses grouped by severity. High issues need immediate attention, Medium issues should be fixed soon, and Low issues are security improvements.",
  fixSuggestions: "Practical remediation steps for the vulnerabilities detected in this scan. Use these fixes, update the server configuration, then rescan.",
  threatIntel: "Domain reputation checks from VirusTotal and Google Safe Browsing. This helps identify phishing, malware, suspicious or blacklisted domains.",
  ssl: "HTTPS certificate details including common name, issuer, validity period and fingerprint. Expired or mismatched certificates reduce trust.",
  securityHeaders: "Browser security protections such as CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy.",
  cors: "Cross-Origin Resource Sharing rules. Weak CORS configuration can allow external websites to access sensitive resources.",
  cookies: "Cookie security flags. Secure, HttpOnly and SameSite help protect session cookies from theft and cross-site attacks.",
  sensitivePaths: "Checks whether common sensitive paths are publicly reachable, such as admin, config, backup or environment files.",
  openPorts: "Shows reachable common network ports. Unexpected open database, SSH or admin service ports can increase attack surface.",
  whois: "Domain registration details such as registrar, creation date, expiry date, update date and DNSSEC status.",
  server: "HTTP response details including server software, status code, response time, content type and response size.",
  dns: "Public DNS records such as A, AAAA, MX, NS, TXT and CNAME. These reveal hosting, mail and infrastructure configuration.",
  robots: "robots.txt instructions for crawlers. It is public, so sensitive paths listed here can reveal hidden areas.",
  sitemap: "Public sitemap files and pages discovered from sitemap.xml.",
  redirects: "Shows redirect chain such as HTTP to HTTPS. Redirect behavior affects security, SEO and user experience."
};

const vulnerabilityInfo = {
  "Missing Content Security Policy": "CSP limits which scripts and resources can run. Without it, XSS impact becomes much higher.",
  "Missing HSTS": "HSTS forces browsers to use HTTPS. Without it, users may be exposed to SSL stripping or downgrade attacks.",
  "Missing X-Frame-Options": "This header blocks clickjacking by preventing the site from being loaded inside malicious iframes.",
  "Missing X-Content-Type-Options": "This prevents MIME sniffing, where browsers incorrectly execute files as scripts.",
  "Admin path exposed in robots.txt": "robots.txt is public. Listing /admin reveals sensitive paths attackers may inspect first.",
  "DNSSEC not enabled": "DNSSEC signs DNS records to reduce DNS spoofing and cache poisoning risks.",
  "Domain flagged as malicious": "Threat intelligence providers have marked this domain as malicious. Investigate immediately."
};

const fixSuggestions = {
  "Missing Content Security Policy": "Add a Content-Security-Policy header. Start with default-src 'self', then allow only required scripts, styles, images, fonts and API domains.",
  "Missing HSTS": "Add Strict-Transport-Security: max-age=31536000; includeSubDomains; preload after confirming HTTPS works for the whole domain.",
  "Missing X-Frame-Options": "Add X-Frame-Options: DENY, or SAMEORIGIN if your own pages need to embed this site.",
  "Missing X-Content-Type-Options": "Add X-Content-Type-Options: nosniff to stop MIME sniffing.",
  "Admin path exposed in robots.txt": "Remove sensitive paths like /admin or /private from robots.txt. Protect admin pages using authentication, IP restrictions and server-side access control.",
  "DNSSEC not enabled": "Enable DNSSEC from your domain registrar or DNS provider, then verify DS records are published correctly.",
  "Domain flagged as malicious": "Review VirusTotal / Safe Browsing detections, remove malicious content, patch compromised files and request re-review after cleanup."
};

const headerInfo = {
  CSP: "Content Security Policy helps prevent XSS by controlling trusted scripts, styles, images and other resources.",
  HSTS: "HTTP Strict Transport Security forces browsers to use HTTPS for future visits.",
  "X-Frame-Options": "Protects against clickjacking by blocking iframe embedding.",
  "X-Content-Type": "Prevents browsers from guessing content types incorrectly.",
  "Referrer-Policy": "Controls how much referrer information is shared when users navigate away.",
  "Permissions-Policy": "Restricts browser features such as camera, microphone, geolocation and payment APIs."
};

function ScanInput({ domain, onChange, onScan, loading }) {
  const handleKey = (e) => { if (e.key === "Enter") onScan(); };
  return (
    <div
      className="glass-card corner-bracket"
      style={{
        borderRadius: 12,
        padding: "1.5rem 1.75rem",
        marginBottom: "2rem",
        display: "flex",
        gap: "0.75rem",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: "1 1 320px", position: "relative" }}>
        <span style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-muted)",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "0.75rem",
          letterSpacing: "0.1em",
          userSelect: "none",
        }}>
          TARGET ▸
        </span>
        <input
          value={domain}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder="example.com"
          className="cyber-input"
          style={{
            width: "100%",
            borderRadius: 8,
            padding: "0.75rem 1rem 0.75rem 6rem",
            fontSize: "0.9rem",
            letterSpacing: "0.08em",
          }}
        />
      </div>

      <button
        onClick={onScan}
        disabled={loading}
        className="cyber-button"
        style={{
          borderRadius: 8,
          padding: "0.75rem 2rem",
          fontSize: "0.65rem",
          letterSpacing: "0.2em",
          minWidth: 160,
          height: "44px",
          flexShrink: 0,
        }}
      >
        {loading ? (
          <span className="scan-pulse" style={{ justifyContent: "center" }}>
            <span /><span /><span />
          </span>
        ) : (
          "⬡ INITIATE SCAN"
        )}
      </button>
    </div>
  );
}

function ResultsGrid({ result }) {
  if (!result) return null;

  const intel = result.intelligence || {};
  const history = result.history || {};

  if (result.reachable === false) {
    return (
      <div className="result-card corner-bracket" style={{
        minHeight: 260,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        borderColor: "rgba(239,68,68,0.45)",
        marginTop: "1rem"
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚠️</div>

        <h2 style={{
          fontFamily: "Orbitron",
          color: "#f87171",
          letterSpacing: "0.08em",
          marginBottom: "0.75rem"
        }}>
          TARGET NOT REACHABLE
        </h2>

        <p style={{
          color: "var(--text-secondary)",
          fontSize: "0.95rem",
          maxWidth: 520,
          lineHeight: 1.6
        }}>
          {result.message || "This website could not be found or did not respond properly."}
        </p>

        <p style={{
          color: "var(--text-muted)",
          fontSize: "0.8rem",
          marginTop: "1rem",
          fontFamily: "JetBrains Mono"
        }}>
          Target: {result.domain}
        </p>
      </div>
    );
  }

  const vuln = result.vulnerabilities || {};
  const ssl  = result.ssl || {};
  const whois = result.whois || {};
  const headers = result.headers || {};
  const dns  = result.dns || {};
  const robots = result.robots || {};
  const sitemap = result.sitemap || {};
  const threat = result.threatIntel || {};
  const secH = headers.securityHeaders || {};

  return (
    <div>
      {/* ── TOP BAND: Score + Threat Summary ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
        gap: "1rem",
        marginBottom: "1rem",
      }}>

        {/* Security Score */}
        <div className="result-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 260, overflow: "visible" }}>
          <div className="card-header" style={{ width: "100%" }}>
            <div className="card-icon">🔒</div>
            <span className="card-title" style={{ display: "inline-flex", alignItems: "center", fontSize: "0.82rem" }}>Security Score<InfoIcon text={cardInfo.securityScore} /></span>
          </div>
          <SecurityScoreRing score={vuln.score || 0} riskLevel={vuln.riskLevel} />
        </div>

        {/* Vulnerabilities */}
        <ResultCard title="Vulnerabilities" icon="🚨" accentColor="rgba(239,68,68,0.4)" info={cardInfo.vulnerabilities} style={{ minHeight: 260 }}>
          {vuln.findings?.high?.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              {vuln.findings.high.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 3 }}>
                  <span className="badge badge-danger" style={{ flexShrink: 0, marginTop: 1 }}>HIGH</span>
                  <span style={{ fontSize: "0.84rem", color: "#fca5a5" }}>{f}</span><InfoIcon text={vulnerabilityInfo[f] || "High severity issue detected. Review and fix this as a priority."} />
                </div>
              ))}
            </div>
          )}
          {vuln.findings?.medium?.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              {vuln.findings.medium.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 3 }}>
                  <span className="badge badge-warn" style={{ flexShrink: 0, marginTop: 1 }}>MED</span>
                  <span style={{ fontSize: "0.84rem", color: "#fde68a" }}>{f}</span><InfoIcon text={vulnerabilityInfo[f] || "Medium severity issue detected. Fix this to improve security posture."} />
                </div>
              ))}
            </div>
          )}
          {vuln.findings?.low?.length > 0 && (
            <div>
              {vuln.findings.low.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 3 }}>
                  <span className="badge badge-info" style={{ flexShrink: 0, marginTop: 1 }}>LOW</span>
                  <span style={{ fontSize: "0.84rem", color: "#a5f3fc" }}>{f}</span><InfoIcon text={vulnerabilityInfo[f] || "Low severity security improvement."} />
                </div>
              ))}
            </div>
          )}
          {!vuln.findings?.high?.length && !vuln.findings?.medium?.length && !vuln.findings?.low?.length && (
            <span className="badge badge-success">No vulnerabilities found</span>
          )}
        </ResultCard>

        {/* Fix Suggestions */}
        <ResultCard title="Fix Suggestions" icon="🧰" accentColor="rgba(16,185,129,0.35)" info={cardInfo.fixSuggestions} style={{ minHeight: 260 }}>
          {[...(vuln.findings?.high || []), ...(vuln.findings?.medium || []), ...(vuln.findings?.low || [])].length > 0 ? (
            [...(vuln.findings?.high || []), ...(vuln.findings?.medium || []), ...(vuln.findings?.low || [])].map((f, i) => (
              <div key={i} style={{
                padding: "8px 9px",
                marginBottom: 7,
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.12)",
                borderRadius: 6
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span className="badge badge-success">FIX</span>
                  <span style={{ fontSize: "0.84rem", color: "#d8b4fe" }}>{f}</span>
                  <InfoIcon text={vulnerabilityInfo[f] || "Security improvement detected by scanner."} />
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                  {fixSuggestions[f] || "Review the related configuration and apply the recommended secure default for your server or framework."}
                </p>
              </div>
            ))
          ) : (
            <span className="badge badge-success">No fix suggestions required</span>
          )}
        </ResultCard>

        {/* Threat Intel */}
        <ResultCard title="Threat Intel" icon="🚨" accentColor="rgba(239,68,68,0.3)" info={cardInfo.threatIntel} style={{ minHeight: 260 }}>
          <StatRow label="VT Reputation"   value={fmt(threat.virusTotal?.reputation)} />
          <StatRow label="Malicious"        value={fmt(threat.virusTotal?.stats?.malicious)}  status={threat.virusTotal?.stats?.malicious > 0 ? "bad" : "good"} />
          <StatRow label="Suspicious"       value={fmt(threat.virusTotal?.stats?.suspicious)} status={threat.virusTotal?.stats?.suspicious > 0 ? "warn" : "good"} />
          <StatRow label="Harmless"         value={fmt(threat.virusTotal?.stats?.harmless)} />
          <StatRow label="Safe Browsing"    value={threat.safeBrowsing?.safe ? "✓ Safe" : "✗ Flagged"} status={threat.safeBrowsing?.safe ? "good" : "bad"} />
        </ResultCard>

      </div>

      {/* ── MAIN GRID ── */}
      <div className="results-grid">

        {/* SSL Certificate */}
        <ResultCard title="SSL Certificate" icon="🔐" accentColor="rgba(6,182,212,0.35)" info={cardInfo.ssl}>
          <StatRow label="Subject (CN)"  value={fmt(ssl.subject?.CN)} />
          <StatRow label="Issuer"        value={fmt(ssl.issuer?.O)} />
          <StatRow label="Valid From"    value={fmt(ssl.validFrom)} />
          <StatRow label="Valid Until"   value={fmt(ssl.validTo)} />
          <StatRow label="Fingerprint"   value={ssl.fingerprint ? ssl.fingerprint.slice(0, 22) + "…" : "N/A"} />
        </ResultCard>

        {/* Security Headers */}
        <ResultCard title="Security Headers" icon="🛡" accentColor="rgba(168,85,247,0.4)" info={cardInfo.securityHeaders}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center" }}>CSP<InfoIcon text={headerInfo.CSP} /></span>
              {bool(secH.contentSecurityPolicy)}
            </div>
            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center" }}>HSTS<InfoIcon text={headerInfo.HSTS} /></span>
              {bool(secH.strictTransportSecurity)}
            </div>
            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center" }}>X-Frame-Options<InfoIcon text={headerInfo["X-Frame-Options"]} /></span>
              {bool(secH.xFrameOptions)}
            </div>
            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center" }}>X-Content-Type<InfoIcon text={headerInfo["X-Content-Type"]} /></span>
              {bool(secH.xContentTypeOptions)}
            </div>
            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center" }}>Referrer-Policy<InfoIcon text={headerInfo["Referrer-Policy"]} /></span>
              {bool(secH.referrerPolicy)}
            </div>
            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center" }}>Permissions-Policy<InfoIcon text={headerInfo["Permissions-Policy"]} /></span>
              {bool(secH.permissionsPolicy)}
            </div>
          </div>
        </ResultCard>

        {/* CORS */}
        <ResultCard title="CORS" icon="🌐" accentColor={vuln.cors?.risky ? "rgba(239,68,68,0.35)" : "rgba(16,185,129,0.3)"} info={cardInfo.cors}>
          <StatRow label="Allow-Origin" value={fmt(vuln.cors?.allowOrigin)} />
          <StatRow
            label="Risk Level"
            value={vuln.cors?.risky ? "High Risk" : "Safe"}
            status={vuln.cors?.risky ? "bad" : "good"}
          />
        </ResultCard>

        {/* Cookies */}
        <ResultCard title="Cookies" icon="🍪" info={cardInfo.cookies}>
          {vuln.cookies?.length ? (
            vuln.cookies.map((c, i) => (
              <div key={i} style={{
                padding: "6px 8px",
                marginBottom: 4,
                background: "rgba(168,85,247,0.06)",
                borderRadius: 4,
                border: "1px solid rgba(168,85,247,0.1)",
              }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <StatusBadge label="Secure"   ok={c.secure} />
                  <StatusBadge label="HttpOnly" ok={c.httpOnly} />
                  <StatusBadge label="SameSite" ok={!!c.sameSite} />
                </div>
              </div>
            ))
          ) : (
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>No cookies detected</span>
          )}
        </ResultCard>

        {/* Sensitive Paths */}
        <ResultCard title="Sensitive Paths" icon="🔓" accentColor={vuln.sensitivePaths?.length > 0 ? "rgba(245,158,11,0.35)" : "rgba(16,185,129,0.3)"} info={cardInfo.sensitivePaths}>
          {vuln.sensitivePaths?.length > 0 ? (
            vuln.sensitivePaths.map((p, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 0",
                borderBottom: "1px solid rgba(245,158,11,0.08)",
              }}>
                <span className="badge badge-warn">EXPOSED</span>
                <span style={{ fontSize: "0.72rem", color: "#fde68a", fontFamily: "JetBrains Mono" }}>{p.path}</span>
              </div>
            ))
          ) : (
            <span className="badge badge-success">No sensitive paths exposed</span>
          )}
        </ResultCard>

        {/* Open Ports */}
        <ResultCard title="Open Ports" icon="🔌" info={cardInfo.openPorts}>
          {vuln.openPorts?.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {vuln.openPorts.map((p, i) => (
                <span key={i} className="badge badge-warn">:{p}</span>
              ))}
            </div>
          ) : (
            <span className="badge badge-success">Standard ports only</span>
          )}
        </ResultCard>

        {/* Domain Info */}
        <ResultCard title="WHOIS / Domain" icon="🌍" accentColor="rgba(6,182,212,0.3)" info={cardInfo.whois}>
          <StatRow label="Domain"     value={fmt(whois.domainName || result.domain)} />
          <StatRow label="Registrar"  value={fmt(whois.registrar)} />
          <StatRow label="Created"    value={fmt(whois.creationDate)} />
          <StatRow label="Updated"    value={fmt(whois.updatedDate)} />
          <StatRow label="Expires"    value={fmt(whois.registrarRegistrationExpirationDate)} />
          <StatRow label="DNSSEC"     value={fmt(whois.dnssec)} />
        </ResultCard>

        {/* Server Info */}
        <ResultCard title="Server Info" icon="🖥" info={cardInfo.server}>
          <StatRow label="Status Code"    value={fmt(headers.status)} />
          <StatRow label="Response Time"  value={headers.responseTime ? `${headers.responseTime} ms` : "N/A"} />
          <StatRow label="Server"         value={fmt(headers.headers?.server)} />
          <StatRow label="Content-Type"   value={fmt(headers.headers?.["content-type"])} />
          <StatRow label="Content-Length" value={fmt(headers.headers?.["content-length"])} />
        </ResultCard>

        {/* DNS Records */}
        <ResultCard title="DNS Records" icon="🌐" accentColor="rgba(6,182,212,0.3)" info={cardInfo.dns}>
          <StatRow label="A Records"    value={dns.A?.length    || 0} />
          <StatRow label="AAAA Records" value={dns.AAAA?.length || 0} />
          <StatRow label="MX Records"   value={dns.MX?.length   || 0} />
          <StatRow label="NS Records"   value={dns.NS?.length   || 0} />
          <StatRow label="TXT Records"  value={dns.TXT?.length  || 0} />
          <StatRow label="CNAME"        value={dns.CNAME?.length || 0} />
        </ResultCard>

        {/* Robots.txt */}
        <ResultCard title="Robots.txt" icon="🤖" info={cardInfo.robots}>
          <StatRow label="Found"           value={robots.found ? "Yes" : "No"} status={robots.found ? "good" : "warn"} />
          <StatRow label="Status"          value={fmt(robots.status)} />
          <StatRow label="/admin exposed"  value={robots.content?.includes("/admin")   ? "Yes ⚠" : "No"} status={robots.content?.includes("/admin")   ? "warn" : "good"} />
          <StatRow label="/private exposed" value={robots.content?.includes("/private") ? "Yes ⚠" : "No"} status={robots.content?.includes("/private") ? "warn" : "good"} />
          <StatRow label="Sitemap listed"  value={robots.content?.includes("Sitemap")  ? "Yes" : "No"}   status={robots.content?.includes("Sitemap")  ? "good" : "warn"} />
        </ResultCard>

        {/* Sitemap */}
        <ResultCard title="Sitemap" icon="📄" info={cardInfo.sitemap}>
          <StatRow label="Found"       value={sitemap.found ? "Yes" : "No"} status={sitemap.found ? "good" : "warn"} />
          <StatRow label="URL"         value={sitemap.sitemapUrl ? sitemap.sitemapUrl : "N/A"} />
          <StatRow label="Pages Found" value={sitemap.pages?.length || 0} />
          {sitemap.pages?.slice(0, 3).map((page, i) => (
            <div key={i} style={{
              fontSize: "0.68rem",
              color: "var(--text-muted)",
              padding: "2px 0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "",
              fontFamily: "JetBrains Mono",
            }}>
              ↳ {page}
            </div>
          ))}
        </ResultCard>

        {/* Redirects */}
        <ResultCard title="Redirects" icon="🔀" info={cardInfo.redirects}>
          {Array.isArray(result.redirects) && result.redirects.length > 0 ? (
            result.redirects.map((r, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 0",
                borderBottom: "1px solid rgba(168,85,247,0.08)",
                fontSize: "0.72rem",
              }}>
                <span className="badge badge-info">{r.statusCode}</span>
                <span style={{ color: "var(--text-muted)", overflow: "", textOverflow: "ellipsis", whiteSpace: "normal" }}>
                  → {r.location}
                </span>
              </div>
            ))
          ) : (
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>No redirects detected</span>
          )}
        </ResultCard>

        <ResultCard
          title="Subdomains"
          icon="🧬"
          accentColor="rgba(14,165,233,0.35)"
          info="Finds public subdomains using certificate transparency logs. Admin, dev, test and staging subdomains may increase exposure."
        >
          <StatRow label="Total Found" value={intel.subdomains?.total || 0} />

          {intel.subdomains?.risky?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <span className="badge badge-warn">Risky Names Found</span>
              {intel.subdomains.risky.slice(0, 5).map((s, i) => (
                <div key={i} style={{ fontSize: "0.82rem", marginTop: 5 }}>
                  ⚠ {s}
                </div>
              ))}
            </div>
          )}

          {(intel.subdomains?.subdomains || []).slice(0, 8).map((s, i) => (
            <div key={i} style={{ fontSize: "0.82rem", marginTop: 4 }}>
              ↳ {s}
            </div>
          ))}
        </ResultCard> 

        <ResultCard
          title="WAF Detection"
          icon="🧱"
          accentColor={intel.waf?.detected ? "rgba(16,185,129,0.35)" : "rgba(245,158,11,0.35)"}
          info="Detects whether a Web Application Firewall or CDN security layer is protecting the site."
        >
          <StatRow
            label="Detected"
            value={intel.waf?.detected ? "Yes" : "No"}
            status={intel.waf?.detected ? "good" : "warn"}
          />
          <StatRow label="Provider" value={intel.waf?.provider || "Not detected"} />
        </ResultCard>

        <ResultCard
          title="Technology Stack"
          icon="🧩"
          accentColor="rgba(20,184,166,0.35)"
          info="Detects technologies from server headers, HTML source, scripts, meta tags and known fingerprints."
        >
          <StatRow label="Detected" value={intel.technologies?.total || 0} />

          {intel.technologies?.technologies?.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {intel.technologies.technologies.map((t, i) => (
                <span key={i} className="badge badge-info">
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <span>No technologies detected</span>
          )}
        </ResultCard>

        <ResultCard
          title="Infrastructure"
          icon="🛰"
          accentColor="rgba(6,182,212,0.35)"
          info="Shows hosting and network intelligence such as IP address, ASN, ISP, country, region and city."
        >
          <StatRow label="IP" value={intel.infrastructure?.ip || "N/A"} />
          <StatRow label="Country" value={intel.infrastructure?.country || "N/A"} />
          <StatRow label="City" value={intel.infrastructure?.city || "N/A"} />
          <StatRow label="ISP" value={intel.infrastructure?.isp || "N/A"} />
          <StatRow label="ASN" value={intel.infrastructure?.asn || "N/A"} />
          <StatRow label="Timezone" value={intel.infrastructure?.timezone || "N/A"} />
        </ResultCard>

        

      </div>
    </div>
  );
}

export default function App() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanTime, setScanTime] = useState(null);
  const [scannedDomain, setScannedDomain] = useState("");

  const handleScan = useCallback(async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setResult(null);
    const t0 = Date.now();
    try {
      const data = await scanDomain(domain);
      setResult(data.data);
      setScanTime(((Date.now() - t0) / 1000).toFixed(2));
      setScannedDomain(domain);
    } catch {
      alert("Scan failed. Check the domain and try again.");
    } finally {
      setLoading(false);
    }
  }, [domain]);

  useEffect(() => {
    if (loading) {
      document.title = `Scanning ${domain || "target"}...`;
    } else if (result) {
      document.title = `${scannedDomain} | Scan Complete`;
    } else {
      document.title = "Three-Eyed Raven | Web Security Scanner";
    }

    return () => {
      document.title = "Three-Eyed Raven | Web Security Scanner";
    };
  }, [loading, result, domain, scannedDomain]);

  
  return (
    <div className="scanlines" style={{ minHeight: "100vh", position: "relative" }}>
      <ThreeBackground />

      <div style={{
        position: "relative",
        zIndex: 1,
        maxWidth: 1320,
        margin: "0 auto",
        padding: "2rem 1.5rem 4rem",
      }}>

        {/* ── HEADER ── */}
        <header style={{ marginBottom: "2.5rem" }}>

          {/* Top meta bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}>
            <div className="status-dot" />
            <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono", letterSpacing: "0.2em" }}>
              SYSTEM ONLINE
            </span>
            <div style={{ flex: 1 }} />
            {["OSINT", "RECON", "SECURITY", "INTEL"].map(tag => (
              <span key={tag} className="nav-pill">{tag}</span>
            ))}
          </div>

          {/* Main title block */}
          <div
            className="glass-card corner-bracket"
            style={{
              borderRadius: 12,
              padding: "2rem 2.5rem",
              marginBottom: "0",
              background: "rgba(8, 3, 20, 0.7)",
            }}
          >
            <p style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.4em",
              color: "var(--accent-secondary)",
              marginBottom: "0.75rem",
              textTransform: "uppercase",
            }}>
              ⬡ WEB-RECON // OSINT ENGINE v2.0
            </p>

            <h1
              className="font-orbitron title-glow"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 900,
                letterSpacing: "0.05em",
                color: "#e9d5ff",
                lineHeight: 1.1,
                marginBottom: "1rem",
              }}
            >
              THREE-EYED
              <span style={{ display: "block", fontSize: "0.55em", color: "var(--accent-primary)", letterSpacing: "0.18em", marginTop: 4 }}>
                RAVEN
              </span>
            </h1>

            <p style={{
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "1.05rem",
              fontWeight: 400,
              color: "var(--text-secondary)",
              maxWidth: 580,
              lineHeight: 1.6,
              marginBottom: "1.25rem",
            }}>
              Comprehensive intelligence gathering — DNS, SSL, headers, cookies,
              CORS, threat intel, WHOIS and more.
            </p>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {["DNS Analysis", "SSL Audit", "Header Scan", "Threat Intel", "WHOIS", "Port Scan"].map(f => (
                <span key={f} className="feature-tag">{f}</span>
              ))}
            </div>
          </div>
        </header>

        {/* ── SCAN INPUT ── */}
        <ScanInput
          domain={domain}
          onChange={setDomain}
          onScan={handleScan}
          loading={loading}
        />

        {/* ── LOADING STATE ── */}
        {loading && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
            padding: "4rem 0",
          }}>
            <div style={{ position: "relative", width: 80, height: 80 }}>
              <div style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "2px solid transparent",
                borderTopColor: "var(--accent-primary)",
                borderRightColor: "rgba(168,85,247,0.2)",
                animation: "spin 1s linear infinite",
              }} />
              <div style={{
                position: "absolute",
                inset: 12,
                borderRadius: "50%",
                border: "1px solid transparent",
                borderTopColor: "var(--accent-secondary)",
                animation: "spin 0.7s linear infinite reverse",
              }} />
              <div style={{
                position: "absolute",
                inset: 24,
                borderRadius: "50%",
                background: "rgba(168,85,247,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
              }}>
                🔍
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "Orbitron", fontSize: "0.7rem", letterSpacing: "0.25em", color: "var(--accent-primary)", marginBottom: 6 }}>
                SCANNING TARGET
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {domain}
              </p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── RESULTS HEADER ── */}
        {result && !loading && (
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "0.75rem 1.25rem",
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 8,
              flexWrap: "wrap",
            }}>
              <span style={{ fontSize: "0.9rem" }}>✅</span>
              <span style={{ fontFamily: "Rajdhani", fontWeight: 600, color: "#34d399", letterSpacing: "0.05em" }}>
                Scan Complete
              </span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono" }}>
                {scannedDomain}
              </span>
              {scanTime && (
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginLeft: "auto" }}>
                  ⏱ {scanTime}s
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        <ResultsGrid result={result} />

      </div>
    </div>
  );
}
