const core = require("@actions/core");
const {
  createTag,
  getActionInputs,
  getTagsForRepo,
  isValidEventType,
  valueExistsAsTag,
} = require("../src/github");
const { isValidTag } = require("../src/semver");

async function run() {
  try {
    if (!isValidEventType()) {
      core.setFailed(
        "Invalid event specified, it should be used on [pull_request, pull_request_target, workflow_dispatch] events."
      );
      return;
    }

    const inputs = getActionInputs([
      { name: "tag", options: { required: false } },
      { name: "github_token", options: { required: true } },
    ]);

    const newTag = await checkSemverTag(inputs.github_token, inputs.tag);

    if (!isValidTag(newTag)) {
      core.setFailed("Invalid SemVer tag provided.");
      return;
    }

    core.info(`Creating tag ${newTag}.`);
    await createTag(newTag, inputs.github_token);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function checkSemverTag(token, newTag) {
  const tags = await getTagsForRepo(token);

  core.info(`Checking if new tag value ${newTag} already exists as tag.`);
  if (valueExistsAsTag(tags, newTag)) {
    core.setFailed(`value ${newTag} already exists as tag`);
    return;
  }

  return newTag;
}

run();
