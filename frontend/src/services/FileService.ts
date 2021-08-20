export default class FileService {
    static download(data: string, filename: string, type = 'text/plain'): void {
        const blob = new Blob([data], {
            type: type,
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }
}
