import { exec, execSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import  nodePackage from './package.json' assert { type: 'json'}
import manifest from './manifest.json' assert {type: 'json'}

// Get the directory name for the current module in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Helper function to log process output
function logProcessOutput(process) {
    process.stdout?.on('data', (data) => console.log(data.toString()));
    process.stderr?.on('data', (data) => console.error(data.toString()));
}



function checkDistTag(packageTag) {
    const distTags = getGitTags('../dist');
    if (distTags.includes(packageTag)) {
        throw new Error(`Version ${packageTag} has already been tagged. Please update the version.`);
    }

}


// Main function
async function main() {
    try {
        const packageTag = getPackageTag();
        console.log(packageTag);

        checkDistTag(packageTag);
        updateTag(packageTag, './');

        const distManifestPath = path.resolve(__dirname, '../dist/manifest.json');
        let distManifest = JSON.parse(await readFile(distManifestPath, 'utf-8'));

        if (distManifest.version !== packageTag) {
            distManifest = { ...manifest, version: packageTag };
            await writeFile(distManifestPath, JSON.stringify(distManifest, null, 2));
        }

        const distOptions = { cwd: path.resolve(__dirname, '../dist') };

        console.log(execSync('git add -v .', distOptions).toString());

        const commitMessages = [
            packageTag,
            ...getCommitMessages(distManifest.version, packageTag).filter(m => m.length > 0)
        ];

        console.log(commitMessages);
        // Filter out lines that begin with tildes
        //const filteredCommitMessages = commitMessages.filter(msg => !msg.trim().startsWith('~'));

        const commitFilePath = path.resolve(distOptions.cwd, 'commit.tmp');
        await writeFile(commitFilePath, commitMessages.join('\n-----\n'));

        console.log(await readFile(commitFilePath, 'utf-8'));

        const command = `git commit -F ./commit.tmp`;
        console.log(command);

        const commitProcess = exec(command, distOptions);
        logProcessOutput(commitProcess);
        commitProcess.on('close', async (code) => {
            if (code === 0) {
                await finish(packageTag);
            } else {
                console.error(`Commit process exited with code ${code}`);
            }
        });

    } catch (error) {
        console.error('Error in main:', error);
        // eslint-disable-next-line @/no-undef
        process.exit(1);  // Exit with an error code
    }
}

// Finish function to push the changes
async function finish(packageTag) {
    try {
        updateTag(packageTag, '../dist');
        const distOptions = { cwd: path.resolve(__dirname, '../dist') };
        const pushProcess = exec('git push', distOptions);
        logProcessOutput(pushProcess);
        pushProcess.on('close', (code) => {
            if (code === 0) {
                console.log('Finished successfully');
            } else {
                console.error(`Push process exited with code ${code}`);
            }
        });
    } catch (error) {
        console.error('Error in finish:', error);
    }
}

// Function to update Git tags
function updateTag(packageTag, tagRepoWorkingDirectory) {
    try {
        const gitTags = getGitTags(tagRepoWorkingDirectory);
        if (!gitTags.includes(packageTag)) {
            execSync(`git tag ${packageTag}`, { cwd: path.resolve(__dirname, tagRepoWorkingDirectory) });
        }
    } catch (error) {
        console.error('Error in updateTag:', error);
    }
}

// Function to get Git tags
function getGitTags(workingDirectory = './') {
    try {
        return execSync('git tag', { cwd: path.resolve(__dirname, workingDirectory) })
            .toString()
            .trimEnd()
            .split('\n');
    } catch (error) {
        console.error('Error in getGitTags:', error);
        return [];
    }
}

// Function to get the package version tag
function getPackageTag() {
    return nodePackage.version;
}

// Function to get commit messages between two tags and filter them
function getCommitMessages(tagOne, tagTwo) {
    try {
        return execSync(`git log --pretty=format:"%s%d%n%H%n%b---" ${tagOne}...${tagTwo}`, {
            cwd: path.resolve(__dirname)
        })
            .toString()
            .split('---');
    } catch (error) {
        console.error('Error in getCommitMessages:', error);
        return [];
    }
}

main().then(() => {
    console.log('Script executed successfully.');
}).catch((error) => {
    console.error('Unhandled error:', error);
});