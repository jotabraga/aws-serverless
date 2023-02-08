const requestMock = require("../mocks/request.json");
const { main } = require("../../src");
const aws = require("aws-sdk");
aws.config.update({
  region: "us-east-1",
});
const { describe, test, expect } = require("@jest/globals");
jest.setTimeout(1e4); // 10 secs

describe("Image analyse cloud function test suite", () => {
  it("Should return the main certainties about a dog image for a valid dog picture", async () => {
    const finalText = [
      "99.89% de ser do tipo Pastor alemão",
      "99.89% de ser do tipo canino",
      "99.89% de ser do tipo animal de estimação",
      "99.89% de ser do tipo cão",
      "99.89% de ser do tipo animal",
      "99.89% de ser do tipo mamífero",
    ].join("\n");
    const expectedBody = `A imagem tem\n`.concat(finalText);
    const result = await main(requestMock);
    expect(result.body).toStrictEqual(expectedBody);
  });
  it("Should return statusCode 400 for undefined picture url", async () => {
    const result = await main({ queryStringParameters: "" });
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual(
      "There is an error in handler: Invalid image url"
    );
  });
  it("Should return statusCode 500 for invalid picture url", async () => {
    const result = await main({
      queryStringParameters: {
        imageUrl: "urlinvalida",
      },
    });
    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual("Internal Server Error");
  });
});
