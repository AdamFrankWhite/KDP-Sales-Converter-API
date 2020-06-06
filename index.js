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

const port = process.env.PORT || 5000;
// app.post("/addfile", (req, res) => {
//   const file = req.files.file;
//   fs.writeFile(`./client/public/temp/${file.name}`, file, function (err) {
//     if (err) {
//       return console.log(err);
//     }
//     res.json("The file was saved!");
//   });
// });
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

  // const fileDestinationUrl = "./temp";
  // let clientPath = path.join(__dirname, fileDestinationUrl);
  // // Checks if user image folder exists, if not creates one
  // if (!fs.existsSync(clientPath)) {
  //   fs.mkdirSync(clientPath);
  // }
  //Move new image to folder
  file.mv(`./temp/${file.name}`, (err) => {
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

    var inputFile = Buffer.from(fs.readFileSync(`./temp/${file.name}`).buffer); // File | Input file to perform the operation on.
    console.log(inputFile);

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
app.listen(port, () => {
  console.log("Server is running on Port 5000");
});
