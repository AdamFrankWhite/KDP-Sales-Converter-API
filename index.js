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

        var inputFile = Buffer.from(
            fs.readFileSync(`./temp/${file.name}`).buffer
        ); // File | Input file to perform the operation on.

        var callback = function (error, data, response) {
            if (error) {
                console.error(error);
            } else {
                var filePath = `./temp/${file.name}`;
                fs.unlinkSync(filePath);
                return res.json(data);
            }
        };
        apiInstance.convertDataXlsxToJson(inputFile, callback);
    }
});
app.listen(port, () => {
    console.log(`Server is running on Port ${port}`);
});
