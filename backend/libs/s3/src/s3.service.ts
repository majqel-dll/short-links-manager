import { InjectLogger } from "@libs/decorators";
import { randomUUID as uuidv4 } from "crypto";
import { Client, RemoveOptions } from "minio";
import { Injectable } from "@nestjs/common";
import { Logger } from "@libs/logger";
import Stream from "stream";

@Injectable()
export class S3Service {
    private s3: Client;

    constructor(
        @InjectLogger(S3Service)
        private readonly logger: Logger
    ) {
        const startTime = Date.now();

        try {
            this.s3 = new Client({
                endPoint: process.env.MINIO_ENDPOINT,
                port: +process.env.MINIO_PORT,
                useSSL: false,
                accessKey: process.env.MINIO_ROOT_USER,
                secretKey: process.env.MINIO_ROOT_PASSWORD,
            });
        } catch (error) {
            void this.logger.error(`Failed to initialize S3 connection.`, {
                error: error as Error,
                startTime,
            });
        }
    }

    public async bucketExists(bucketName: string): Promise<boolean> {
        try {
            return await this.s3.bucketExists(bucketName);
        } catch (error) {
            this.logger.error(`Failed to check if bucket exists.`, { error: error as Error });
            return false;
        }
    }

    public async createBucket(name?: string): Promise<[string, string]> {
        try {
            const bucketNameLengthRestriction = 63;
            if (!name) {
                name = `${uuidv4()}-${Date.now()}`;
            }
            name = name.trim().toLowerCase()
                .replaceAll(` `, `-`)
                .replaceAll(/[^a-z0-9\-]/g, ``)
                .slice(0, bucketNameLengthRestriction);

            await this.s3.makeBucket(name);
            return [name, `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${name}`];
        } catch (error) {
            this.logger.error(`Failed to create new bucket in minio.`, { error: error as Error });
            return null;
        }
    }

    public async putObject(
        bucketName: string,
        objectName: string,
        data: Buffer | Stream.Readable,
    ): Promise<unknown> {
        try {
            const createdObject = await this.s3.putObject(bucketName, objectName, data);
            return {
                path: `${process.env.MINIO_ENDPOINT}/${bucketName}/${objectName}`,
                etag: createdObject.etag,
            };
        } catch (error) {
            void this.logger.error(
                `Failed to put object: ${objectName}, in bucket: ${bucketName}.`,
                {
                    error: error as Error,
                },
            );
            return null;
        }
    }

    public async getObject(bucketName: string, objectName: string): Promise<Buffer> {
        try {
            const stream = await this.s3.getObject(bucketName, objectName);
            return await new Promise((resolve, reject) => {
                const chunks: Buffer[] = [];
                stream.on(`data`, (chunk) => chunks.push(chunk));
                stream.on(`end`, () => resolve(Buffer.concat(chunks)));
                stream.on(`error`, reject);
            });
        } catch (error) {
            this.logger.error(`Failed to get object: ${objectName}, from bucket: ${bucketName}.`, { error: error as Error });
            return null;
        }
    }

    public async deleteObject(
        bucketName: string,
        objectName: string,
        options?: RemoveOptions,
    ): Promise<boolean> {
        try {
            if (options) {
                await this.s3.removeObject(bucketName, objectName, options);
            } else {
                await this.s3.removeObject(bucketName, objectName);
            }
            return true;
        } catch (error) {
            void this.logger.error(
                `Failed to delete object: ${objectName}, from: ${bucketName}.`,
                {
                    error: error as Error,
                },
            );
            return false;
        }
    }
}
