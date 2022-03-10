const semver = require("semver");
const core = require("@actions/core");

function calculateNewTag(latestTag, increment) {
    core.info(`Incrementing latest tag "${latestTag}" by ${increment}`)
    const newTag = semver.inc(latestTag, increment.toLowerCase()).toString();
    core.info(`Calculated new tag "${newTag}"`)

    return newTag
}

function getLatestTag(tags) {
    const versions = tags?.map(tag => semver.parse(tag, { loose: true }))
        .filter(tag => tag !== null)
        .sort(semver.rcompare)

    if (versions === undefined) {
        return '0.0.0'
    }

    return versions[0]?.toString() ?? '0.0.0'
}

module.exports = { calculateNewTag, getLatestTag }
