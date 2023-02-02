const { get } = require("axios");

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

  async main(event) {
    try {
      const { imageUrl } = event.queryStringParameters;
      if (!imageUrl) {
        return {
          statusCode: 400,
          body: "There is an error in handler: Invalid image url",
        };
      }
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
