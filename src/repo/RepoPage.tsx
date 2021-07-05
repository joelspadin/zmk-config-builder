import { IPivotStyles, Pivot, PivotItem, Stack } from '@fluentui/react';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { PageTitle } from '../PageTitle';
import { CloneRepoPage } from './CloneRepoPage';
import { CreateRepoPage } from './CreateRepoPage';
import { CurrentRepoPage as CurrentRepoPage } from './CurrentRepoPage';

const pivotStyles: Partial<IPivotStyles> = {
    itemContainer: {
        marginTop: 10,
    },
};

interface IRepoPageParams {
    activeTab?: string;
}

enum Tabs {
    Current = 'current',
    Clone = 'clone',
    Create = 'create',
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

            <Pivot styles={pivotStyles} selectedKey={activeTab ?? Tabs.Current} onLinkClick={setTab}>
                <PivotItem headerText="Select repo" itemKey={Tabs.Current}>
                    <CurrentRepoPage />
                </PivotItem>
                <PivotItem headerText="Clone" itemKey={Tabs.Clone}>
                    <CloneRepoPage />
                </PivotItem>
                <PivotItem headerText="Create" itemKey={Tabs.Create}>
                    <CreateRepoPage />
                </PivotItem>
            </Pivot>
        </Stack>
    );
};
