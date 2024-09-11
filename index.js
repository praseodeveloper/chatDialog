const express = require('express');
const app = express();
const path = require('path')
const ollama = require('ollama');
app.use(express.json());
const port = 3000;

app.use(express.static('public'));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public/chatPage.html"));
});

app.post("/reset", function(req, res) {
 messages.splice(1); // Remove everything except system message
 res.json({ "response": "Conversation has been cleared" });
});

// To stay within token limit for a decent conversation length
const messages = [{ role: 'system', content: "Generate a response in less than 100 words always." }];

app.post("/sendPrompt", function (req, res) {
  messages.push({ role: 'user', content: req?.body?.prompt });

  const oOllama = new ollama.Ollama({ host: 'http://localhost:11434' });
  const oResponse = oOllama.chat({
    model: 'llama3.1',
    messages: messages,
    stream: false
  }).then(data => {
      console.log(data);
      messages.push(data.message);
      res.json({ "response": data.message?.content });
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(400).send({
        message: error
      });
    });
});

app.listen(port, () => {
  console.log(`Webserver running on port ${port}`)
});
