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
  return getAllowedSemverIdentifier().includes(identifier?.toLowerCase());
}

function isValidTag(tag) {
  return semver.valid(tag);
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

function sortTags(tags) {
  return tags
    .filter((tag) => semver.valid(tag.semver))
    .sort((tagA, tagB) => semver.rcompare(tagA.semver, tagB.semver, true));
}

module.exports = {
  calculateNewTag,
  getAllowedSemverIdentifier,
  isSemverIdentifier,
  isValidTag,
  sortTags,
};
