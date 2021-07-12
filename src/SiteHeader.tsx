import {
    classNamesFunction,
    ContextualMenu,
    ContextualMenuItemType,
    IContextualMenuItem,
    IPersonaSharedProps,
    IStackTokens,
    IStyle,
    IToggleStyles,
    mergeStyleSets,
    Persona,
    PersonaSize,
    Stack,
    Text,
    Theme,
    Toggle,
    useTheme,
} from '@fluentui/react';
import React, { HTMLAttributes, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { ExternalLink } from './ExternalLink';
import { useAuth, useGitRemote } from './git/GitRemoteProvider';
import logoUrl from './logo.svg';
import { mediaQuery } from './styles';
import { DarkModeContext } from './ThemeProvider';

export const SiteHeaderHeight = 48;

const classNames = mergeStyleSets({
    root: {
        height: SiteHeaderHeight,
        padding: '0px 8px',
        [mediaQuery.widthMedium]: {
            paddingLeft: 0,
        },
    } as IStyle,
    brand: {
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
    } as IStyle,
    icon: {
        width: 32,
        height: 32,
        paddingLeft: 8,
        marginRight: 8,
        display: 'none',
        [mediaQuery.widthMedium]: {
            display: 'block',
        },
    } as IStyle,
    title: {
        lineHeight: SiteHeaderHeight,
        fontWeight: 600,
    } as IStyle,
    links: {
        display: 'none',
        justifyContent: 'flex-end',
        marginRight: 20,
        [mediaQuery.widthMedium]: {
            display: 'flex',
        },
        a: {
            textDecoration: 'none',
            display: 'inline-block',
            boxSizing: 'border-box',
            height: SiteHeaderHeight,
            padding: '15px 8px 11px',
            ':hover, :focus': {
                textDecoration: 'underline',
            },
        },
    } as IStyle,
    persona: {
        cursor: 'pointer',
    } as IStyle,
});

const stackTokens: IStackTokens = {
    childrenGap: 20,
};

const linkStackTokens: IStackTokens = {
    childrenGap: 8,
};

const toggleStyles: Partial<IToggleStyles> = {
    root: { marginBottom: 0 },
    label: {
        display: 'none',
        [mediaQuery.widthMedium]: {
            display: 'block',
        },
    },
};

interface IHeaderStyles {
    links: IStyle;
}

const getClassNames = classNamesFunction<Theme, IHeaderStyles>();

export const SiteHeader: React.FunctionComponent<HTMLAttributes<HTMLElement>> = ({ className, ...props }) => {
    const userRef = useRef(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [darkMode, setDarkMode] = useContext(DarkModeContext);
    const history = useHistory();
    const theme = useTheme();
    const auth = useAuth();
    const remote = useGitRemote();

    const onShowUserMenu = useCallback((ev: React.MouseEvent<HTMLElement>) => {
        ev.preventDefault();
        setShowUserMenu(true);
    }, []);
    const onHideUserMenu = useCallback(() => setShowUserMenu(false), []);

    const themeClasses = getClassNames(() => {
        return {
            links: {
                'a, a:visited': {
                    color: theme.palette.neutralPrimary,
                },
            },
        };
    }, theme);

    const userMenuItems = useMemo<IContextualMenuItem[]>(
        () => [
            {
                key: 'header',
                text: `Signed in to ${remote.providerName}`,
                itemType: ContextualMenuItemType.Header,
            },
            {
                key: 'signout',
                text: 'Sign out',
                onClick: () => {
                    auth.signOut();
                    history.push('/');
                },
            },
        ],
        [remote],
    );

    const persona = useMemo<IPersonaSharedProps>(() => {
        return {
            text: remote.username,
            imageUrl: remote.avatarUrl,
            size: PersonaSize.size32,
        };
    }, [remote]);

    return (
        <header className={`${classNames.root} ${className ?? ''}`} {...props}>
            <Stack horizontal wrap verticalAlign="center" tokens={stackTokens}>
                <Stack.Item>
                    <Link to="/" className={classNames.brand}>
                        <img src={logoUrl} alt="ZMK logo" className={classNames.icon} />
                        <Text variant="large" className={classNames.title}>
                            ZMK Config Builder
                        </Text>
                    </Link>
                </Stack.Item>
                <Stack.Item grow>
                    <Stack
                        as="nav"
                        horizontal
                        className={`${classNames.links} ${themeClasses.links}`}
                        tokens={linkStackTokens}
                    >
                        <ExternalLink noIcon href="https://zmk.dev">
                            ZMK Firmware
                        </ExternalLink>
                        <ExternalLink noIcon href="https://github.com/joelspadin/zmk-config-builder">
                            GitHub
                        </ExternalLink>
                    </Stack>
                </Stack.Item>
                <Stack.Item>
                    <Toggle
                        label="Theme"
                        inlineLabel
                        styles={toggleStyles}
                        onText="Dark"
                        offText="Light"
                        checked={darkMode}
                        onChange={(ev, checked) => {
                            setDarkMode(!!checked);
                        }}
                    />
                </Stack.Item>
                {remote.isAuthenticated && (
                    // TODO: get GitHub name, show logout button
                    <Stack.Item>
                        <Persona {...persona} className={classNames.persona} ref={userRef} onClick={onShowUserMenu} />
                        <ContextualMenu
                            items={userMenuItems}
                            hidden={!showUserMenu}
                            target={userRef}
                            onItemClick={onHideUserMenu}
                            onDismiss={onHideUserMenu}
                        />
                    </Stack.Item>
                )}
            </Stack>
        </header>
    );
};
