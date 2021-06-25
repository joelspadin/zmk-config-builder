import { MessageBar, MessageBarType } from '@fluentui/react';
import React from 'react';

export const NotImplemented: React.FunctionComponent = () => {
    return <MessageBar messageBarType={MessageBarType.info}>Coming soon&trade;</MessageBar>;
};
