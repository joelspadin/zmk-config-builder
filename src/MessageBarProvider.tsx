import { IMessageBarProps, MessageBar, MessageBarType } from '@fluentui/react';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type IMessageBarText = string | Error | JSX.Element;

export type IMessageBarContent =
    | IMessageBarText
    | {
          text: IMessageBarText;
          actions?: JSX.Element;
      };

export interface IMessageBarControl {
    info(content: IMessageBarContent): void;
    success(content: IMessageBarContent): void;
    error(content: IMessageBarContent): void;
    dismiss(): void;
}

export const MessageBarContext = createContext<IMessageBarControl>({
    info: () => {},
    success: () => {},
    error: () => {},
    dismiss: () => {},
});

export interface IMessageBarProviderProps {
    className?: string;
}

function getText(content: IMessageBarContent): string | JSX.Element {
    if (content instanceof Error) {
        return content.message;
    }

    if (typeof content === 'object' && 'text' in content) {
        return getText(content.text);
    }

    return content;
}

function getActions(content: IMessageBarContent): JSX.Element | undefined {
    if (typeof content === 'object' && 'actions' in content) {
        return content.actions;
    }

    return undefined;
}

export const MessageBarProvider: React.FunctionComponent<IMessageBarProviderProps> = ({ children, className }) => {
    const [show, setShow] = useState(false);
    const [props, setProps] = useState<IMessageBarProps>();
    const [content, setContent] = useState<React.ReactNode>();

    const messageFn = useCallback(
        (type: MessageBarType) => (content: IMessageBarContent) => {
            setShow(true);
            setContent(getText(content));
            setProps({
                messageBarType: type,
                actions: getActions(content),
            });
        },
        [setShow, setContent, setProps],
    );

    const message = useMemo<IMessageBarControl>(() => {
        return {
            info: messageFn(MessageBarType.info),
            success: messageFn(MessageBarType.success),
            error: messageFn(MessageBarType.error),
            dismiss: () => {
                setContent(undefined);
                setProps(undefined);
                setShow(false);
            },
        };
    }, [setShow, messageFn]);

    return (
        <MessageBarContext.Provider value={message}>
            {show && (
                <MessageBar {...props} className={className} onDismiss={message.dismiss}>
                    {content}
                </MessageBar>
            )}
            {children}
        </MessageBarContext.Provider>
    );
};

export function useMessageBar() {
    return useContext(MessageBarContext);
}
