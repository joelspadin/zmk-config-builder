import yaml from 'yaml';
import type { FileChange } from './repository';
import type { Build } from './targets';

const TEMPLATE_DIR = '/templates/';
export const WORKFLOW_FILE = '.github/workflows/build.yml';
export const WEST_FILE = 'config/west.yml';

const MATRIX_NODE = ['jobs', 'build', 'strategy', 'matrix', 'include'];

async function fetchFile(path: string): Promise<string> {
    const response = await fetch(path);
    return await response.text();
}

function getTemplateSource(destPath: string) {
    // Netlify doesn't seem to like dot files/directories, so drop the dot from
    // the path to the static resource.
    return (
        TEMPLATE_DIR +
        destPath
            .split('/')
            .map((f) => f.replace(/^\./, ''))
            .join('/')
    );
}

export async function getWestConfigFile(): Promise<FileChange> {
    return {
        path: WEST_FILE,
        content: await fetchFile(getTemplateSource(WEST_FILE)),
    };
}

export async function getGitHubWorkflowFile(builds: Build[]): Promise<FileChange> {
    return {
        path: WORKFLOW_FILE,
        content: await generateGitHubWorkflow(builds),
    };
}

/**
 * Generates a GitHub workflow YAML file that runs the given builds.
 * @param builds
 */
export async function generateGitHubWorkflow(builds: Build[]) {
    const template = await fetchFile(getTemplateSource(WORKFLOW_FILE));
    const document = yaml.parseDocument(template);

    for (const build of getBuildMatrix(builds)) {
        document.addIn(MATRIX_NODE, build);
    }

    yaml.scalarOptions.str.fold.lineWidth = 120;
    return yaml.stringify(document);
}

function* getBuildMatrix(builds: Build[]) {
    builds = builds.sort((a, b) => a.keyboard.name.localeCompare(b.keyboard.name));

    for (const build of builds) {
        yield* getBuildIncludes(build);
    }
}

function* getBuildIncludes(build: Build) {
    const { boards, shields } = toBoardsShields(build);
    for (const board of boards) {
        if (shields.length === 0) {
            yield { board };
        } else {
            for (const shield of shields) {
                yield { shield, board };
            }
        }
    }
}

function toBoardsShields(build: Build) {
    if (build.keyboard.type === 'shield') {
        return { boards: build.controller?.buildTargets ?? [], shields: build.keyboard.buildTargets };
    } else {
        return { boards: build.keyboard.buildTargets, shields: [] };
    }
}
