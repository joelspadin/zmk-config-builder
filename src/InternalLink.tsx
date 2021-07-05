import { ILinkProps, Link } from '@fluentui/react';
import React from 'react';
import { useHistory } from 'react-router-dom';

export interface IInternalLinkProps extends Omit<ILinkProps, 'href'> {
    href: string;
}

/**
 * Link to a page within the site.
 */
export const InternalLink: React.FunctionComponent<IInternalLinkProps> = ({ children, ...props }) => {
    const history = useHistory();

    return (
        <Link
            {...props}
            onClick={(ev) => {
                ev.preventDefault();
                history.push(props.href);
            }}
        >
            {children}
        </Link>
    );
};
