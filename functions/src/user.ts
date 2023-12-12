import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
/* Use this only for testing your ability to call into a 
function from your UI. Else it serves no real purpose.

But, sometimes you need that. So we leave it in here.
*/
export const logFunctionCaller = functions.https.onCall(
  async (data, context) => {
    console.log(
      "THIS IS A JUNK CALL TO TEST FUNCTION CALLING FROM WITHIN UI",
      data
    );
    if (context && context.auth) {
      try {
        const isHardCodedMasterUser =
          context.auth.token.email === "pete@victorycto.com";
        const isSuperAdmin = context.auth.token.superadmin;
        if (isHardCodedMasterUser || isSuperAdmin) {
          const message =
            "You should not have seen this unless you were pete@victorcyto.com or a superadmin";
          return Promise.resolve(message);
        }
      } catch (e) {
        return "Error " + e;
      }
    }
    return Promise.resolve("You do not have superadmin");
  }
);

/* This seems more straightforward than it might actually be.
Why is that? Because all of these four are kind of linear examples
... whereas in real life you might have much more complex examples
such as a two or three roles that are not parent-child relationship
with each other. Such as only an analyst, only a moderator, or some
odd combination of admin but not analyst - that kind of thing. 

This function must be changed and very carefully tested when adding
and subtracting new roles. This in addition to complementar code changes
in the UI and even back ends.
*/
async function grantRole(user: any, role: string): Promise<void> {
  await admin.auth().setCustomUserClaims(user.uid, { [role]: true });
  let claims = {};
  switch (role) {
    case "user":
      claims = {
        user: true,
        moderator: false,
        admin: false,
        superadmin: false,
      };
      break;
    case "moderator":
      claims = {
        user: true,
        moderator: true,
        admin: false,
        superadmin: false,
      };
      break;
    case "admin":
      claims = {
        user: true,
        moderator: true,
        admin: true,
        superadmin: false,
      };
      break;
    case "superadmin":
      claims = {
        user: true,
        moderator: true,
        admin: true,
        superadmin: true,
      };
      break;
  }
  await admin.auth().setCustomUserClaims(user.uid, claims);
  console.log("CLAIMS SET as:", user.email, claims);
}

/*
This is the primary access point for giving different users different roles

What it does is first check who is requesting the change. If the user requesting
the change does not have a superadmin role (or isHardCodedMasterUser)
then it prevents anything from happening.

Once it checks that you're OK to request a change, then it calls grantRole() above
to do the actual work.

*/
export const modifyUserRoles = functions.https.onCall(async (data, context) => {
  let message =
    "You do not have superadmin, so your request to process a role change has not been granted";
  if (context && context.auth) {
    try {
      /* email address below should be FIXME make same one as primary firebase project admin */
      const isHardCodedMasterUser =
        context.auth.token.email === "pete@victorycto.com";
      const isSuperAdmin = context.auth.token.superadmin;
      if (isHardCodedMasterUser || isSuperAdmin) {
        const user = await admin.auth().getUserByEmail(data.email);
        if (user && user.uid) {
          await grantRole(user, data.role);
          message = `${data.email} has been set to role of '${data.role}'`;
          return Promise.resolve(message);
        }
        message = "Could not find user named " + data.email;
        return Promise.resolve(message);
      }
    } catch (e) {
      return "Error " + e;
    }
  }
  return Promise.resolve(message);
});

/*
This is called only when a user is initially created from the UI
Note this too must be changed manually, when roles are added or subtracted
*/
export const userCreationTrigger = functions.auth
  .user()
  .onCreate(async (user) => {
    const db = await admin.firestore();
    await db.collection("users").doc(`${user.email}`).set({
      timestamp: new Date().getTime(),
    });
    const uid = user.uid;
    const claims = {
      user: true,
      moderator: false,
      admin: false,
      superadmin: false,
    };
    console.log(`${user.email} CREATED IN WITH ${JSON.stringify(claims)}`);
    return admin.auth().setCustomUserClaims(uid, claims);
  });
