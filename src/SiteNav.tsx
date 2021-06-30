import { INavLinkGroup, INavStyleProps, INavStyles, IStyleFunctionOrObject, Nav } from '@fluentui/react';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

// const NavLink: React.FunctionComponent<INavButtonProps> = ({ title, href }) => {
//     return (
//         <Link as={RouterLink} to={href}>
//             {title}
//         </Link>
//     );
// };

const navStyles: IStyleFunctionOrObject<INavStyleProps, INavStyles> = (props) => {
    return {
        link: {
            paddingLeft: 5 + (props.leftPadding ?? 3),
        },
        groupContent: {
            marginBottom: 0,
        },
    };
};

const navGroups: INavLinkGroup[] = [
    {
        links: [
            {
                name: 'Repo',
                key: '/repo',
                url: '/repo',
                icon: 'Repo',
            },
            {
                name: 'Sources',
                key: '/sources',
                url: '/sources',
                icon: 'OpenSource',
            },
            {
                name: 'Keyboards',
                key: '/boards',
                url: '/boards',
                icon: 'KeyboardClassic',
            },
            {
                name: 'Builds',
                key: '/builds',
                url: '/builds',
                icon: 'Build',
            },
            {
                name: 'Files',
                key: '/files',
                url: '/files',
                icon: 'FolderHorizontal',
            },
            {
                name: 'Commit',
                key: '/commit',
                url: '/commit',
                icon: 'Save',
            },
        ],
    },
];

export const SiteNav: React.FunctionComponent = () => {
    const history = useHistory();
    const location = useLocation();

    const key = location.pathname;

    // return <Nav linkAs={NavLink} groups={navGroups} />;
    return (
        <Nav
            styles={navStyles}
            groups={navGroups}
            selectedKey={key}
            onLinkClick={(ev, item) => {
                ev?.preventDefault();
                if (item) {
                    history.push(item.url);
                }
            }}
        />
    );
};
