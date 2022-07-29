const { isValidTag, getMajorTag } = require("../src/semver");

describe("isValidTag", () => {
  test("should allow all accepted tags", () => {
    expect(isValidTag("1.0.0")).toBeTruthy();
    expect(isValidTag("v1.0.0")).toBeTruthy();
    expect(isValidTag("1.0.0-0")).toBeTruthy();
    expect(isValidTag("1.0")).toBeFalsy();
    expect(isValidTag("1")).toBeFalsy();
    expect(isValidTag("Sausages")).toBeFalsy();
    expect(isValidTag("")).toBeFalsy();
  });
});

describe("getMajorTag", () => {
  test("should parse valid values to get Major tag", () => {
    expect(getMajorTag("1.0.0")).toEqual("v1");
    expect(getMajorTag("1.2.3")).toEqual("v1");
    expect(getMajorTag("v1.0.0")).toEqual("v1");
    expect(getMajorTag("1.0.0-0")).toBeNull();
    expect(getMajorTag("1.0")).toBeNull();
    expect(getMajorTag("1")).toBeNull();
    expect(getMajorTag("Sausages")).toBeNull();
    expect(getMajorTag("")).toBeNull();
  });
});
