const core = require("@actions/core");
const github = require("@actions/github")
const semver = require("semver")

async function createTag(incrementedTag) {
    const token = core.getInput('github_token', { required: true })
    const octokit = github.getOctokit(token)
    const sha = github.context.sha
    const ref = `refs/tags/${incrementedTag}`
    await octokit.rest.git.createRef({
        ...github.context.repo,
        ref,
        sha
    })
}

async function getLatestTag() {
    console.log('Getting Latest Tag from Repo')
    const token = core.getInput('github_token', { required: true })
    const octokit = github.getOctokit(token)

    const { data: refs } = await octokit.rest.git.listMatchingRefs({
        ...github.context.repo,
        namespace: 'tags/'
    })

    const versions = refs
        .map(ref => ref.ref.replace(/^refs\/tags\//g, ''))
        .map(tag => semver.parse(tag, { loose: true }))
        .filter(version => version !== null)
        .sort(semver.rcompare)

    return versions[0] || semver.parse('0.0.0')
}

async function getNewTag(latestTag, increment) {
    console.log(`Incrementing latest tag "${latestTag.toString()}"`)
    const newTag = semver.inc(latestTag, increment).toString();
    console.log(`Calculated new tag "${newTag}"`)
    return newTag
}

async function run() {
    try {
        const increment = core.getInput('increment', {required: true})
        const latestTag = await getLatestTag()
        const newTag = await getNewTag(latestTag, increment)
        core.setOutput('version', newTag)
        await createTag(newTag)
    } catch (error) {
        core.setFailed(error.message)
    }
}

run();
