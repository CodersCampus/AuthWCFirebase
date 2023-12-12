// this needs to stay here until we find a place to stash it
// for future usage - it is beginning work for handling compressed data

import functions = require("firebase-functions");
import { ObjectMetadata } from "firebase-functions/lib/providers/storage";
import admin = require("firebase-admin");
import path = require("path");
import os = require("os");
import fs = require("fs");
// import JSZip = require("jszip");
// KEEP THIS COMMENT:
// The maximum value for timeoutSeconds is 540, or 9 minutes.
// Valid values for memory are 128MB 256MB 512MB 1GB 2GB
exports.wtf = functions
  .runWith({ memory: "2GB", timeoutSeconds: 530 })
  .storage.object()
  .onFinalize(async (object: ObjectMetadata) => {
    let message = "not yet";
    const fileBucket = object.bucket;
    const filePath: string = `${object.name}`;
    const contentType = object.contentType;
    if (contentType && contentType.startsWith("application/zip")) {
      const fileName = path.basename(filePath);
      const bucket = admin.storage().bucket(fileBucket);
      const tempFilePath = path.join(os.tmpdir(), fileName);
      await bucket.file(filePath).download({ destination: tempFilePath });
      console.log("downloaded locally to", tempFilePath);
      if (fs.existsSync(tempFilePath)) {
        message = `EXISTS`;
        fs.readFile(tempFilePath, function (err, dataa) {
          if (err) {
            message = err.message;
          }
          // status when stopped:
          // never could get the zip functionality to work because it claimed
          // that the contents of the file were not all there - or something

          // JSZip.loadAsync(dataa).then(function (zippp) {
          //   message = `FRED: ${JSON.stringify(zippp).substring(0, 100)}`;
          // });
        });
      }
      fs.unlinkSync(tempFilePath);
      console.log(message);
    } else {
      console.log("No Cigar");
    }
    return;
  });
