import {exec, execSync} from "node:child_process";
import nodePackage from './package.json' with { type: 'json'}
import manifest from './manifest.json' with {type: 'json'}
import fs from "node:fs";




async function  main() {
    const packageTag = getPackageTag();
    const tags = getGitTags('./')

    updateTag(packageTag, './');
    updateTag(packageTag,'../dist');

    let distManifest = JSON.parse(  fs.readFileSync('../dist/manifest.json').toString()    )

    if(distManifest.version !== packageTag) {
        fs.writeFileSync('../dist/manifest.json', JSON.stringify({...manifest, version: packageTag }));
    }
    const commitMessages = getCommitMessages(distManifest.version, packageTag);
    console.log(execSync('git add .', {
        cwd: '../dist'
    }).toString());
    const process = exec(`git commit -m "${packageTag}\n${commitMessages.join('\n')}`)

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