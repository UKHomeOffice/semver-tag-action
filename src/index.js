const core = require("@actions/core");
const {
  createTag,
  deleteTag,
  getActionInputs,
  getTagsForRepo,
  isValidEventType,
  valueExistsAsTag,
} = require("../src/github");
const { isValidTag, getMajorTag } = require("../src/semver");

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
      { name: "move_major_tag", options: { required: false } },
    ]);

    const newTag = inputs.tag;

    if (!isValidTag(newTag)) {
      core.setFailed(`Invalid SemVer value ${newTag}.`);
      return;
    }

    const existingTags = await getTagsForRepo(inputs.github_token);
    core.info(`Checking if new tag value ${newTag} already exists as tag.`);
    if (valueExistsAsTag(existingTags, newTag)) {
      core.setFailed(`Value ${newTag} already exists as tag`);
      return;
    }

    core.info(`Creating tag ${newTag} against current SHA.`);
    await createTag(newTag, inputs.github_token);

    if (inputs.move_major_tag === "true") {
      const majorTag = getMajorTag(newTag);

      if (!majorTag) {
        core.warning(`Not a valid Major tag ${majorTag}, not creating.`);
        return;
      }
      if (valueExistsAsTag(existingTags, majorTag)) {
        core.info(`Deleting Major tag ${majorTag} from old SHA.`);
        await deleteTag(majorTag, inputs.github_token);
      }
      core.info(`Creating Major tag ${majorTag} against current SHA.`);
      await createTag(majorTag, inputs.github_token);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
