import React from 'react';
import { Redirect, Route, RouteProps, Switch } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { BoardsPage } from './boards/BoardsPage';
import { BuildsPage } from './builds/BuildsPage';
import { CommitPage } from './commit/CommitPage';
import { HomePage } from './home/HomePage';
import { LoginPage } from './login/LoginPage';
import { RepoSelectPage } from './repo/RepoSelectPage';
import { SourcesPage } from './sources/SourcesPage';

const AuthRoute: React.FunctionComponent<RouteProps> = ({ component, ...props }) => {
    const auth = useAuth();

    return (
        <Route
            {...props}
            render={(renderProps) => {
                if (!auth.isAuthenticated) {
                    console.log('redirect');
                    const search = (typeof props.path === 'string' && `?from=${encodeURIComponent(props.path)}`) || '';
                    return <Redirect to={{ pathname: '/login', search }} />;
                }

                return component ? React.createElement(component, renderProps) : null;
            }}
        />
    );
};

export const Routes: React.FunctionComponent = () => {
    return (
        <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/login" component={LoginPage} />
            <AuthRoute path="/boards" component={BoardsPage} />
            <AuthRoute path="/builds" component={BuildsPage} />
            <AuthRoute path="/repo" component={RepoSelectPage} />
            <AuthRoute path="/sources" component={SourcesPage} />
            <AuthRoute path="/commit/:activeTab?" component={CommitPage} />
        </Switch>
    );
};
