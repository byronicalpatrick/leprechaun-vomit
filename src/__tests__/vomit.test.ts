import { readFileSync } from "node:fs";

import parseXML from "../vomit";

jest.mock("../utils", () => ({
  randomColour: jest.fn().mockReturnValue("837aac"),
}));

describe("document handling", () => {
  test("replace `w:r` element", () => {
    const documentString = readFileSync(
      "./src/__tests__/assets/wr.xml",
      "utf8"
    );
    expect(parseXML(documentString)).toMatchSnapshot();
  });
  test("graphic with text", () => {
    const documentString = readFileSync(
      "./src/__tests__/assets/graphic.xml",
      "utf8"
    );
    expect(parseXML(documentString)).toMatchSnapshot();
  });
  test("full document", () => {
    const documentString = readFileSync(
      "./src/__tests__/assets/document.xml",
      "utf8"
    );
    expect(parseXML(documentString)).toMatchSnapshot();
  });
});
