import {
    Callout,
    DefaultButton,
    DirectionalHint,
    FontSizes,
    IButtonStyles,
    IPivotStyles,
    ITextField,
    ITextFieldStyles,
    mergeStyleSets,
    Pivot,
    PivotItem,
    Stack,
    Text,
    TextField,
    useTheme,
} from '@fluentui/react';
import { useAsync, useBoolean, useId } from '@fluentui/react-hooks';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { RepoId } from '../git/IGitRemote';
import { CONTROL_WIDTH } from '../styles';

const BUTTON_WIDTH = 32;
const HIDE_COPIED_DELAY = 5000;

const classNames = mergeStyleSets({
    copied: {
        padding: '6px 14px',
    },
});

const pivotStyles: Partial<IPivotStyles> = {
    link: {
        fontSize: FontSizes.small,
        height: 32,
    },
};

enum Tabs {
    Https = 'https',
    GitHubCli = 'ghcli',
}

export interface ICloneUrlBadgeProps {
    cloneUrl?: string;
    repo?: RepoId;
}

export const CloneUrlBadge: React.FunctionComponent<ICloneUrlBadgeProps> = ({ cloneUrl, repo }) => {
    const async = useAsync();
    const theme = useTheme();
    const [tab, setTab] = useState(Tabs.Https);
    const [copiedVisible, { toggle: toggleCopiedVisible, setFalse: hideCopied }] = useBoolean(false);

    const textFieldStyles = useMemo<Partial<ITextFieldStyles>>(
        () => ({
            fieldGroup: {
                width: CONTROL_WIDTH - BUTTON_WIDTH,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderColor: theme.semanticColors.variantBorder,
                ':hover': {
                    borderColor: theme.semanticColors.variantBorder,
                },
            },
        }),
        [theme],
    );

    const buttonStyles = useMemo<Partial<IButtonStyles>>(
        () => ({
            root: {
                minWidth: BUTTON_WIDTH,
                width: BUTTON_WIDTH,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderColor: theme.semanticColors.buttonBorder,
            },
        }),
        [theme],
    );

    const buttonId = useId('copy-button');

    const copyText = useMemo(() => {
        switch (tab) {
            case Tabs.Https:
                return cloneUrl;

            case Tabs.GitHubCli:
                if (!repo || repo.type !== 'github') {
                    return undefined;
                }
                return `gh repo clone ${repo.owner}/${repo.name}`;
        }
    }, [cloneUrl, repo, tab]);

    const onCopy = useCallback(() => {
        if (!copyText) {
            return;
        }

        navigator.clipboard.writeText(copyText);
        toggleCopiedVisible();
        async.setTimeout(hideCopied, HIDE_COPIED_DELAY);
    }, [copyText, toggleCopiedVisible, async]);

    const ref = useRef<ITextField>(null);

    return (
        <>
            <Stack>
                <Pivot
                    headersOnly
                    styles={pivotStyles}
                    selectedKey={tab}
                    onLinkClick={(item) => setTab((item?.props.itemKey as Tabs) ?? Tabs.Https)}
                >
                    <PivotItem headerText="HTTPS" itemKey={Tabs.Https} />
                    {repo?.type === 'github' && <PivotItem headerText="GitHub CLI" itemKey={Tabs.GitHubCli} />}
                </Pivot>
                <Stack horizontal verticalAlign="end">
                    <TextField
                        value={copyText}
                        styles={textFieldStyles}
                        readOnly
                        componentRef={ref}
                        onFocus={() => ref.current?.select()}
                    />
                    <DefaultButton
                        id={buttonId}
                        styles={buttonStyles}
                        iconProps={{ iconName: 'ClipboardSolid' }}
                        ariaDescription="Copy repo clone URL"
                        onClick={onCopy}
                    />
                    {copiedVisible && (
                        <Callout
                            className={classNames.copied}
                            target={`#${buttonId}`}
                            onDismiss={toggleCopiedVisible}
                            directionalHint={DirectionalHint.topCenter}
                            role="status"
                            aria-live="assertive"
                        >
                            <Text variant="small">Copied!</Text>
                        </Callout>
                    )}
                </Stack>
            </Stack>
        </>
    );
};
