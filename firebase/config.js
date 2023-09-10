import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
export const config = {
    apiKey: "AIzaSyBfKica-6MAXJXJDNY4XMxsktLAIB6u6i4",
    authDomain: "may2023deleteme.firebaseapp.com",
    projectId: "may2023deleteme",
    appId: "1:460858244543:web:e57a049a6211ccb6f0f50a",
};
export const firebaseApp = initializeApp(config);
export const auth = getAuth(firebaseApp);
//# sourceMappingURL=config.js.map