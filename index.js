require('dotenv').config()
const express = require("express");
const path = require('path')
const http = require("http");
const routes = require('./src/routes');
const PORT = 3000;

const app = express();
const server = http.createServer(app);
const errorHandler = require("./src/middlewares/errorHandler");

// untuk meregistrasi global variable untuk error handling
require("./src/helpers/errors");

app.use(express.json());

app.use("/public", express.static(path.resolve(__dirname, "public")));

require("./src/routes")(app);

app.use((req, res, next) => {
  next(new NotFoundError(null, "Sorry, page not found!"));
})

//application level middleware untuk error handling
app.use(errorHandler)

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
