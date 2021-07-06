import { Dispatch, Reducer, ReducerAction, ReducerState, useEffect, useReducer } from 'react';
import { useLocalStorage } from 'react-use';

export function useLocalStorageReducer<R extends Reducer<any, any>>(
    key: string,
    reducer: R,
    initialState: ReducerState<R>,
): [ReducerState<R>, Dispatch<ReducerAction<R>>] {
    const [store, setStore] = useLocalStorage(key, initialState);
    const [state, dispatch] = useReducer(reducer, store ?? initialState);

    useEffect(() => {
        setStore(state);
    }, [state]);

    return [state, dispatch];
}
