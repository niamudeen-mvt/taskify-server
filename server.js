const express = require("express")

const bodyParser = require('body-parser')


// create a app
const app = express()


// setup server port
const port = 7000

// parse requests of content-type - application/x-www-form-urlencoded

app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())



// define a root route
app.get('/', (req, res) => {
  res.send("Hello World");
});
// listen for requests
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});