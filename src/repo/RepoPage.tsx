import { IPivotStyles, Pivot, PivotItem, Stack } from '@fluentui/react';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { PageTitle } from '../PageTitle';
import { LocalReposPage } from './LocalReposPage';
import { RepoSelectPage } from './RepoSelectPage';

const pivotStyles: Partial<IPivotStyles> = {
    itemContainer: {
        marginTop: 10,
    },
};

interface IRepoPageParams {
    activeTab?: string;
}

enum Tabs {
    SelectRepo = 'select',
    LocalStorage = 'stored',
}

export const RepoPage: React.FunctionComponent = () => {
    const history = useHistory();

    const { activeTab } = useParams<IRepoPageParams>();

    const setTab = (item?: PivotItem) => {
        const key = item?.props.itemKey;
        if (key) {
            history.push(`/repo/${key}`);
        }
    };

    return (
        <Stack>
            <PageTitle>Repository</PageTitle>

            <Pivot styles={pivotStyles} selectedKey={activeTab ?? Tabs.SelectRepo} onLinkClick={setTab}>
                <PivotItem headerText="Select repo" itemKey={Tabs.SelectRepo}>
                    <RepoSelectPage />
                </PivotItem>
                <PivotItem headerText="Local storage" itemKey={Tabs.LocalStorage}>
                    <LocalReposPage />
                </PivotItem>
            </Pivot>
        </Stack>
    );
};
