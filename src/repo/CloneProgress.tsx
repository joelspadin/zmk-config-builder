import { GitProgressEvent } from 'isomorphic-git';

export enum CloneState {
    Default,
    Cloning,
    Done,
    Error,
}

export interface ProgressDetails {
    percentComplete: number;
    progressText: string;
    isComplete: boolean;
}

export function getProgressDetails(state: CloneState, progress?: GitProgressEvent): ProgressDetails {
    let percentComplete = 0;
    let progressText = '';
    let isComplete = false;

    if (state === CloneState.Done) {
        percentComplete = 100;
        progressText = 'Done';
        isComplete = true;
    } else if (progress) {
        percentComplete = (progress.loaded / progress.total) * 100;
        progressText = progress.phase;
    }

    return { percentComplete, progressText, isComplete };
}
