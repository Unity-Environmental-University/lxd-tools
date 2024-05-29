import {exec, execSync} from "node:child_process";
import nodePackage from './package.json' with { type: 'json'}
import manifest from './manifest.json' with {type: 'json'}
import fs from "node:fs";
import {workerData} from "node:worker_threads";


async function  main() {
    const packageTag = getPackageTag();
    const tags = getGitTags('./')

    updateTag(packageTag, './');

    let distManifest = JSON.parse(fs.readFileSync('../dist/manifest.json').toString())

    if (distManifest.version !== packageTag) {
        fs.writeFileSync('../dist/manifest.json', JSON.stringify({...manifest, version: packageTag}));
    }
    const commitMessages = getCommitMessages(distManifest.version, packageTag);
    const distOptions = {cwd: '../dist'};
    console.log(commitMessages)
    console.log(execSync('git add .', distOptions).toString());
    console.log(execSync(`git commit -m '${packageTag} -- ${commitMessages.join('\n')}'`, distOptions).toString())
    updateTag(packageTag, '../dist');

    const process = exec('git push', distOptions)
    process.on('message', (message) => {

        console.log(process.stdout.toString())
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