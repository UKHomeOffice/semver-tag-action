jest.mock("@actions/github");

const { context, github } = require("@actions/github");
const { getTags, createTag, getOctoKit } = require("../src/github")

const octokit = jest.mock(github.getOctoKit(""))

describe("getTags", () => {
  test("return true when eventName is pull_request", async () => {
    context.eventName = "pull_request";

    expect(isPullRequest(context)).toBeTruthy();
  });

});
