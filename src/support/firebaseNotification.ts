const admin = require("firebase-admin")

const serviceAccount = "src/firebase/gotruhub-2d5a5-firebase-adminsdk-twm1y-85537092a2.json"
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

export const sendNotif = async (token:string, title:string="New message", body:string="Welcome to gotruhub") => {
  
    try {
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid FCM token provided');
      }
      const message = {
        notification: {
          title: title,
          body: body,
        },
        android: {
          notification: {
            sound: "default",
          },
          data: {
            title: title,
            body: body,
          },
        },
        token: token,
      };
      const response = await admin.messaging().send(message);
      
    } catch (error:any) {
      
      throw error;
    }
  };