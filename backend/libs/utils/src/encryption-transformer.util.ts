import crypto from "crypto";

const algorithm = "aes-256-gcm";
const key = crypto.createHash("sha256").update(process.env.SECRET ?? "").digest();
const ivLength = 16;

export const EncryptionTransformer = {
    to(value?: string): string | null {

        if (!value) {
            return null;
        }

        const iv = crypto.randomBytes(ivLength);
        const cipher = crypto.createCipheriv(algorithm, key, iv);

        const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
        const authTag = cipher.getAuthTag();

        return Buffer.concat([iv, authTag, encrypted]).toString("base64");
    },

    from(value?: string): string | null {
        if (!value) {
            return null;
        }

        const buffer = Buffer.from(value, "base64");

        const iv = buffer.slice(0, ivLength);
        const authTag = buffer.slice(ivLength, ivLength + 16);
        const encryptedText = buffer.slice(ivLength + 16);

        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);

        return decrypted.toString("utf8");
    },
};
