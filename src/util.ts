import type { OptionsObject, SnackbarKey, SnackbarMessage } from 'notistack';

export function getPopupPosition(parent: Window, width: number, height: number) {
    const top = parent.top.screenY + (parent.top.outerHeight - height) / 2;
    const left = parent.top.screenX + (parent.top.outerWidth - width) / 2;
    return { top, left };
}

export function getPopupFeatures(features: Record<string, unknown>) {
    return Object.entries(features)
        .map(([key, value]) => `${key}=${value}`)
        .join(',');
}

export function getDefaultPopupFeatures(parent: Window, width: number, height: number) {
    const { top, left } = getPopupPosition(parent, width, height);
    return getPopupFeatures({ top, left, width, height });
}

export function showModalError(
    enqueueSnackbar: (message: SnackbarMessage, options?: OptionsObject) => SnackbarKey,
    error: any
) {
    enqueueSnackbar(error.toString(), {
        variant: 'error',
        persist: true,
        anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
        },
    });
}

export function showMessage(
    enqueueSnackbar: (message: SnackbarMessage, options?: OptionsObject) => SnackbarKey,
    message: SnackbarMessage
) {
    enqueueSnackbar(message, {
        variant: 'info',
        anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
        },
    });
}

export type ThenArg<T> = T extends PromiseLike<infer U> ? ThenArg<U> : T;

export function basename(path: string) {
    const index = path.lastIndexOf('/');
    if (index < 0) {
        return path;
    }

    return path.substr(index + 1);
}

export function groupBy<K, V>(items: V[], keyFunc: (item: V) => K): Map<K, V[]> {
    const map = new Map<K, V[]>();

    for (const item of items) {
        const key = keyFunc(item);
        const group = map.get(key);
        if (group) {
            group.push(item);
        } else {
            map.set(key, [item]);
        }
    }

    return map;
}

export function flatten<T>(array: T[][]): T[] {
    return array.reduce((prev, current) => {
        prev.push(...current);
        return prev;
    }, []);
}
