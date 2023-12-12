import functions = require("firebase-functions");
import admin = require("firebase-admin");
const spawn = require("child-process-promise").spawn;
import path = require("path");
import os = require("os");
import fs = require("fs");
import { ObjectMetadata } from "firebase-functions/lib/providers/storage";

// see https://imagemagick.org/script/convert.php
// see https://github.com/firebase/functions-samples/tree/master/convert-images

exports.generateThumbnailBanners = functions.storage
  .object()
  .onFinalize(async (object: ObjectMetadata) => {
    const fileBucket = object.bucket;
    const filePath: string = object.name ? object.name : `void`;
    const contentType = object.contentType;
    if (contentType && !contentType.startsWith("image/")) {
      // const metageneration = object.metageneration; to console.log when troubleshooting
      return;
    }
    const fileName = path.basename(filePath);
    if (
      fileName.startsWith("thumb100") ||
      fileName.startsWith("banner340") ||
      fileName.startsWith("banner246")
    ) {
      // desired result, complete
      return;
    } else if (
      filePath.endsWith(`/thumb/${fileName}`) ||
      filePath.endsWith(`/banner/${fileName}`)
    ) {
      const bucket = admin.storage().bucket(fileBucket);
      const tempFilePath = path.join(os.tmpdir(), fileName);
      const metadata = {
        contentType: contentType,
      };
      await bucket.file(filePath).download({ destination: tempFilePath });
      if (filePath.endsWith(`/thumb/${fileName}`)) {
        const thumb100FileName = `thumb100${fileName.substring(
          fileName.lastIndexOf("."),
          fileName.length
        )}`;
        await spawn("convert", [
          tempFilePath,
          "-thumbnail",
          "100x100>",
          tempFilePath,
        ]);
        const thumb100FilePath = path.join(
          path.dirname(filePath),
          thumb100FileName
        );
        await bucket.upload(tempFilePath, {
          destination: thumb100FilePath,
          metadata: metadata,
        });
      } else if (filePath.endsWith(`/banner/${fileName}`)) {
        const banner340fileName = `banner340${fileName.substring(
          fileName.lastIndexOf("."),
          fileName.length
        )}`;
        await spawn("convert", [
          tempFilePath,
          "-thumbnail",
          "340x190>",
          tempFilePath,
        ]);
        const banner340FilePath = path.join(
          path.dirname(filePath),
          banner340fileName
        );
        await bucket.upload(tempFilePath, {
          destination: banner340FilePath,
          metadata: metadata,
        });
        const banner246FileName = `banner246${fileName.substring(
          fileName.lastIndexOf("."),
          fileName.length
        )}`;
        await spawn("convert", [
          tempFilePath,
          "-thumbnail",
          "246x146>",
          tempFilePath,
        ]);
        const banner246FilePath = path.join(
          path.dirname(filePath),
          banner246FileName
        );
        await bucket.upload(tempFilePath, {
          destination: banner246FilePath,
          metadata: metadata,
        });
      }
      fs.unlinkSync(tempFilePath);
      return;
    }
  });
