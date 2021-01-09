import React from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    LinearProgress,
    Link,
    Typography,
} from '@material-ui/core';

export enum ModifyState {
    None,
    Working,
    Done,
}

export interface ModifyDialogProps {
    state: ModifyState;
    pullRequestUrl?: string;
    onClose?: () => void;
}

const ModifyDialog: React.FunctionComponent<ModifyDialogProps> = ({ state, pullRequestUrl, onClose }) => {
    function handleContinue() {
        onClose?.();
    }

    function getContent() {
        switch (state) {
            case ModifyState.None:
                return null;

            case ModifyState.Working:
                return <LinearProgress />;

            case ModifyState.Done:
                return (
                    <Typography variant="body1">
                        A pull request was created. To see and confirm the changes, please open{' '}
                        <Link target="_blank" href={pullRequestUrl}>
                            {pullRequestUrl}
                        </Link>{' '}
                    </Typography>
                );
        }
    }

    return (
        <Dialog
            disableBackdropClick
            disableEscapeKeyDown
            fullWidth
            maxWidth="sm"
            aria-labelledby="modify-repo-title"
            open={state !== ModifyState.None}
        >
            <DialogTitle id="modify-repo-title">Updating Repo</DialogTitle>
            <DialogContent>{getContent()}</DialogContent>
            <DialogActions>
                <Button color="primary" disabled={state !== ModifyState.Done} onClick={handleContinue}>
                    Continue
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ModifyDialog.propTypes = {
    state: PropTypes.number.isRequired,
    pullRequestUrl: PropTypes.string,
    onClose: PropTypes.func,
};

export default ModifyDialog;
