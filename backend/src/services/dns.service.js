import dns from "dns/promises";
import axios from "axios";

const googleDns = async (domain, type) => {
  try {
    const res = await axios.get("https://dns.google/resolve", {
      params: { name: domain, type },
      timeout: 8000
    });

    return res.data?.Answer || [];
  } catch {
    return [];
  }
};

export const getDnsRecords = async (domain) => {
  const result = {
    A: [],
    AAAA: [],
    MX: [],
    NS: [],
    TXT: [],
    CNAME: []
  };

  try {
    const [A, AAAA, MX, NS, TXT, CNAME] = await Promise.allSettled([
      dns.resolve4(domain),
      dns.resolve6(domain),
      dns.resolveMx(domain),
      dns.resolveNs(domain),
      dns.resolveTxt(domain),
      dns.resolveCname(domain)
    ]);

    result.A = A.status === "fulfilled" ? A.value : [];
    result.AAAA = AAAA.status === "fulfilled" ? AAAA.value : [];
    result.MX = MX.status === "fulfilled" ? MX.value : [];
    result.NS = NS.status === "fulfilled" ? NS.value : [];
    result.TXT = TXT.status === "fulfilled" ? TXT.value.flat().map(String) : [];
    result.CNAME = CNAME.status === "fulfilled" ? CNAME.value : [];
  } catch {}

  if (result.A.length === 0) {
    const records = await googleDns(domain, "A");
    result.A = records.map((r) => r.data).filter(Boolean);
  }

  if (result.AAAA.length === 0) {
    const records = await googleDns(domain, "AAAA");
    result.AAAA = records.map((r) => r.data).filter(Boolean);
  }

  if (result.MX.length === 0) {
    const records = await googleDns(domain, "MX");
    result.MX = records.map((r) => ({
      exchange: r.data?.split(" ").slice(1).join(" ").replace(/\.$/, ""),
      priority: Number(r.data?.split(" ")[0]) || 0
    }));
  }

  if (result.NS.length === 0) {
    const records = await googleDns(domain, "NS");
    result.NS = records.map((r) => r.data?.replace(/\.$/, "")).filter(Boolean);
  }

  if (result.TXT.length === 0) {
    const records = await googleDns(domain, "TXT");
    result.TXT = records.map((r) => r.data).filter(Boolean);
  }

  if (result.CNAME.length === 0) {
    const records = await googleDns(domain, "CNAME");
    result.CNAME = records.map((r) => r.data?.replace(/\.$/, "")).filter(Boolean);
  }

  return result;
};