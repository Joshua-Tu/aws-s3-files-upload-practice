const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const router = express.Router();

const app = express();

/**
 * Configure the middleware.
 * bodyParser.json() returns a function that is passed as a param to app.use() as middleware
 * With the help of this method, we can now send JSON to our express application.
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// We export the router so that the server.js file can pick it up
module.exports = router;

//////////NOTICE HERE!
///////Here you include your profile.js api to this server.js file
const profile = require("./routes/api/profile");
app.use("/api/profile", profile); //this will use the url created in profile router.post

// Combine react and node js servers while deploying( YOU MIGHT HAVE ALREADY DONE THIS BEFORE
// What you need to do is make the build directory on the heroku, which will contain the index.html of your react app and then point the HTTP request to the client/build directory

if (process.env.NODE_ENV === "production") {
  // Set a static folder
  app.use(express.static("client/build"));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  );
}

// Set up a port, I changed the order, 'const port = process.env.PORT || 5000';
const port = 5000 || process.env.PORT;

app.listen(port, () => console.log(`Server running on port: ${port}`));
