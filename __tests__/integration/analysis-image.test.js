const requestMock = require("../mocks/request.json");
const { main } = require("../../src");
const { expect } = require("@jest/globals");
const aws = require("aws-sdk");
aws.config.update({
  region: "us-east-1",
});

describe("Image analyse cloud function test suite", () => {
  it("Should return the main certainties about a dog image for a valid dog picture", async () => {
    const result = await main(requestMock);
    const expected = {
      statusCode: 200,
      body: "",
    };
    expect(result).toStrictEqual(expected);
  });
  it("Should return statusCode 400 for undefined picture url", async () => {
    const result = await main({ queryStringParameters: "" });
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual(
      "There is an error in handler: Invalid image url"
    );
  });
  test.todo("It should return statusCode 500 for invalid picture url");
});
