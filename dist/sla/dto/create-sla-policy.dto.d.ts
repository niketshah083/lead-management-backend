export declare class CreateSlaPolicyDto {
    name: string;
    firstResponseMinutes: number;
    followUpMinutes?: number;
    resolutionMinutes: number;
    warningThresholdPercent?: number;
    isDefault?: boolean;
}
