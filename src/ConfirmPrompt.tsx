import { DefaultButton, Dialog, DialogFooter, DialogType, IDialogContentProps, PrimaryButton } from '@fluentui/react';
import React, { useMemo, useState } from 'react';

export interface IConfirmPromptProps {
    hidden?: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    dismissText?: string;
    onConfirm?: () => any;
    onDismiss?: () => any;
}

const DefaultConfirmText = 'OK';
const DefaultDismissText = 'Cancel';

export const ConfirmPrompt: React.FunctionComponent<IConfirmPromptProps> = ({
    hidden,
    title,
    message,
    confirmText,
    dismissText,
    onConfirm,
    onDismiss,
}) => {
    const dialogContent = useMemo<IDialogContentProps>(() => {
        return {
            type: DialogType.normal,
            title,
            subText: message,
        };
    }, [title, message]);

    return (
        <Dialog dialogContentProps={dialogContent} hidden={hidden} onDismiss={onDismiss}>
            <DialogFooter>
                <PrimaryButton text={confirmText ?? DefaultConfirmText} onClick={onConfirm} />
                <DefaultButton text={dismissText ?? DefaultDismissText} onClick={onDismiss} />
            </DialogFooter>
        </Dialog>
    );
};

export interface IConfirmHookState<T> {
    show: (data: T) => void;
    hide: () => void;

    data?: T;
    callback: (data: T) => any;
    props: Partial<IConfirmPromptProps>;
}

export function useConfirmPrompt<T>(callback: (data: T) => any) {
    const [data, setData] = useState<T | undefined>(undefined);
    const [hidden, setHidden] = useState(true);

    const show = (data: T) => {
        setData(data);
        setHidden(false);
    };
    const hide = () => {
        setData(undefined);
        setHidden(true);
    };

    return {
        show,
        hide,
        data,
        callback,
        props: {
            hidden,
            onConfirm: () => {
                callback(data!);
                hide();
            },
            onDismiss: hide,
        },
    };
}
