import { Link } from '@material-ui/core';
import React from 'react';
import PropTypes from 'prop-types';

export interface RepoLinkParams {
    owner: string;
    repo: string;
    showUrl?: boolean;
}

const RepoLink: React.FunctionComponent<RepoLinkParams> = ({ owner, repo, showUrl }) => {
    const url = `https://github.com/${owner}/${repo}`;
    return (
        <Link href={url} target="_blank">
            {showUrl ? url : `${owner}/${repo}`}
        </Link>
    );
};

RepoLink.propTypes = {
    owner: PropTypes.string.isRequired,
    repo: PropTypes.string.isRequired,
    showUrl: PropTypes.bool,
};

export default RepoLink;
