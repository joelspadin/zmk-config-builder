export function groupBy<T, K extends string | symbol | number>(
    items: readonly T[],
    key: (item: T) => K,
): Record<K, T[]> {
    return items.reduce((grouped, item) => {
        const k = key(item);

        grouped[k] = grouped[k] ?? [];
        grouped[k].push(item);

        return grouped;
    }, {} as Record<K, T[]>);
}
