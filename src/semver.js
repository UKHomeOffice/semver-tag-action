const semver = require("semver");

function isValidTag(tag) {
  return semver.valid(tag);
}

function getMajorTag(tag) {
  const cleanTag = semver.coerce(tag);
  // We dont want to move major for pre-releases
  if (cleanTag?.toString() !== semver.valid(tag)) {
    return null;
  }
  return `v${semver.major(cleanTag)}`;
}

module.exports = {
  isValidTag,
  getMajorTag,
};
