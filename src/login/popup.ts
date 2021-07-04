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
