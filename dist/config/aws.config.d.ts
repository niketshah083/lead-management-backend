declare const _default: (() => {
    region: string;
    accessKeyId: string | undefined;
    secretAccessKey: string | undefined;
    sqs: {
        queueUrl: string | undefined;
    };
    s3: {
        bucket: string | undefined;
        region: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    region: string;
    accessKeyId: string | undefined;
    secretAccessKey: string | undefined;
    sqs: {
        queueUrl: string | undefined;
    };
    s3: {
        bucket: string | undefined;
        region: string;
    };
}>;
export default _default;
