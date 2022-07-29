const github = require("@actions/github");
const core = require("@actions/core");

async function getTagsForRepo(token) {
  core.info("Getting tags from repository.");

  const { data: tags } = await github
    .getOctokit(token)
    .rest.git.listMatchingRefs({
      owner: github.context.payload.repository.owner.login,
      repo: github.context.payload.repository.name,
      ref: "tags/",
    });

  core.info(`Retrieved ${tags.length} tags from repository.`);

  return tags.map((tag) => ({
    semver: tag.ref?.replace(/^refs\/tags\//g, ""),
    sha: tag.object?.sha,
  }));
}

async function createTag(newTag, token, { context } = github) {
  const sha = context.sha;
  const ref = `refs/tags/${newTag}`;
  await github.getOctokit(token).rest.git.createRef({
    ...context.repo,
    ref,
    sha,
  });
}

async function deleteTag(tag, token, { context } = github) {
  const ref = `tags/${tag}`;
  await github.getOctokit(token).rest.git.deleteRef({
    ...context.repo,
    ref,
  });
}

function valueExistsAsTag(tags, semver) {
  return tags.some((tag) => tag.semver === semver);
}

const isValidEventType = () => {
  return isPullRequest() || isWorkflowDispatch();
};

const isPullRequest = ({ context } = github) => {
  return ["pull_request", "pull_request_target"].includes(context.eventName);
};

const isWorkflowDispatch = ({ context } = github) => {
  return context.eventName === "workflow_dispatch";
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
  deleteTag,
  getActionInputs,
  getTagsForRepo,
  isValidEventType,
  valueExistsAsTag,
};
