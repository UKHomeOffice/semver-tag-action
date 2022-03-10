const core = require("@actions/core");

const { getTags, createTag, getOctoKit } = require("../src/github");
const { calculateNewTag, getLatestTag } = require("../src/semver");


async function run() {
    try {
        const token = core.getInput('github_token', { required: true })
        const octokit = getOctoKit(token)

        const increment = core.getInput('increment', {required: true})
        const tags = await getTags(octokit)

        const latestTag = getLatestTag(tags)
        const newTag = calculateNewTag(latestTag, increment)

        await createTag(newTag, octokit)
        core.setOutput('version', newTag)
    } catch (error) {
        core.setFailed(error.message)
    }
}

run();
