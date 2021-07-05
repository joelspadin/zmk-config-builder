import { IMessageBarProps, MessageBar, MessageBarType } from '@fluentui/react';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type IMessageBarContent =
    | JSX.Element
    | Error
    | {
          text: string | JSX.Element;
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

export const MessageBarProvider: React.FunctionComponent<IMessageBarProviderProps> = ({ children, className }) => {
    const [show, setShow] = useState(false);
    const [props, setProps] = useState<IMessageBarProps>();
    const [content, setContent] = useState<React.ReactNode>();

    const messageFn = useCallback(
        (type: MessageBarType) => (content: IMessageBarContent) => {
            const props: IMessageBarProps = {
                messageBarType: type,
            };

            console.log(content);

            if (content instanceof Error) {
                setContent(content.message);
            } else if (typeof content === 'object' && 'text' in content) {
                setContent(content.text);
                props.actions = content.actions;
            } else {
                setContent(content);
            }

            setProps(props);
            setShow(true);
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
