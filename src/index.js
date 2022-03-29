const core = require("@actions/core");
const {
  getTagsForRepo,
  createTag,
  getOctoKit,
  getHeadRefSha,
  getTagByCommitSha,
  isPullRequest,
  repoHasTag,
} = require("../src/github");
const { calculateNewTag, getLatestTag } = require("../src/semver");

async function run() {
  try {
    const token = core.getInput("github_token", { required: true });
    const increment = core.getInput("increment", { required: true });
    const octokit = getOctoKit(token);
    if (!isPullRequest()) {
      core.setFailed(
        "Invalid event specified, it should be used on [pull_request, pull_request_target] events"
      );
      return;
    }

    const repoTags = await getTagsForRepo(octokit);
    const newTag =
      increment === "hotfix"
        ? generateHotfixTag(repoTags)
        : generateSemverTag(repoTags, increment);

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

function generateHotfixTag(tags) {
  const headSha = getHeadRefSha();
  const headSemver = getTagByCommitSha(tags, headSha);
  if (!headSemver) {
    core.setFailed(`No tag found on repository for SHA: ${headSha}`);
    return;
  }
  core.info(`Found tag ${headSemver} for head SHA ${headSha}`);

  const newPatchTag = calculateNewTag(headSemver, "patch");
  core.info(`Checking for new patch value: ${newPatchTag}`);

  if (repoHasTag(tags, newPatchTag)) {
    core.setFailed(`Tag ${newPatchTag} already exists on repository`);
    return;
  }

  return newPatchTag;
}

function generateSemverTag(tags, increment) {
  const latestTag = getLatestTag(tags);
  core.info(`Latest repo tag: ${latestTag}`);
  return calculateNewTag(latestTag, increment);
}

run();
