import dns from "dns/promises"

export const getDnsRecords = async (domain) =>{
    const result = {};
    const types = ["A", "AAAA", "MX", "NS", "TXT", "CNAME"];

    for (const type of types){
        try{
            result[type] = await dns.resolve(domain, type);
        }
        catch{
            result[type] = [];
        }
    }
    return result;
};