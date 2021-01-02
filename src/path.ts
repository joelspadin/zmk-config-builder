export function splitExt(path: string): [string, string] {
    const sep = path.lastIndexOf('.');
    if (sep >= 0) {
        return [path.substring(0, sep), path.substring(sep)];
    }

    return [path, ''];
}
