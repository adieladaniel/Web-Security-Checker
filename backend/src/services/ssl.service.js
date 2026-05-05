import { error } from "console";
import { resolve } from "dns";
import tls from "tls";

export const getSslCertificate = (domain) => {
    return new Promise((resolve) =>{
        const socket = tls.connect(
            443,
            domain, 
            {servername: domain, rejectUnauthorized:false},
            () =>{
                const cert = socket.getPeerCertificate();
                socket.end();

                if(!cert || Object.keys(cert).length===0){
                    resolve({available:false});
                    return;
                }
                resolve({
                    available: true,
                    subject: cert.subject,
                    issuer: cert.issuer,
                    validFrom: cert.valid_from,
                    validTo: cert.valid_to,
                    fingerprint: cert.fingerprint,
                    serialNumber: cert.serialNumber
                });
            }
        );
        socket.setTimeout(7000, ()=>{
            socket.destroy();
            resolve({available:false, error:"SSL Timeout"});
        });
        socket.on("error", () => {
            resolve({ available: false });
        });
    })
}