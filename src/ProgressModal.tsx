import {
    classNamesFunction,
    DefaultFontStyles,
    DialogFooter,
    FontSizes,
    FontWeights,
    getIcon,
    IModalProps,
    IStyle,
    Modal,
    PrimaryButton,
    ProgressIndicator,
    Theme,
    useTheme,
} from '@fluentui/react';
import { useId } from '@fluentui/react-hooks';
import React from 'react';

interface IProgressModalStyles {
    root: IStyle;
    header: IStyle;
    content: IStyle;
    progress: IStyle;
    error: IStyle;
}

const getClassNames = classNamesFunction<Theme, IProgressModalStyles>();

export interface IProgressModalProps extends IModalProps {
    isComplete?: boolean;
    title?: string;
    progressLabel?: string;
    progressDescription?: string;
    percentComplete?: number;
    errorText?: string;
}

export const ProgressModal: React.FunctionComponent<IProgressModalProps> = ({
    isComplete,
    title,
    progressLabel,
    progressDescription,
    percentComplete,
    errorText,
    ...props
}) => {
    const titleId = useId('title');
    const theme = useTheme();

    const classNames = getClassNames(() => {
        const icon = getIcon('ErrorBadge');

        return {
            root: {
                display: 'flex',
                flexFlow: 'column nowrap',
                alignItems: 'stretch',
            },
            header: [
                DefaultFontStyles.xLarge,
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
            progress: {},
            error: [
                theme.fonts.small,
                {
                    display: 'flex',
                    flexFlow: 'row',
                    background: theme.semanticColors.errorBackground,
                    color: theme.semanticColors.errorText,
                    borderRadius: theme.effects.roundedCorner2,
                    padding: 8,
                    paddingInlineStart: 12,
                    '::before': {
                        fontFamily: icon?.subset.fontFace?.fontFamily,
                        fontSize: FontSizes.size16,
                        content: `"${icon?.code}"`,
                        display: 'inline-block',
                        paddingInlineEnd: 8,
                    } as IStyle,
                },
            ],
        };
    }, theme);

    return (
        <Modal isBlocking topOffsetFixed titleAriaId={titleId} {...props}>
            <div id={titleId} className={classNames.header}>
                {title}
            </div>
            <div className={classNames.content}>
                <ProgressIndicator
                    className={classNames.progress}
                    label={progressLabel}
                    description={progressDescription}
                    percentComplete={percentComplete}
                />
                {errorText && <div className={classNames.error}>{errorText}</div>}
                <DialogFooter>
                    <PrimaryButton text="OK" disabled={!isComplete} onClick={() => props.onDismiss?.()} />
                </DialogFooter>
            </div>
        </Modal>
    );
};
