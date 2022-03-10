const github = require("@actions/github")
const core = require("@actions/core");

async function getTags(octokit, { context } = github) {
    core.info('Getting Latest Tag from Repo');
    const { data: refs } = await octokit.git.listMatchingRefs({
        ...context.repo,
        namespace: 'tags/'
    })

    return refs.map(ref => ref.ref.replace(/^refs\/tags\//g, ''))
}

async function createTag(newTag, octokit, { context } = github) {
    const sha = context.sha
    const ref = `refs/tags/${newTag}`
    await octokit.git.createRef({
        ...context.repo,
        ref,
        sha
    })
}

function getOctoKit(token) {
    return github.getOctokit(token)
}

module.exports = { getTags, createTag, getOctoKit }
