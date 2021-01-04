import type { OptionsObject, ProviderContext, SnackbarKey, SnackbarMessage } from 'notistack';

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
            vertical: 'top',
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
