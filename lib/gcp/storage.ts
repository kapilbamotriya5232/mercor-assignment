import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucketName = process.env.GCP_BUCKET_NAME;

if (!bucketName) {
  throw new Error('GCP_BUCKET_NAME environment variable not set.');
}

const bucket = storage.bucket(bucketName);

export async function uploadImageToGCS(base64Image: string): Promise<string> {
  const imageBuffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  const fileName = `${uuidv4()}.png`;
  const file = bucket.file(fileName);

  await file.save(imageBuffer, {
    metadata: {
      contentType: 'image/png',
    },
  });

  return file.publicUrl();
}
