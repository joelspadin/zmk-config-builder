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
import React, { useState } from 'react';
import { Prompt, useHistory, useLocation } from 'react-router-dom';
import { useBeforeUnload } from 'react-use';

export interface IUnsavedChangesPromptProps {
    hasChanges: boolean;
}

const message = 'Your unsaved changes will be lost. Are you sure you want to leave?';

const dialogContent: IDialogContentProps = {
    type: DialogType.normal,
    title: 'Unsaved Changes',
    subText: message,
};

const modalProps: IModalProps = {
    isBlocking: true,
};

interface NextLocation {
    location: Location;
    action: Action;
}

export const UnsavedChangesPrompt: React.FunctionComponent<IUnsavedChangesPromptProps> = ({ hasChanges }) => {
    useBeforeUnload(hasChanges, message);

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
            <Prompt when={hasChanges && !nextLocation} message={onPrompt} />
            <Dialog
                hidden={!showDialog}
                dialogContentProps={dialogContent}
                modalProps={modalProps}
                onDismiss={onCancelNavigate}
            >
                <DialogFooter>
                    <PrimaryButton text="Stay on page" onClick={onCancelNavigate} />
                    <DefaultButton text="Leave page" onClick={onConfirmNavigate} />
                </DialogFooter>
            </Dialog>
        </>
    );
};
