import {
    DefaultButton,
    Dialog,
    DialogFooter,
    DialogType,
    IDialogContentProps,
    IModalProps,
    PrimaryButton,
} from '@fluentui/react';
import { Action, Location } from 'history';
import React, { useMemo, useState } from 'react';
import { Prompt, useHistory, useLocation } from 'react-router-dom';
import { useBeforeUnload } from 'react-use';

const DEFAULT_TITLE = 'Work in progress';
const DEFAULT_MESSAGE =
    'Leaving while a Git operation is in progress may corrupt the repo. Are you sure you want to leave?';
const DEFAULT_STAY_TEXT = 'Stay on page';
const DEFAULT_LEAVE_TEXT = 'Leave page';

const modalProps: IModalProps = {
    isBlocking: true,
};

interface NextLocation {
    location: Location;
    action: Action;
}

export interface INavLockPromptProps {
    locked: boolean;
    title?: string;
    message?: string;
    stayText?: string;
    leaveText?: string;
}

export const NavLockPrompt: React.FunctionComponent<INavLockPromptProps> = ({
    locked,
    title,
    message,
    stayText,
    leaveText,
}) => {
    title = title ?? DEFAULT_TITLE;
    message = message ?? DEFAULT_MESSAGE;
    stayText = stayText ?? DEFAULT_STAY_TEXT;
    leaveText = leaveText ?? DEFAULT_LEAVE_TEXT;

    useBeforeUnload(locked, message);

    const dialogContent = useMemo<IDialogContentProps>(
        () => ({
            type: DialogType.normal,
            title,
            subText: message,
        }),
        [message, title],
    );

    const history = useHistory();
    const currentLocation = useLocation();

    const [showDialog, setShowDialog] = useState(false);
    const [nextLocation, setNextLocation] = useState<NextLocation>();

    const onPrompt = (location: Location, action: Action) => {
        if (location.pathname === currentLocation.pathname) {
            return true;
        }

        setNextLocation({ location, action });
        setShowDialog(true);
        return false;
    };

    const onCancelNavigate = () => {
        setNextLocation(undefined);
        setShowDialog(false);
    };

    const onConfirmNavigate = () => {
        setShowDialog(false);

        if (!nextLocation) {
            return;
        }

        switch (nextLocation.action) {
            case 'POP':
                history.goBack();
                break;

            case 'PUSH':
                history.push(nextLocation.location.pathname);
                break;

            case 'REPLACE':
                history.replace(nextLocation.location.pathname);
                break;
        }
    };

    return (
        <>
            <Prompt when={locked && !nextLocation} message={onPrompt} />
            <Dialog
                hidden={!showDialog}
                dialogContentProps={dialogContent}
                modalProps={modalProps}
                onDismiss={onCancelNavigate}
            >
                <DialogFooter>
                    <PrimaryButton text={leaveText} onClick={onConfirmNavigate} />
                    <DefaultButton text={stayText} onClick={onCancelNavigate} autoFocus />
                </DialogFooter>
            </Dialog>
        </>
    );
};
