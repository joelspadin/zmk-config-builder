import {
    AppBar,
    Button,
    Container,
    createMuiTheme,
    createStyles,
    CssBaseline,
    makeStyles,
    ThemeProvider,
    Toolbar,
    Typography,
    useMediaQuery,
} from '@material-ui/core';
import { indigo, purple } from '@material-ui/core/colors';
import { SnackbarAction, SnackbarProvider } from 'notistack';
import React, { useMemo, useRef } from 'react';
import ConfigWizard from './Wizard/ConfigWizard';
import { OctokitProvider } from './OctokitProvider';
import { RepoProvider } from './Wizard/RepoProvider';
import { AuthProvider, useSignedIn } from './SignIn/AuthProvider';
import SignInForm from './SignIn/SignInForm';
import SignOutButton from './SignIn/SignOutButton';

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            paddingTop: theme.spacing(5),
        },
        title: {
            flexGrow: 1,
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

const RootProviders: React.FunctionComponent = ({ children }) => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const theme = useMemo(() => {
        const nextTheme = createMuiTheme({
            palette: {
                type: prefersDarkMode ? 'dark' : 'light',
                primary: {
                    main: indigo[400],
                },
                secondary: {
                    main: purple['A400'],
                },
            },
        });

        if (prefersDarkMode) {
            nextTheme.palette.background.default = '#18191a';
            nextTheme.palette.background.paper = nextTheme.palette.grey[900];
        } else {
            nextTheme.palette.background.default = '#fff';
            nextTheme.palette.background.paper = nextTheme.palette.grey[100];
        }

        return nextTheme;
    }, [prefersDarkMode]);

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
            <SnackbarProvider ref={notistackRef} action={dismissAction}>
                <AuthProvider>{children}</AuthProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
};

const Header: React.FunctionComponent = () => {
    const classes = useStyles();
    const isSignedIn = useSignedIn();

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" className={classes.title}>
                    ZMK Config Builder
                </Typography>
                {isSignedIn && <SignOutButton />}
            </Toolbar>
        </AppBar>
    );
};

const AppContent: React.FunctionComponent = () => {
    const isSignedIn = useSignedIn();

    if (!isSignedIn) {
        return <SignInForm />;
    }

    return (
        <OctokitProvider>
            <RepoProvider>
                <ConfigWizard />
            </RepoProvider>
        </OctokitProvider>
    );
};
