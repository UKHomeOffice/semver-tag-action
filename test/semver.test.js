const { calculateNewTag, getLatestTag } = require("../src/semver");

describe("calculateNewTag", () => {
  test("Should increment major", () => {
    expect(calculateNewTag("1.0.0", "major")).toEqual("2.0.0");
  });

  test("Should increment minor", () => {
    expect(calculateNewTag("1.0.0", "minor")).toEqual("1.1.0");
  });

  test("Should increment patch", () => {
    expect(calculateNewTag("1.0.0", "patch")).toEqual("1.0.1");
  });

  test("Should increment MAJOR", () => {
    expect(calculateNewTag("1.0.0", "MAJOR")).toEqual("2.0.0");
  });

  test("Should increment MINOR", () => {
    expect(calculateNewTag("1.0.0", "MINOR")).toEqual("1.1.0");
  });

  test("Should increment PATCH", () => {
    expect(calculateNewTag("1.0.0", "PATCH")).toEqual("1.0.1");
  });
});

describe("getLatestTag", () => {
  test("Latest Tag Patch", () => {
    expect(getLatestTag([{ semver: "0.0.1" }, { semver: "0.0.2" }])).toEqual(
      "0.0.2"
    );
  });

  test("Latest Tag Minor", () => {
    expect(getLatestTag([{ semver: "0.0.1" }, { semver: "0.1.0" }])).toEqual(
      "0.1.0"
    );
  });

  test("Latest Tag Major", () => {
    expect(getLatestTag([{ semver: "0.0.1" }, { semver: "1.0.0" }])).toEqual(
      "1.0.0"
    );
  });

  test("Latest Tag Single", () => {
    expect(getLatestTag([{ semver: "1.0.0" }])).toEqual("1.0.0");
  });

  test("Latest Tag Empty", () => {
    expect(getLatestTag([])).toEqual("0.0.0");
  });

  test("Latest Tag array null", () => {
    expect(getLatestTag([null])).toEqual("0.0.0");
  });

  test("Latest Tag array undefined", () => {
    expect(getLatestTag([undefined])).toEqual("0.0.0");
  });

  test("Latest Tag null", () => {
    expect(getLatestTag(null)).toEqual("0.0.0");
  });
});
