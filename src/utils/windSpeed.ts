export function  convertWindSpeed(inMps: number): string {
    const inKph = inMps * 3.6;
    return `${inKph.toFixed(0)}km/h`;
}