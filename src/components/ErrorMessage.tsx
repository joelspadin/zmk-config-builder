import React from 'react';
import PropTypes from 'prop-types';
import { Alert, AlertTitle } from '@material-ui/lab';

export interface ErrorMessageProps {
    error: string | Error;
}

const ErrorMessage: React.FunctionComponent<ErrorMessageProps> = ({ error }) => {
    return (
        <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {typeof error === 'string' ? error : error.message}
        </Alert>
    );
};

ErrorMessage.propTypes = {
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Error)]).isRequired,
};

export default ErrorMessage;
