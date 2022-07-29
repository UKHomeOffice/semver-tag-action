const {
  isValidTag,
} = require("../src/semver");

describe("parseTag", () => {
  test("should allow all accepted tags", () => {
    expect(isValidTag("1.0.0")).toBeTruthy();
    expect(isValidTag("1.0.0-0")).toBeTruthy();
    expect(isValidTag("1.0")).toBeFalsy();
    expect(isValidTag("1")).toBeFalsy();
    expect(isValidTag("Sausages")).toBeFalsy();
    expect(isValidTag("")).toBeFalsy();
  });
});
