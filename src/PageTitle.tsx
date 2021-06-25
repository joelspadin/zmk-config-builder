import { mergeStyleSets, Text } from '@fluentui/react';
import React from 'react';

const classNames = mergeStyleSets({
    header: {
        marginTop: 32,
        marginBottom: 32,
    },
});

export const PageTitle: React.FunctionComponent = ({ children }) => {
    return (
        <Text block as="h1" variant="xxLargePlus" className={classNames.header}>
            {children}
        </Text>
    );
};
