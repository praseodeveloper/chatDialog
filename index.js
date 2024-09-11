import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Ollama } from 'ollama';
import VectorDBManager from './VectorDBManager.js';

const app = express();
app.use(express.json());
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = 3000;

app.use(express.static('public'));

const oManager = new VectorDBManager();
const oSetupPromise = oManager.setup("Collection1", "docs/");

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public/chatPage.html"));
});

app.post("/reset", function (req, res) {
  messages.splice(1); // Remove everything except system message
  res.json({ "response": "Conversation has been cleared" });
});

const messages = [{
  role: 'system',
  content: `You are an assistant for question-answering tasks.
  You will be provided with a context for every question.
  If the context provides relevant inforomation, use it for formulating the answer.
  Else, ignore the context completely and use your model weights to answer.
  Do not tell the user when you ignore the context.
  Keep the answer concise and start directly to the point.`
}];

app.post("/sendPrompt", function (req, res) {
  const sUserQuery = req?.body?.prompt;
  const oResultPromise = oManager.queryCollection(5, [sUserQuery]); // top 5 chunks
  oResultPromise
    .then((oResult) => {
      console.log(`Retrieved Context: ${JSON.stringify(oResult)}`);
      const sContext = oResult.documents[0];
      const sUserMessageContent = `Question: ${sUserQuery} Context: ${sContext} Answer: `;
      console.log(sUserMessageContent);
      messages.push({ role: 'user', content: sUserMessageContent });

      const oOllama = new Ollama({ host: 'http://localhost:11434' });
      oOllama.chat({
        model: 'llama3',
        messages: messages,
        stream: false
      }).then(data => {
        console.log(data);
        messages.push(data.message);
        res.json({ "response": data.message?.content });
      })
        .catch((oError) => {
          console.error('Error:', oError);
          res.status(400).send({
            message: oError
          });
        });
    });
});

app.listen(port, () => {
  oSetupPromise.then(() => console.log(`Webserver running on port ${port}`));
});
