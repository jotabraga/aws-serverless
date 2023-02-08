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
    const foundTerms = result.Labels.filter(
      ({ Confidence }) => Confidence > 90
    );
    const labels = foundTerms.map(({ Name }) => Name).join(" and ");
    return { labels, foundTerms };
  }

  async translateText(text) {
    const params = {
      SourceLanguageCode: "en",
      TargetLanguageCode: "pt",
      Text: String(text),
    };
    const { TranslatedText } = await this.translatorSvc
      .translateText(params)
      .promise();
    return TranslatedText.split(" e ");
  }

  formatText(labels, foundTerms) {
    const formatedText = [];
    for (const index in labels) {
      const nameInPortuguese = labels[index];
      const confidence = foundTerms[index].Confidence;
      formatedText.push(
        `${confidence.toFixed(2)}% de ser do tipo ${nameInPortuguese}`
      );
    }
    const finalText = formatedText.join("\n");
    return finalText;
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

      const { labels, foundTerms } = await this.detectImageLabels(buffer);

      console.log("Translating to Portuguese-BR...");

      const translatedTerms = await this.translateText(labels);
      const finalText = this.formatText(translatedTerms, foundTerms);

      console.log("Finishing...");

      return {
        statusCode: 200,
        body: `A imagem tem\n`.concat(finalText),
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
