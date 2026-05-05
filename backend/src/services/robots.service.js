import axios from "axios";

export const getRobotsTxt = async (domain) => {
    try{
        const url = `https://${domain}/robots.txt`;

        const response = await axios.get(url, {
            timeout:7000, 
            validateStatus:()=>true
        });
        return {
            found: response.status === 200,
            status: response.status,
            content: response.status === 200 ? response.data : null
        };
    }
    catch(error){
        return {
            found:false,
            error:error.message
        };
    }
};