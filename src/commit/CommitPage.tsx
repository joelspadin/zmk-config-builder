import { IPivotStyles, Pivot, PivotItem, Stack } from '@fluentui/react';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { PageTitle } from '../PageTitle';
import { ChangesPage } from './ChangesPage';
import { GitGraphPage } from './GitGraphPage';

const pivotStyles: Partial<IPivotStyles> = {
    itemContainer: {
        marginTop: 10,
    },
};

interface ICommitPageParams {
    activeTab?: string;
}

enum Tabs {
    Changes = 'changes',
    GitGraph = 'graph',
}

export const CommitPage: React.FunctionComponent = () => {
    const history = useHistory();

    const { activeTab } = useParams<ICommitPageParams>();

    const setTab = (item?: PivotItem) => {
        const key = item?.props.itemKey;
        if (key) {
            history.push(`/commit/${key}`);
        }
    };

    return (
        <Stack>
            <PageTitle>Commit</PageTitle>
            <Pivot styles={pivotStyles} selectedKey={activeTab ?? Tabs.Changes} onLinkClick={setTab}>
                <PivotItem headerText="Changes" itemIcon="BranchCommit" itemKey={Tabs.Changes}>
                    <ChangesPage />
                </PivotItem>
                <PivotItem headerText="Graph" itemIcon="GitGraph" itemKey={Tabs.GitGraph}>
                    <GitGraphPage />
                </PivotItem>
            </Pivot>
        </Stack>
    );
};
