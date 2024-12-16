

export function metersToKm(value: number): string {
    const kms = value / 1000;
    return `${kms.toFixed(0)}km`;
}