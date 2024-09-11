import pdf from 'pdf-parse-fork';
import fs from 'fs';
import path from 'path';
import { ChromaClient, DefaultEmbeddingFunction } from "chromadb";
import docx from 'docx-parser'

export default class VectorDBManager {
  #oClient;
  #oEmbeddingFunction;
  #oCollection;

  constructor() {
    this.#oClient = new ChromaClient();
    this.#oEmbeddingFunction = new DefaultEmbeddingFunction();
    this.#oCollection = null;
  }

  #chunkText(sText) {
    const aWords = sText.split(/\s+/);
    const nChunkSize = 100
      ;
    const aChunks = [];

    for (let i = 0; i < aWords.length; i += nChunkSize) {
      const sChunk = aWords.slice(i, i + nChunkSize).join(' ');
      aChunks.push(sChunk);
    }

    return aChunks;
  }

  //PDF Parser
  async #extractTextFromPDF(sFilePath) {
    const oDataBuffer = fs.readFileSync(sFilePath);
    const sPdfText = await pdf(oDataBuffer);
    return sPdfText.text;
  }

  //Docx Parser
  async #extractTextFromDocx(sFilePath) {
    return new Promise((resolve, reject) => {
      docx.parseDocx(sFilePath, function (sData) {
        if (sData) {
          resolve(sData);
        } else {
          reject(new Error("No data returned from parseDocx"));
        }
      });
    });
  }

  async #addTextToCollection(sText, sFilePath) {
    console.log(`Ingesting File ${sFilePath}\n...`)
    const aChunks = this.#chunkText(sText);
    const sFileName = sFilePath.split('/').pop(); // Get filename from path
    const aIds = aChunks.map((_, index) => `${sFileName}_chunk_${index + 1}`);
    const aMetadata = aChunks.map(() => ({ source: sFileName }));

    const sResult = await this.#oCollection.add({
      ids: aIds,
      metadatas: aMetadata,
      documents: aChunks,
    });

    console.log(sResult);
  }

  //Master Parser
  async #addFilesToCollection(sFolderPath) {
    const aFileNames = fs.readdirSync(sFolderPath);

    for (const sFileName of aFileNames) {
      const sFilePath = path.join(sFolderPath, sFileName);
      let sText;
      const sFileExtension = path.extname(sFileName).toLowerCase();
      switch (sFileExtension) {
        case ".pdf":
          sText = await this.#extractTextFromPDF(sFilePath);
          await this.#addTextToCollection(sText, sFilePath);
          break;

        case ".docx":
          sText = await this.#extractTextFromDocx(sFilePath);
          await this.#addTextToCollection(sText, sFilePath);
          break;

        case ".txt":
          sText = fs.readFileSync(sFilePath, 'utf8');
          await this.#addTextToCollection(sText, sFilePath);
          break;

        default:
          continue;
      }
    }
  }

  async #getOrCreateCollection(sCollectionName) {
    return await this.#oClient.getOrCreateCollection({
      name: sCollectionName,
      metadata: {
        description: "Private Docs",
        "hnsw:space": "l2" // define distance function
      },
      embeddingFunction: this.#oEmbeddingFunction,
    });
  }

  async setup(sCollectionName, sContentPath) {
    this.#oCollection = await this.#getOrCreateCollection(sCollectionName || "defaultCollection");
    if (!sContentPath) {
      throw new Error("No content path to load content");
    }
    await this.#addFilesToCollection(sContentPath);
  }

  async queryCollection(nResults, aQueryTexts) {
    const sResult = await this.#oCollection.query({
      nResults,
      queryTexts: aQueryTexts,
    });
    return sResult;
  }
}
