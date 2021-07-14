import React, { createContext, DependencyList, useCallback, useContext, useMemo, useReducer } from 'react';
import { INavLockPromptProps, NavLockPrompt } from './NavLockPrompt';

export interface INavLock {
    lock(): void;
    unlock(): void;
}

export const NavLockContext = createContext<INavLock>({ lock: () => undefined, unlock: () => undefined });

export type INavLockProviderProps = Omit<INavLockPromptProps, 'locked'>;

type LockAction = 'lock' | 'unlock';

const lockReducer: React.Reducer<number, LockAction> = (state, action) => {
    if (action === 'lock') {
        return state + 1;
    } else {
        return state - 1;
    }
};

export const NavLockProvider: React.FunctionComponent<INavLockProviderProps> = ({ children, ...props }) => {
    const [lockCount, dispatch] = useReducer(lockReducer, 0);

    const locker = useMemo<INavLock>(
        () => ({
            lock: () => dispatch('lock'),
            unlock: () => dispatch('unlock'),
        }),
        [dispatch],
    );

    return (
        <>
            <NavLockContext.Provider value={locker}>{children}</NavLockContext.Provider>
            <NavLockPrompt locked={lockCount > 0} {...props} />
        </>
    );
};

export function useNavLock(): INavLock {
    return useContext(NavLockContext);
}

type AsyncFunction = (...args: never[]) => Promise<unknown>;

/**
 * Wraps a function in a new function which locks navigation while it is running.
 */
export function wrapNavLock<T extends AsyncFunction>(locker: INavLock, callback: T): T {
    return (async (...args) => {
        try {
            locker.lock();
            return await callback(...args);
        } finally {
            locker.unlock();
        }
    }) as T;
}

/**
 * useCallback() but locks navigation while it is running.
 */
export function useNavLockCallback<T extends AsyncFunction>(callback: T, deps: DependencyList): T {
    const locker = useNavLock();

    return useCallback<T>(wrapNavLock(locker, callback), [locker, callback, ...deps]);
}
