const semver = require("semver");
const core = require("@actions/core");

function calculateNewTag(latestTag, increment) {
  core.info(`Incrementing latest tag "${latestTag}" by ${increment}`);
  const newTag = semver.inc(latestTag, increment.toLowerCase()).toString();
  core.info(`Calculated new tag "${newTag}"`);

  return newTag;
}

function getLatestTag(tags) {
  if (!tags) {
    core.info("No tags present - returning 0.0.0");
    return "0.0.0";
  }

  const version = tags
    .filter((tag) => tag)
    .map((tag) => semver.parse(tag.semver, { loose: true }))
    .sort(semver.rcompare)
    .shift();

  if (version === undefined) {
    core.info("No tag present - returning 0.0.0");
    return "0.0.0";
  }

  return version.toString();
}

module.exports = { calculateNewTag, getLatestTag };
