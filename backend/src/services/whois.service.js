import whois from "whois-json";

export const getWhoisInfo = async (domain) => {
    try{
        const data = await whois(domain);
        return data;
    }
    catch(error){
        return {
            error:error.message
        };
    }
}