import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Ollama } from 'ollama';
import VectorDBManager from './VectorDBManager.js';

const oApp = express();
oApp.use(express.json());
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nPort = 3000;

oApp.use(express.static('public'));

const oManager = new VectorDBManager();
const oSetupPromise = oManager.setup("Collection1", "docs/");
const aMessages = [{
  role: 'system',
  content: `You are an assistant for question-answering tasks.
  You will be provided with a context for each question.
  If the context provides relevant information, use it for formulating the answer.
  Else, use your model weights to answer.
  Do not tell the user whether you used the supplied context or not.
  Keep the answer formal, concise and directly to the point.`
}];

oApp.get("/", function (oRequest, oResponse) {
  oResponse.sendFile(path.join(__dirname, "public/chatPage.html"));
});

oApp.post("/reset", function (oRequest, oResponse) {
  aMessages.splice(1); // Remove everything except system message
  oResponse.json({ "response": "Conversation has been cleared" });
});

oApp.post("/sendPrompt", function (oRequest, oResponse) {
  const sUserQuery = oRequest?.body?.prompt;
  // Only the first question in the conversation requires a context
  const oGetContextPromise = aMessages.length === 1 ?
    oManager.queryCollection(5, [sUserQuery]) :
    Promise.resolve(null); // top 5 chunks

  oGetContextPromise
    .then((oContext) => {
      let sUserMessageContent;
      if (oContext) {
        console.log(`Retrieved Context: ${JSON.stringify(oContext)}`);
        const sContext = oContext.documents[0];
        sUserMessageContent = `Question: ${sUserQuery} Context: ${sContext} Answer: `;
      } else {
        sUserMessageContent = `Question: ${sUserQuery} Answer: `;
      }
      console.log(sUserMessageContent);
      aMessages.push({role: 'user', content: sUserMessageContent});

      const oOllama = new Ollama({host: 'http://localhost:11434'});
      oOllama.chat({
        model: 'llama3',
        messages: aMessages,
        stream: false
      })
        .then(oData => {
          console.log(oData);
          aMessages.push(oData.message);
          oResponse.json({"response": oData.message?.content});
        });
    })
    .catch((oError) => {
      console.error('Error:', oError);
      oResponse.status(400).send({
        message: oError
      });
    });
});

oApp.listen(nPort, () => {
  oSetupPromise.then(() => console.log(`Webserver running on port ${nPort}`));
});
