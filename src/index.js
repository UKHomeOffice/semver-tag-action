const core = require("@actions/core");
const {
  createTag,
  getActionInputs,
  getHeadRefSha,
  getOctoKit,
  getTagByCommitSha,
  getTagsForRepo,
  isAcceptedEventType,
  repoHasTag,
} = require("../src/github");
const {
  calculateNewTag,
  getAllowedSemverIdentifier,
  isSemverIdentifier,
  parseTag,
  sortTags,
} = require("../src/semver");

async function run() {
  try {
    if (!isAcceptedEventType()) {
      core.setFailed(
        "Invalid event specified, it should be used on [pull_request, pull_request_target, workflow_dispatch] events."
      );
      return;
    }

    const inputs = getActionInputs([
      { name: "increment", options: { required: false } },
      { name: "tag", options: { required: false } },
      { name: "github_token", options: { required: true } },
      { name: "dry_run", default: false },
      { name: "default_use_head_tag", default: false },
    ]);

    const parsedTag = parseTag(inputs.tag);

    if (!parsedTag && !isSemverIdentifier(inputs.increment)) {
      core.setFailed(
        `Invalid increment or SemVer tag provided, acceptable increment values are: ${getAllowedSemverIdentifier().toString()}.`
      );
      return;
    }

    const octokit = getOctoKit(inputs.github_token);
    const repoTags = sortTags(await getTagsForRepo(octokit));
    const newTag = parsedTag
      ? parsedTag
      : generateSemverTag(
          repoTags,
          inputs.increment.toLowerCase(),
          inputs.default_use_head_tag
        );

    if (!newTag) {
      core.setFailed("No new tag could be created.");
      return;
    }

    if (!inputs.dry_run) {
      core.info(`Creating tag ${newTag}`);
      await createTag(newTag, octokit);
    }
    core.setOutput("version", newTag);
  } catch (error) {
    core.setFailed(error.message);
  }
}

function generateSemverTag(tags, identifier, defaultGreatest) {
  if (tags.length === 0) {
    return calculateNewTag("0.0.0", identifier);
  }

  const headSha = getHeadRefSha();
  let headSemver = getTagByCommitSha(tags, headSha);
  if (!headSemver) {
    if (defaultGreatest) {
      core.info("No tag found for SHA. Finding highest repository SemVer tag.");
      headSemver = tags.shift()?.semver;
    } else {
      core.setFailed(`No tag found on repository for SHA: ${headSha}`);
      return;
    }
  }
  core.info(`Using tag ${headSemver}`);

  const newTag = calculateNewTag(headSemver, identifier);
  core.info(`Checking for new SemVer value: ${newTag}`);

  if (repoHasTag(tags, newTag)) {
    core.setFailed(`Tag ${newTag} already exists on repository`);
    return;
  }

  return newTag;
}

run();
