import { ComboBox, IComboBoxOption, IComboBoxStyles } from '@fluentui/react';
import React from 'react';
import { useAsync } from 'react-use';
import { useGit } from '../git/GitApiProvider';
import { IGitApi, IRepoId } from '../git/IGitApi';

async function getBranchOptions(git: IGitApi, repo?: IRepoId): Promise<[IComboBoxOption[], string]> {
    if (!repo) {
        return [[], 'main'];
    }

    const defaultBranch = await git.getDefaultBranch(repo);
    const branches = await git.listBranches(repo);

    branches.sort((a, b) => {
        if (a === defaultBranch) {
            return -1;
        }
        if (b === defaultBranch) {
            return 1;
        }
        return a.localeCompare(b);
    });

    const options = branches.map<IComboBoxOption>((name) => {
        return {
            key: name,
            text: name,
        };
    });

    return [options, defaultBranch];
}

export interface IBranchSelect {
    label?: string;
    repo?: IRepoId;
    value?: string;
    resetToDefault?: boolean;
    onChange?: (value: string | undefined) => any;
    styles?: Partial<IComboBoxStyles>;
}

export const BranchSelect: React.FunctionComponent<IBranchSelect> = ({
    label,
    repo,
    value,
    resetToDefault,
    onChange,
    styles,
}) => {
    const git = useGit();

    const options = useAsync(async () => {
        const [options, defaultBranch] = await getBranchOptions(git, repo);
        if (resetToDefault) {
            onChange?.(defaultBranch);
        }
        return options;
    }, [git, repo]);

    return (
        <ComboBox
            label={label}
            allowFreeform
            autoComplete="on"
            useComboBoxAsMenuWidth
            openOnKeyboardFocus
            options={options.value ?? []}
            styles={styles}
            selectedKey={value}
            onChange={(ev, option) => {
                onChange?.(option?.text);
            }}
        />
    );
};
