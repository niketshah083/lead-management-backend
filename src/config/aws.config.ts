import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => ({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sqs: {
    queueUrl: process.env.SQS_QUEUE_URL,
  },
  s3: {
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION || 'us-east-1',
  },
}));
