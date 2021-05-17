export function ISOtoString(dateString: string | null): string {
    if (dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const min = date.getMinutes();

        const monthString = month < 10 ? '0' + month : '' + month;
        const dayString = day < 10 ? '0' + day : '' + day;
        const hourString = hour < 10 ? '0' + hour : '' + hour;
        const minString = min < 10 ? '0' + min : '' + min;

        return `${year}-${monthString}-${dayString} ${hourString}:${minString}`;
    } else {
        return '-';
    }
}

export function millisecondsToHHMMSS(
    milliseconds: number | undefined | null,
): string {
    if (milliseconds) {
        const timeInSeconds = Math.abs(milliseconds) / 1000;
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds - hours * 3600) / 60);
        const seconds = Math.floor(timeInSeconds - hours * 3600 - minutes * 60);

        const hoursString = hours < 10 ? '0' + hours : hours;
        const minutesString = minutes < 10 ? '0' + minutes : minutes;
        const secondsString = seconds < 10 ? '0' + seconds : seconds;

        return (
            (milliseconds > 0 ? '' : '-') +
            `${hoursString}:${minutesString}:${secondsString}`
        );
    }
    return '';
}

export function parseISOString(iso8601: string): Date {
    const b = String(iso8601).split(/\D+/).map(Number);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}
