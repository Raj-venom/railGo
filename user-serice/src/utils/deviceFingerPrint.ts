import crypto from 'crypto';


function getDeviceFingerprint(req: any): string {

    const userAgent = req.headers["user-agent"] || "";
    const ip = req.ip || "";
    const accept = req.headers["accept"] || "";

    const rawFingerprintData = `${userAgent}|${ip}|${accept}`;

    return crypto
        .createHash("sha256")
        .update(rawFingerprintData)
        .digest("hex")
        .slice(0, 16); // Shorten to 16 characters for storage efficiency

}


export {
    getDeviceFingerprint
}