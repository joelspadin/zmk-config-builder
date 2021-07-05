import React from 'react';
import { Redirect, Route, RouteProps, Switch } from 'react-router-dom';
import { BoardsPage } from './boards/BoardsPage';
import { BuildsPage } from './builds/BuildsPage';
import { CommitPage } from './commit/CommitPage';
import { FilesPage } from './files/FilesPage';
import { useAuth } from './git/GitApiProvider';
import { HomePage } from './home/HomePage';
import { LoginPage } from './login/LoginPage';
import { OAuthCallbackPage } from './login/OauthCallbackPage';
import { RepoPage } from './repo/RepoPage';
import { PageShimmer } from './shimmer';
import { SourcesPage } from './sources/SourcesPage';

const AuthRoute: React.FunctionComponent<RouteProps> = ({ component, ...props }) => {
    const auth = useAuth();

    return (
        <Route
            {...props}
            render={(renderProps) => {
                if (auth.isAuthenticating) {
                    return <PageShimmer />;
                }

                if (!auth.isAuthenticated) {
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
            <Route path="/login/oauth" component={OAuthCallbackPage} />
            <Route path="/login" component={LoginPage} />
            <AuthRoute path="/boards" component={BoardsPage} />
            <AuthRoute path="/builds" component={BuildsPage} />
            <AuthRoute path="/commit" component={CommitPage} />
            <AuthRoute path="/files" component={FilesPage} />
            <AuthRoute path="/repo/:activeTab?" component={RepoPage} />
            <AuthRoute path="/sources" component={SourcesPage} />
        </Switch>
    );
};
