import {
    createStyles,
    Grid,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    ListSubheader,
    makeStyles,
    MenuItem,
    TextField,
    Tooltip,
} from '@material-ui/core';
import { Delete, KeyboardOutlined } from '@material-ui/icons';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import type { BuildTarget } from '../../targets';
import { KeyboardListDispatch } from './KeyboardListReducer';

const useStyles = makeStyles((theme) =>
    createStyles({
        content: {
            display: 'flex',
            flexDirection: 'row',
        },
        select: {
            minWidth: 160,
            width: '100%',
        },
    })
);

export interface BuildTargetGroup {
    name: string;
    targets: BuildTarget[];
}

export interface KeyboardItemProps {
    keyboardOptions: BuildTargetGroup[];
    controllerOptions: BuildTargetGroup[];
    index: number;
    keyboard?: BuildTarget;
    controller?: BuildTarget;
    noController?: boolean;
}

const KeyboardItem: React.FunctionComponent<KeyboardItemProps> = (props) => {
    const dispatch = useContext(KeyboardListDispatch);
    const classes = useStyles();

    function handleChangeKeyboard(event: React.ChangeEvent<HTMLInputElement>) {
        const selected = findTarget(props.keyboardOptions, event.target.value);
        dispatch({ type: 'set-keyboard', index: props.index, keyboard: selected });
    }

    function handleChangeController(event: React.ChangeEvent<HTMLInputElement>) {
        const selected = findTarget(props.controllerOptions, event.target.value);
        dispatch({ type: 'set-controller', index: props.index, controller: selected });
    }

    function handleRemoveItem() {
        dispatch({ type: 'remove', index: props.index });
    }

    return (
        <ListItem>
            <ListItemIcon>
                <KeyboardOutlined />
            </ListItemIcon>
            <ListItemText>
                <Grid container direction="row" spacing={2}>
                    <Grid item xs>
                        <TextField
                            select
                            variant="outlined"
                            label="Keyboard"
                            className={classes.select}
                            value={props.keyboard?.name ?? ''}
                            onChange={handleChangeKeyboard}
                        >
                            {getMenuItems(props.keyboardOptions)}
                        </TextField>
                    </Grid>
                    {!props.noController && props.keyboard?.type === 'shield' && (
                        <Grid item xs>
                            <TextField
                                select
                                required
                                variant="outlined"
                                label="Controller"
                                className={classes.select}
                                value={props.controller?.name ?? ''}
                                error={props.controller === undefined}
                                onChange={handleChangeController}
                            >
                                {getMenuItems(props.controllerOptions)}
                            </TextField>
                        </Grid>
                    )}
                </Grid>
            </ListItemText>
            <ListItemSecondaryAction>
                <Tooltip title="Remove keyboard" aria-label="remove keyboard">
                    <IconButton edge="end" onClick={handleRemoveItem}>
                        <Delete />
                    </IconButton>
                </Tooltip>
            </ListItemSecondaryAction>
        </ListItem>
    );
};

KeyboardItem.propTypes = {
    keyboardOptions: PropTypes.array.isRequired,
    controllerOptions: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired,
    keyboard: PropTypes.any,
    controller: PropTypes.any,
    noController: PropTypes.bool,
};

export default KeyboardItem;

function getMenuItems(groups: BuildTargetGroup[]) {
    if (groups.length === 1) {
        return getGroupItems(groups[0].targets);
    }

    return groups.map((group) => [
        <ListSubheader key={group.name}>{group.name}</ListSubheader>,
        ...getGroupItems(group.targets),
    ]);
}

function getGroupItems(options: BuildTarget[]) {
    return options.map((option) => (
        <MenuItem key={option.name} value={option.name}>
            {option.name}
        </MenuItem>
    ));
}

function findTarget(groups: BuildTargetGroup[], name: string) {
    for (const group of groups) {
        const result = group.targets.find((item) => item.name === name);
        if (result) {
            return result;
        }
    }

    return undefined;
}
