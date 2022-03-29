const semver = require("semver");
const core = require("@actions/core");

function getAllowedSemverIdentifier() {
  return [
    "pre",
    "premajor",
    "preminor",
    "prepatch",
    "prerelease",
    "major",
    "minor",
    "patch",
  ];
}

function isSemverIdentifier(identifier) {
  return getAllowedSemverIdentifier().includes(identifier);
}

function calculateNewTag(tag, identifier) {
  if (!semver.valid(tag) || !isSemverIdentifier(identifier)) {
    return;
  }

  core.info(`Incrementing latest tag "${tag}" by ${identifier}`);
  const newTag = semver.inc(tag, identifier.toString()).toString();
  core.info(`Calculated new tag "${newTag}"`);

  return newTag;
}

module.exports = {
  getAllowedSemverIdentifier,
  isSemverIdentifier,
  calculateNewTag,
};
