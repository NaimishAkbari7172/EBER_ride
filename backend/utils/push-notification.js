const express = require('express');
const webPush = require('web-push')

const notificationRoutes = express.Router();

// console.log(webPush.generateVAPIDKeys());
// command for generate keys
// ./node_modules/.bin/web-push generate-vapid-keys

const vapidKeys = {
    publicKey: 'BNUQ-KZhhIcBJ6shg9sZCT1hIAooN2s2nhzn6DfW3AzL75qTMFRgE4Mf_EF1an0uS2wFfXUuojvsHMBrCst1LcI',
    privateKey: 'aYWLXLh0pdOF11wT5h1xi64mDXsvXdPh2_DNByXh7Ps'
}

// get client subscription config from db
// const subscription = {
//     endpoint: '',
//     expirationTime: null,
//     keys: {
//         auth: '',
//         p256dh: '',
//     },
// };

const payload = {
    notification: {
        title: 'Title',
        body: 'This is my body',
        icon: 'assets/icons/icon-384x384.png',
        actions: [
            { action: 'bar', title: 'Focus last' },
            { action: 'baz', title: 'Navigate last' },
        ],
        data: {
            onActionClick: {
                default: { operation: 'openWindow' },
                bar: {
                    operation: 'focusLastFocusedOrOpen',
                    url: '/app',
                },
                baz: {
                    operation: 'navigateLastFocusedOrOpen',
                    url: '/app',
                },
            },
        },
    },
};

const options = {
    vapidDetails: {
        subject: 'mailto:example_email@example.com',
        publicKey: vapidKeys.publicKey,
        privateKey: vapidKeys.privateKey,
    },
    TTL: 60,
};

// send notification
// webPush.sendNotification(subscription, JSON.stringify(payload), options)
//     .then((_) => {
//         console.log('SENT!!!');
//         console.log(_);
//     })
//     .catch((_) => {
//         console.log(_);
//     });


module.exports= notificationRoutes;