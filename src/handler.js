const axios = require("axios");

module.exports = class Handler {
  constructor({ rekoSvc, translatorSvc }) {
    this.rekoSvc = rekoSvc;
    this.translatorSvc = translatorSvc;
  }

  async main(event) {
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
  }
};
