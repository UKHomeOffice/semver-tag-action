const core = require("@actions/core");
const {
  createTag,
  getActionInputs,
  getHeadRefSha,
  getOctoKit,
  getTagByCommitSha,
  getTagsForRepo,
  isPullRequest,
  repoHasTag,
} = require("../src/github");
const {
  calculateNewTag,
  getAllowedSemverIdentifier,
  isSemverIdentifier,
} = require("../src/semver");

async function run() {
  try {
    if (!isPullRequest()) {
      core.setFailed(
        "Invalid event specified, it should be used on [pull_request, pull_request_target] events"
      );
      return;
    }

    const inputs = getActionInputs([
      { name: "increment", options: { required: true } },
      { name: "github_token", options: { required: true } },
    ]);

    if (!isSemverIdentifier(inputs.increment.toLowerCase())) {
      core.setFailed(
        `Invalid increment provided, acceptable values are: ${getAllowedSemverIdentifier().toString()}`
      );
      return;
    }

    const octokit = getOctoKit(inputs.github_token);
    const repoTags = await getTagsForRepo(octokit);
    const newTag = generateSemverTag(repoTags, inputs.increment.toLowerCase());

    if (!newTag) {
      core.setFailed("No new tag could be created.");
      return;
    }
    core.info(`Creating tag ${newTag}`);

    await createTag(newTag, octokit);
    core.setOutput("version", newTag);
  } catch (error) {
    core.setFailed(error.message);
  }
}

function generateSemverTag(tags, identifier) {
  if (tags.length === 0) {
    return calculateNewTag("0.0.0", identifier);
  }

  const headSha = getHeadRefSha();
  const headSemver = getTagByCommitSha(tags, headSha);
  if (!headSemver) {
    core.setFailed(`No tag found on repository for SHA: ${headSha}`);
    return;
  }
  core.info(`Found tag ${headSemver} for head SHA ${headSha}`);

  const newTag = calculateNewTag(headSemver, identifier);
  core.info(`Checking for new SemVer value: ${newTag}`);

  if (repoHasTag(tags, newTag)) {
    core.setFailed(`Tag ${newTag} already exists on repository`);
    return;
  }

  return newTag;
}

run();
