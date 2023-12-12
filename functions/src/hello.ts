import * as functions from "firebase-functions";

/* Use this only for testing your ability to call into a 
function from anything. Else it serves no real purpose.

See firebase docs for more help getting started.
But, sometimes you need that.
*/
export const helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello, from Firebase!" + request);
});
