const admin = require("firebase-admin");

const serviceAccount = "src/firebase/gotruhub-2d5a5-firebase-adminsdk-twm1y-85537092a2.json";
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const sendNotif = async (token: string, title: string = "New message", body: string = "Welcome to gotruhub", payload: { [key: string]: any } = {}) => {
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
          payload: JSON.stringify(payload)
        }
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            alert: {
              title: title,
              body: body,
            },
          },
          customData: {
            title: title,
            body: body,
            payload: JSON.stringify(payload)
          }
        },
        fcm_options: {
          analytics_label: 'apns_label',
        },
      },
      webpush: {
        headers: {
          TTL: '4500',
        },
        notification: {
          title: title,
          body: body,
          // icon: '/path/to/icon.png',
        },
        data: {
          title: title,
          body: body,
          payload: JSON.stringify(payload)
        }
      },
      data: {
        title: title,
        body: body,
        payload: JSON.stringify(payload)
      },
      token: token,
    };
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error: any) {
    console.error('Error sending notification:', error);
    throw error;
  }
};
