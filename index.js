const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const fsExtra = require("fs-extra");
const app = express();
app.use(express.json());
app.use(cors());
app.use(fileUpload());

app.post("/addfile", (req, res) => {
  const file = req.files.file;
  fs.writeFile(`./client/public/temp/${file.name}`, file, function (err) {
    if (err) {
      return console.log(err);
    }
    res.json("The file was saved!");
  });
});
app.post("/convert", (req, res) => {
  if (req.files === null) {
    return res.status(400).json("No file uploaded");
  }

  const file = req.files.file;
  // Validate MIMEtype
  if (
    file.mimetype !==
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return res.json("Wrong file type");
  }

  console.log(file);
  const fileDestinationUrl = "../kdp-app-client/public/temp";
  let clientPath = path.join(__dirname, fileDestinationUrl);
  // Checks if user image folder exists, if not creates one
  if (!fs.existsSync(clientPath)) {
    fs.mkdirSync(clientPath);
  }
  //Empties folder to ensure only one image per user
  fsExtra.emptyDirSync(clientPath);
  //Move new image to folder
  file.mv(`../kdp-app-client/public/temp/${file.name}`, (err) => {
    if (err) {
      res.json(err);
    } else {
      convertData();
    }
  });

  function convertData() {
    var CloudmersiveConvertApiClient = require("cloudmersive-convert-api-client");
    var defaultClient = CloudmersiveConvertApiClient.ApiClient.instance;
    var Apikey = defaultClient.authentications["Apikey"];
    Apikey.apiKey = "02987653-aeeb-4a0a-840e-7c6d991aa1e4";

    var apiInstance = new CloudmersiveConvertApiClient.ConvertDataApi();

    var inputFile = Buffer.from(
      fs.readFileSync(`../kdp-app-client/public/temp/${file.name}`).buffer
    ); // File | Input file to perform the operation on.

    var callback = function (error, data, response) {
      if (error) {
        console.error(error);
      } else {
        return res.json(data);
      }
    };
    apiInstance.convertDataXlsxToJson(inputFile, callback);
  }
});
app.listen(5000, () => {
  console.log("Server is running on Port 5000");
});
