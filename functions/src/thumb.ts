import functions = require("firebase-functions");
import admin = require("firebase-admin");
const spawn = require("child-process-promise").spawn;
import path = require("path");
import os = require("os");
import fs = require("fs");
import { ObjectMetadata } from "firebase-functions/lib/providers/storage";
// This function works, theoretically, but only when given 
// one or maybe two imagesto process at a time
exports.generateThumbnail = functions.storage
  .object()
  .onFinalize(async (object: ObjectMetadata) => {
    const fileBucket = object.bucket;
    const filePath: string = object.name ? object.name : `void`;
    const contentType = object.contentType;
    const metageneration = object.metageneration;
    if (contentType && !contentType.startsWith("image/")) {
      console.log(
        `This is not an image but it has metageneration of ${metageneration}`
      );
      return;
    }

    const fileName = path.basename(filePath);
    if (fileName.startsWith("thumb_")) {
      console.log("Already a Thumbnail.");
      return;
    }
    const bucket = admin.storage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const metadata = {
      contentType: contentType
    };
    await bucket.file(filePath).download({ destination: tempFilePath });
    console.log("Image downloaded locally to", tempFilePath);
    await spawn("convert", [
      tempFilePath,
      "-thumbnail",
      "200x200>",
      tempFilePath
    ]);
    console.log("Thumbnail created at", tempFilePath);
    const thumbFileName = `thumb_${fileName}`;
    const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
    await bucket.upload(tempFilePath, {
      destination: thumbFilePath,
      metadata: metadata
    });
    fs.unlinkSync(tempFilePath);
    return;
  });
