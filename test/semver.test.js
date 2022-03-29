const {
  calculateNewTag,
  isSemverIdentifier,
  sortTags,
} = require("../src/semver");

describe("calculateNewTag", () => {
  test("should increment correctly", () => {
    expect(calculateNewTag("1.0.0", "pre")).toEqual("1.0.0-0");
    expect(calculateNewTag("1.0.0", "premajor")).toEqual("2.0.0-0");
    expect(calculateNewTag("1.0.0", "preminor")).toEqual("1.1.0-0");
    expect(calculateNewTag("1.0.0", "prepatch")).toEqual("1.0.1-0");
    expect(calculateNewTag("1.0.0", "prerelease")).toEqual("1.0.1-0");
    expect(calculateNewTag("1.0.0", "major")).toEqual("2.0.0");
    expect(calculateNewTag("1.0.0", "minor")).toEqual("1.1.0");
    expect(calculateNewTag("1.0.0", "patch")).toEqual("1.0.1");
  });

  test("should return undefined if increment not valid", () => {
    expect(calculateNewTag("1.0.0", undefined)).toEqual(undefined);
    expect(calculateNewTag("1.0.0", null)).toEqual(undefined);
    expect(calculateNewTag("1.0.0", "TEST")).toEqual(undefined);
  });

  test("should return undefined if initial tag not valid", () => {
    expect(calculateNewTag(undefined, "patch")).toEqual(undefined);
    expect(calculateNewTag(null, "patch")).toEqual(undefined);
    expect(calculateNewTag("TEST", "patch")).toEqual(undefined);
  });
});

describe("isSemverIdentifier", () => {
  test("should allow all accepted tags", () => {
    expect(isSemverIdentifier("pre")).toEqual(true);
    expect(isSemverIdentifier("premajor")).toEqual(true);
    expect(isSemverIdentifier("preminor")).toEqual(true);
    expect(isSemverIdentifier("prepatch")).toEqual(true);
    expect(isSemverIdentifier("prerelease")).toEqual(true);
    expect(isSemverIdentifier("major")).toEqual(true);
    expect(isSemverIdentifier("minor")).toEqual(true);
    expect(isSemverIdentifier("patch")).toEqual(true);
  });

  test("should return undefined on invalid identifier", () => {
    expect(isSemverIdentifier(null)).toEqual(false);
    expect(isSemverIdentifier(undefined)).toEqual(false);
    expect(isSemverIdentifier("TEST")).toEqual(false);
  });
});

describe("sortTags", () => {
  test("should sort tags by descending", () => {
    const tags = [
      { semver: "1.1.0", sha: 110 },
      { semver: "1.0.1", sha: 101 },
      { semver: undefined, sha: undefined },
      { semver: "TEST", sha: undefined },
      { semver: "2.0.0", sha: 200 },
    ];

    expect(sortTags(tags)).toEqual([
      { semver: "2.0.0", sha: 200 },
      { semver: "1.1.0", sha: 110 },
      { semver: "1.0.1", sha: 101 },
    ]);
  });
});
