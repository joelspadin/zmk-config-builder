import { Alert, AlertTitle } from '@material-ui/lab';
import React from 'react';

const UnderConstruction: React.FunctionComponent = () => {
    return (
        <Alert severity="info">
            <AlertTitle>Under Construction</AlertTitle>
            This part of the site isn&apos;t ready yet. Please come back later.
        </Alert>
    );
};

export default UnderConstruction;
