import {
    classNamesFunction,
    DefaultButton,
    DialogFooter,
    FontWeights,
    IModalProps,
    IStackProps,
    IStyle,
    MessageBar,
    MessageBarType,
    Modal,
    PrimaryButton,
    Stack,
    TextField,
    Theme,
    useTheme,
} from '@fluentui/react';
import { useId } from '@fluentui/react-hooks';
import React, { useCallback, useState } from 'react';
import { IKeyboardComponent, KeyboardSelect } from '../KeyboardSelect';
import { IBuildItem } from './BuildMatrixProvider';

interface IDialogStyles {
    root: IStyle;
    header: IStyle;
    content: IStyle;
}

const getClassNames = classNamesFunction<Theme, IDialogStyles>();

export interface IAddKeyboardDialogProps extends IModalProps {
    onConfirm?: (items: IBuildItem[]) => any;
}

const stackProps: Partial<IStackProps> = {
    tokens: { childrenGap: 10 },
    styles: { root: { marginBottom: 24 } },
};

const mainBoards: IKeyboardComponent[] = [
    {
        type: 'shield',
        name: 'Corne',
        parts: ['corne_left', 'corne_right'],
    },
    {
        type: 'board',
        name: 'NumBLE',
        parts: 'numble',
    },
];
const mcuBoards: IKeyboardComponent[] = [
    {
        type: 'board',
        name: 'nice!nano',
        parts: 'nice_nano',
    },
    {
        type: 'board',
        name: 'nRFMicro v1.3',
        parts: 'nrfmicro_13',
    },
];

function makeArray<T>(obj: T | T[]) {
    return Array.isArray(obj) ? obj : [obj];
}

function getBuildItems(
    mainBoard?: IKeyboardComponent,
    mcuBoard?: IKeyboardComponent,
    extraArgs?: string,
): IBuildItem[] {
    if (!mainBoard) {
        throw new Error('Select a shield or standalone board.');
    }

    extraArgs = extraArgs || undefined;

    const mainParts = makeArray(mainBoard.parts);
    const mcuParts = mcuBoard && makeArray(mcuBoard.parts);

    if (mainBoard.type === 'shield') {
        if (!mcuParts || mcuParts.length === 0) {
            throw new Error('Select an MCU board.');
        }

        const board = mcuParts[0];
        return mainParts.map((shield) => {
            return { board, shield: shield, extraArgs };
        });
    }

    const shield = undefined;
    return mainParts.map((board) => {
        return { board, shield, extraArgs };
    });
}

export const AddKeyboardDialog: React.FunctionComponent<IAddKeyboardDialogProps> = ({ onConfirm, ...props }) => {
    const [mainBoard, setMainBoard] = useState<IKeyboardComponent | undefined>();
    const [mcuBoard, setMcuBoard] = useState<IKeyboardComponent | undefined>();
    const [extraArgs, setExtraArgs] = useState('');
    const [errorText, setErrorText] = useState<string>();

    const titleId = useId('title');
    const theme = useTheme();

    const classNames = getClassNames(() => {
        return {
            root: {
                display: 'flex',
                flexFlow: 'column nowrap',
                alignItems: 'stretch',
            },
            header: [
                theme.fonts.xLarge,
                {
                    fontWeight: FontWeights.semibold,
                    minHeight: 20,
                    padding: '16px 46px 20px 24px',
                },
            ],
            content: {
                padding: '0px 24px 24px',
                minWidth: 348,
            },
        };
    }, theme);

    const addKeyboard = useCallback(() => {
        if (!onConfirm) {
            return;
        }

        try {
            onConfirm(getBuildItems(mainBoard, mcuBoard, extraArgs));
            setMainBoard(undefined);
            setExtraArgs('');
        } catch (error) {
            setErrorText(error?.message ?? error.toString());
        }
    }, [mainBoard, mcuBoard, extraArgs]);

    return (
        <Modal topOffsetFixed {...props}>
            {errorText && (
                <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setErrorText(undefined)}>
                    {errorText}
                </MessageBar>
            )}
            <div id={titleId} className={classNames.header}>
                Add keyboard
            </div>
            <div className={classNames.content}>
                <Stack {...stackProps}>
                    <KeyboardSelect label="Keyboard" value={mainBoard} onChange={setMainBoard} options={mainBoards} />
                    {mainBoard?.type === 'shield' && (
                        <KeyboardSelect label="MCU Board" value={mcuBoard} onChange={setMcuBoard} options={mcuBoards} />
                    )}
                    <TextField
                        value={extraArgs}
                        label="Extra CMake args"
                        description="If you don't know what this is for, you don't need it. Leave it blank."
                        onChange={(ev, newValue) => setExtraArgs(newValue || '')}
                    />
                </Stack>
                <DialogFooter>
                    <PrimaryButton text="Add keyboard" onClick={addKeyboard} />
                    <DefaultButton text="Cancel" onClick={() => props.onDismiss?.()} />
                </DialogFooter>
            </div>
        </Modal>
    );
};
