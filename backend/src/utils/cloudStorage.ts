import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

function isS3Configured(): boolean {
    return Boolean(
        process.env.AWS_S3_BUCKET &&
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY
    );
}

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

interface UploadResult {
    url: string;
    width?: number;
    height?: number;
    duration?: number;
}

export async function uploadToCloudStorage(
    file: Express.Multer.File,
    organizationId: string
): Promise<UploadResult> {
    if (!isS3Configured()) {
        throw new Error('Cloud storage is not configured. Set AWS_S3_BUCKET and credentials.');
    }

    try {
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${organizationId}/${uuidv4()}.${fileExtension}`;
        
        let fileBuffer = file.buffer;
        let metadata: { width?: number; height?: number } = {};

        if (file.mimetype.startsWith('image/')) {
            const image = sharp(file.buffer);
            const imageMetadata = await image.metadata();
            
            metadata.width = imageMetadata.width;
            metadata.height = imageMetadata.height;

            if (file.size > 1024 * 1024) {
                fileBuffer = await image
                    .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 85 })
                    .toBuffer();
            }
        }

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET || '',
            Key: fileName,
            Body: fileBuffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
        });

        await s3Client.send(command);

        const region = process.env.AWS_REGION || 'us-east-1';
        const url = `https://${process.env.AWS_S3_BUCKET}.s3.${region}.amazonaws.com/${fileName}`;

        return {
            url,
            ...metadata,
        };
    } catch (error) {
        console.error('Error uploading to cloud storage:', error);
        throw new Error('Failed to upload file to cloud storage');
    }
}

export async function deleteFromCloudStorage(_fileUrl: string): Promise<void> {
    // implementasi menghapus
}
