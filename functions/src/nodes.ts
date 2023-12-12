import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const firestore = admin.firestore();
import { ContentNode, ParentChildKV } from "./types";

const buildParentChildArray = async () => {
  const nodes: Array<ContentNode> = [];
  const parentChildKVs: Array<ParentChildKV> = [];
  const nodeData = await firestore.collection("nodes").get();
  nodeData.forEach((doc: any) => {
    nodes.push(doc.data());
  });
  const importedParentChildKVs = await firestore
    .collection("prntChldKVs")
    .get();
  importedParentChildKVs.forEach((doc: any) => {
    parentChildKVs.push(doc.data());
  });
  return { nodes, prntChldKVs: parentChildKVs };
};

export const initializeNodes = functions.https.onCall(
  async (message, context) => {
    // FIXME should check for auth first
    // if (context && context.auth) {
    //   try {
    //     const isUser = context.auth.token.user;
    //     if (isUser) {
    const data = await buildParentChildArray();
    return data;
    //     } else {return Promise.resolve("Not logged in")}
    //   } catch (e) {
    //     return "Error " + e;
    //   }
    // } else {return Promise.resolve(`No context with ${message}`)}
    // return Promise.resolve("fail");
  }
);
