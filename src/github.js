const github = require("@actions/github");
const core = require("@actions/core");

async function getTagsForRepo(octokit) {
  core.info("Getting tags from repository.");

  const { data: tags } = await octokit.rest.git.listMatchingRefs({
    owner: getRepoOwner(github),
    repo: getRepoName(github),
    ref: "tags/",
  });

  core.info(`Retrieved ${tags.length} tags from repository.`);

  return tags.map((tag) => ({
    semver: tag.ref?.replace(/^refs\/tags\//g, ""),
    sha: tag.object?.sha,
  }));
}

function getRepoOwner({ context } = github) {
  return context.payload.repository.owner.login;
}

function getRepoName({ context } = github) {
  return context.payload.repository.name;
}

function getTagByCommitSha(tags, sha) {
  return tags.find((tag) => tag.sha === sha)?.semver;
}

function getHeadRefSha({ context } = github) {
  return context.payload.pull_request.base?.sha;
}

function repoHasTag(tags, semver) {
  return tags.some((tag) => tag.semver === semver);
}

async function createTag(newTag, octokit, { context } = github) {
  const sha = context.sha;
  const ref = `refs/tags/${newTag}`;
  await octokit.rest.git.createRef({
    ...context.repo,
    ref,
    sha,
  });
}

function getOctoKit(token) {
  return github.getOctokit(token);
}

const isAcceptedEventType = ({ context } = github) => {
  return ["pull_request", "pull_request_target", "workflow_dispatch"].includes(
    context.eventName
  );
};

const getActionInputs = (variables) => {
  return variables.reduce((obj, variable) => {
    let value = core.getInput(variable.name, variable.options);
    if (!value) {
      if (variable.hasOwnProperty("default")) {
        value = variable.default;
      }
    }
    return Object.assign(obj, { [variable.name]: value });
  }, {});
};

module.exports = {
  createTag,
  getActionInputs,
  getHeadRefSha,
  getOctoKit,
  getTagByCommitSha,
  getTagsForRepo,
  isAcceptedEventType,
  repoHasTag,
};
