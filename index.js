
const express = require('express');
const app = express();
app.use(express.json());
const port = 3000;

app.use(express.static('public'));

app.get("/", function (req, res) {
    res.sendFile("public/index.html");
  });

  app.post("/sendPrompt", function (req, res) {
    res.json({ "response": `Received message : ${req?.body?.prompt}` });
  });

app.listen(port, () => {
  console.log(`Webserver running on port ${port}`)
});
