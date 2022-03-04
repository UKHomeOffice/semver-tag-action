const core = require("@actions/core");
const github = require("@actions/github")
const semver = require("semver")

async function createTag(incrementedTag) {
    const token = core.getInput('github_token', { required: true })
    const octokit = github.getOctokit(token)
    const sha = github.context.sha
    const ref = `refs/tags/${incrementedTag}`
    await octokit.git.createRef({
        ...github.context.repo,
        ref,
        sha
    })
}

async function getLatestTag() {
    console.log('Getting Latest Tag from Repo')
    const token = core.getInput('github_token', { required: true })
    const octokit = github.getOctokit(token)

    const { data: refs } = await octokit.git.listMatchingRefs({
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

async function run() {
    try {
        const increment = core.getInput('increment', {required: true})
        const latestTag = await getLatestTag()
        console.log(`Using latest tag "${latestTag.toString()}"`)
        const incrementedTag = semver.inc(latestTag, increment).toString();
        console.log(`Calculated new tag "${incrementedTag}"`)
        core.setOutput('version', incrementedTag)

        await createTag(incrementedTag)
    } catch (error) {
        core.setFailed(error.message)
    }
}

run();
