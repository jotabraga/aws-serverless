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
      responseType: "arraybuffer",
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
    const foundedLabels = result.Labels.filter(
      ({ Confidence }) => Confidence > 90
    );

    const labels = foundedLabels.map(({ Name }) => Name).join(" and ");
    return { foundedLabels, labels };
  }

  async translateText(text) {
    const params = {
      SourceLanguageCode: "en",
      TargetLanguageCode: "pt",
      Text: text,
    };
    const { TranslateText } = await this.translatorSvc
      .translateText(params)
      .promise();

    console.log({ TranslateText });
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
