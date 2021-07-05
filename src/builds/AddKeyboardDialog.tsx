import {
    classNamesFunction,
    DefaultButton,
    DialogFooter,
    FontWeights,
    IModalProps,
    IStackProps,
    IStyle,
    Modal,
    PrimaryButton,
    Stack,
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
        throw new Error('No main board selected.');
    }

    extraArgs = extraArgs || undefined;

    const mainParts = makeArray(mainBoard.parts);
    const mcuParts = mcuBoard && makeArray(mcuBoard.parts);

    if (mainBoard.type === 'shield') {
        if (!mcuParts || mcuParts.length === 0) {
            throw new Error('No MCU board selected.');
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

        onConfirm(getBuildItems(mainBoard, mcuBoard));
        setMainBoard(undefined);
    }, [mainBoard, mcuBoard]);

    const disabled = !mainBoard || (mainBoard.type === 'shield' && !mcuBoard);

    return (
        <Modal topOffsetFixed {...props}>
            <div id={titleId} className={classNames.header}>
                Add keyboard
            </div>
            <div className={classNames.content}>
                <Stack {...stackProps}>
                    <KeyboardSelect label="Keyboard" value={mainBoard} onChange={setMainBoard} options={mainBoards} />
                    {mainBoard?.type === 'shield' && (
                        <KeyboardSelect label="MCU Board" value={mcuBoard} onChange={setMcuBoard} options={mcuBoards} />
                    )}
                </Stack>
                <DialogFooter>
                    <PrimaryButton text="Add keyboard" onClick={addKeyboard} disabled={disabled} />
                    <DefaultButton text="Cancel" onClick={() => props.onDismiss?.()} />
                </DialogFooter>
            </div>
        </Modal>
    );
};
