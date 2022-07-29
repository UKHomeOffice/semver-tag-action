const semver = require("semver");

function isValidTag(tag) {
  return semver.valid(tag);
}

module.exports = {
  isValidTag,
};
