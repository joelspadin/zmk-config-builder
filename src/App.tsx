import { classNamesFunction, IStyle, Theme, useTheme } from '@fluentui/react';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './git/AuthProvider';
import { GitApiProvider } from './git/GitApiProvider';
import { Routes } from './routes';
import { SiteHeader, SiteHeaderHeight } from './SiteHeader';
import { SiteNav } from './SiteNav';
import { mediaQuery } from './styles';
import { ThemeProvider } from './ThemeProvider';

interface IAppStyles {
    root: IStyle;
    header: IStyle;
    nav: IStyle;
    contentWrapper: IStyle;
    content: IStyle;
}

const getClassNames = classNamesFunction<Theme, IAppStyles>();

const NavWidthMedium = 150;
const NavWidthWide = 200;

const Content: React.FunctionComponent = () => {
    const theme = useTheme();
    const classNames = getClassNames(() => {
        return {
            root: {},
            header: {
                [mediaQuery.widthMedium]: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                },
            },
            nav: {
                [mediaQuery.widthMedium]: {
                    position: 'absolute',
                    top: SiteHeaderHeight,
                    bottom: 0,
                    left: 0,
                    width: NavWidthMedium,
                },
                [mediaQuery.widthWide]: {
                    width: NavWidthWide,
                },
            },
            contentWrapper: {
                backgroundColor: theme.palette.neutralLighterAlt,
                paddingLeft: 28,
                paddingRight: 28,
                [mediaQuery.widthMedium]: {
                    position: 'absolute',
                    top: SiteHeaderHeight,
                    left: NavWidthMedium,
                    right: 0,
                    bottom: 0,
                    overflow: 'auto',
                    paddingLeft: 40,
                    paddingRight: 40,
                    paddingBottom: 40,
                },
                [mediaQuery.widthWide]: {
                    left: NavWidthWide,
                },
            },
            content: {},
        };
    }, theme);

    // TODO: check if repo is behind remote, and if so push a MessageBar to
    // the top of the screen to pull changes.
    return (
        <div className={classNames.root}>
            <SiteHeader className={classNames.header} />
            <div className={classNames.nav}>
                <SiteNav />
            </div>
            <div className={classNames.contentWrapper}>
                <div className={classNames.content}>
                    <Routes />
                </div>
            </div>
        </div>
    );
};

export const App: React.FunctionComponent = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <GitApiProvider>
                    <Router>
                        <Content />
                    </Router>
                </GitApiProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};
