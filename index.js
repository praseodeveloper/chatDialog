const express = require('express');
const app = express();
const path = require('path')
app.use(express.json());
const port = 3000;

app.use(express.static('public'));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public/chatPage.html"));
});

// ToDo : Provide API to reset the conversation
// Currently, it requires a server restart
const messages = [];

app.post("/sendPrompt", function (req, res) {
  messages.push({ role: 'user', content: req?.body?.prompt });
  fetch(`http://localhost:11434/api/chat`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      model: "llama3",
      messages: messages,
      stream: false
    })
  }).then(response => response.json())
    .then(data => {
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
