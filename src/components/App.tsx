import {
    AppBar,
    Button,
    Container,
    createMuiTheme,
    createStyles,
    CssBaseline,
    Link,
    LinkProps,
    makeStyles,
    ThemeProvider,
    Toolbar,
    Typography,
    useMediaQuery,
} from '@material-ui/core';
import { indigo, purple } from '@material-ui/core/colors';
import { GitHub } from '@material-ui/icons';
import { SnackbarAction, SnackbarProvider } from 'notistack';
import PropTypes from 'prop-types';
import React, { createContext, Dispatch, useContext, useMemo, useRef } from 'react';
import { useLocalStorage } from 'react-use';
import { CONFIG_BUILDER_REPO_URL } from '../config';
import DarkModeSwitch from './DarkModeSwitch';
import { OctokitProvider } from './OctokitProvider';
import { AuthProvider, useSignedIn } from './SignIn/AuthProvider';
import SignInPage from './SignIn/SignInPage';
import SignOutButton from './SignIn/SignOutButton';
import ConfigWizard from './Wizard/ConfigWizard';
import { RepoProvider } from './Wizard/RepoProvider';

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            paddingTop: theme.spacing(5),
        },
        title: {
            flexGrow: 1,
        },
        menuButton: {
            marginRight: theme.spacing(1),
        },
        iconLink: {
            color: theme.palette.text.primary,
            '& :hover': {
                color: theme.palette.text.secondary,
            },
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        },
    })
);

interface AppProps {}

const App: React.FunctionComponent<AppProps> = () => {
    const classes = useStyles();
    // TODO: change to ScopedCssBaseline if incorporating into main ZMK site.
    return (
        <RootProviders>
            <CssBaseline>
                <Header />
                <Container maxWidth="md" className={classes.root}>
                    <AppContent />
                </Container>
            </CssBaseline>
        </RootProviders>
    );
};

export default App;

const DarkMode = createContext<boolean>(false);
const DarkModeDispatch = createContext<Dispatch<boolean>>(() => {});

const RootProviders: React.FunctionComponent = ({ children }) => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
    const [darkMode, setDarkMode] = useLocalStorage('darkmode', prefersDarkMode);

    const theme = useMemo(() => {
        const nextTheme = createMuiTheme({
            palette: {
                type: darkMode ? 'dark' : 'light',
                primary: {
                    main: indigo[400],
                },
                secondary: {
                    main: purple['A400'],
                },
            },
        });

        if (darkMode) {
            nextTheme.palette.background.default = '#18191a';
            nextTheme.palette.background.paper = nextTheme.palette.grey[900];
        } else {
            nextTheme.palette.background.default = nextTheme.palette.common.white;
            nextTheme.palette.background.paper = nextTheme.palette.grey[100];
        }

        return nextTheme;
    }, [darkMode]);

    const notistackRef = useRef<SnackbarProvider | null>(null);

    const dismissAction: SnackbarAction = (key) => {
        function handleClickDismiss() {
            notistackRef.current?.closeSnackbar(key);
        }
        return <Button onClick={handleClickDismiss}>Dismiss</Button>;
    };

    // TODO: change to ScopedCssBaseline if incorporating into main ZMK site.
    return (
        <ThemeProvider theme={theme}>
            <DarkMode.Provider value={!!darkMode}>
                <DarkModeDispatch.Provider value={setDarkMode}>
                    <SnackbarProvider ref={notistackRef} action={dismissAction}>
                        <AuthProvider>{children}</AuthProvider>
                    </SnackbarProvider>
                </DarkModeDispatch.Provider>
            </DarkMode.Provider>
        </ThemeProvider>
    );
};

const Header: React.FunctionComponent = () => {
    const classes = useStyles();
    const isSignedIn = useSignedIn();
    const darkMode = useContext(DarkMode);
    const setDarkMode = useContext(DarkModeDispatch);

    function toggleDarkMode() {
        setDarkMode(!darkMode);
    }

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" className={classes.title}>
                    ZMK Config Builder
                </Typography>
                <GitHubLink className={classes.menuButton} />
                <DarkModeSwitch className={classes.menuButton} checked={darkMode} onChange={toggleDarkMode} />
                {isSignedIn && <SignOutButton />}
            </Toolbar>
        </AppBar>
    );
};

const AppContent: React.FunctionComponent = () => {
    const isSignedIn = useSignedIn();

    if (!isSignedIn) {
        return <SignInPage />;
    }

    return (
        <OctokitProvider>
            <RepoProvider>
                <ConfigWizard />
            </RepoProvider>
        </OctokitProvider>
    );
};

const GitHubLink: React.FunctionComponent<LinkProps> = (props) => {
    const classes = useStyles();
    return (
        <Link
            {...props}
            className={`${classes.iconLink} ${props.className ?? ''}`}
            target="_blank"
            aria-label="Github repository"
            href={CONFIG_BUILDER_REPO_URL}
        >
            <GitHub />
        </Link>
    );
};

GitHubLink.propTypes = {
    className: PropTypes.string,
};
