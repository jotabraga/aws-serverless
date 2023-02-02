const { get } = require("axios");
const aws = require("aws-sdk");
aws.config.update({
  region: "us-east-1",
});

module.exports = class Handler {
  constructor({ rekoSvc, translatorSvc }) {
    this.rekoSvc = rekoSvc;
    this.translatorSvc = translatorSvc;
  }

  async getImageBuffer(imageUrl) {
    const response = await get(imageUrl, {
      responseType: "arrayBuffer",
    });
    const buffer = Buffer.from(response.data, "base64");
    return buffer;
  }

  async detectImageLabels(buffer) {
    const result = await this.rekoSvc
      .detectLabels({
        Image: {
          Bytes: buffer,
        },
      })
      .promise();
    console.log("result", result);
  }

  async main(event) {
    try {
      const { imageUrl } = event.queryStringParameters;
      if (!imageUrl) {
        return {
          statusCode: 400,
          body: "There is an error in handler: Invalid image url",
        };
      }
      const buffer = await this.getImageBuffer(imageUrl);
      console.log("Detecting labels...");
      const detectedLabels = await this.detectImageLabels(buffer);
      return {
        statusCode: 200,
        body: "Hello",
      };
    } catch (error) {
      console.error("Error in handler main function", error.stack);
      return {
        statusCode: 500,
        body: "Internal Server Error",
      };
    }
  }
};
