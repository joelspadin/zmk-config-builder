import { createStyles, makeStyles, Theme, Typography } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        block: {
            '& p:first-child': {
                marginTop: 0,
            },
            '& p:last-child': {
                marginBottom: 0,
            },
        },
    })
);

export interface ParagraphBlock {}

const ParagraphBlock: React.FunctionComponent<ParagraphBlock> = ({ children }) => {
    const classes = useStyles();

    return (
        <Typography component="div" className={classes.block}>
            {children}
        </Typography>
    );
};

export default ParagraphBlock;
