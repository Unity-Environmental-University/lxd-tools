import {exec, execSync} from "node:child_process";
import nodePackage from './package.json' with { type: 'json'}
import manifest from './manifest.json' with {type: 'json'}
import fs from "node:fs";
import {workerData} from "node:worker_threads";


async function  main() {
    const packageTag = getPackageTag();
    const tags = getGitTags('./')
    console.log(packageTag);
    updateTag(packageTag, './');

    let distManifest = JSON.parse(fs.readFileSync('../dist/manifest.json').toString())

    if (distManifest.version !== packageTag) {
        fs.writeFileSync('../dist/manifest.json', JSON.stringify({...manifest, version: packageTag}));
    }


    const distOptions = {
        cwd: '../dist'
    };

    console.log(execSync('git add -v .', distOptions).toString());


    const commitMessages = [
        packageTag,
        ...getCommitMessages(distManifest.version, packageTag).filter(m => m.length > 0)
    ];
    console.log(commitMessages)
    fs.writeFileSync('../dist/commit.tmp', commitMessages.join('\n'));
    console.log(fs.readFileSync('../dist/commit.tmp').toString());
    const command = `git commit -F ./commit.tmp`;
    console.log(command)
    try {
        const process = exec(command, distOptions);
        process.on('message', message => console.log(process.stdout.toString()))
        process.on('error', message => console.log(process.stderr.toString()))
        process.on('close', message => {
            console.log(message);
            finish(packageTag);
        });
    } catch(e) {
        console.error(e);
    }

}


async function finish(packageTag) {
    updateTag(packageTag, '../dist');

    const process = exec('git push', {cwd: '../dist'})
    process.on('message', (message) => {
        console.log(process.stdout.toString())
    });
    process.on('error', (message) => {
        console.log(process.stderr.toString())
    });
    process.on('close', () => console.log('Finished'))
}

/**
 * the working directory of the repository to tag
 * @param packageTag {string}
 * @param tagRepoWorkingDirectory {string|null}
 */
function updateTag(packageTag, tagRepoWorkingDirectory) {
    const gitTags = getGitTags(tagRepoWorkingDirectory);
    if (!gitTags.includes(packageTag)) {
        execSync(`git tag ${packageTag}`, {
            cwd: tagRepoWorkingDirectory
        });
    }
}

/**
 *
 * @returns {string[]}
 * @param workingDirectory {string} The working directory to execute from
 */
function getGitTags(workingDirectory= './') {
    return execSync('git tag', {
        cwd: workingDirectory
    }).toString().trimEnd().split('\n')
}

function getPackageTag() {
    return nodePackage.version;

}



function getCommitMessages(tagOne, tagTwo) {
    console.log(tagOne)
    return execSync(`git log --pretty=oneline ${tagOne}...${tagTwo}`).toString().split('\n');
}

main().then();