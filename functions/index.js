const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
//admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.onCreateFollower = functions.firestore
    .document("/followers/{userId}/userFollowers/{followerId}")
    .onCreate( async (snapshot, context) => {
        console.log("Follower Created", snapshot.data());
        const userId = context.params.userId;
        const followerId = context.params.followerId;

        // 1.Create followed users posts ref
        const followedUserPostsRef = admin
        .firestore()
        .collection('posts')
        .doc(userId)
        .collection('userPosts');

        // 2.Create following users timeline ref
        const timelinePostsRef = admin
        .firestore()
        .collection('timeline')
        .doc(followerId)
        .collection('timelinePosts');

        // 3. Get followed users posts
        const querySnapshot = await followedUserPostsRef.get();

        // 4. Add each userpost tom following user's timeline
        querySnapshot.forEach(doc => {
            if(doc.exists){
                const postId = doc.id;
                const postData = doc.data();
                timelinePostsRef.doc(postId).set(postData);
            }
        });
    });

    exports.onDeleteFollower = functions.firestore
    .document("/followers/{userId}/userFollowers/{followerId}")
    .onDelete(async (snapshot, context) => {
        console.log("Follower deleted", snapshot.id);

        const userId = context.params.userId;
        const followerId = context.params.followerId;

        const timelinePostsRef = admin
        .firestore()
        .collection('timeline')
        .doc(followerId)
        .collection('timelinePosts')
        .where("ownerId", "==", userId);

        const querySnapshot = await timelinePostsRef.get();
        querySnapshot.forEach(doc => {
            if(doc.exists) {
                doc.ref.delete();
            }
        });

    });

    exports.OnCreatePost = functions.firestore
    .document('/posts/{userId}/userPosts/{postId}')
    .onCreate(async (snapshot, context)=>{
        const postCreated = snapshot.data();
        const userId = context.params.userId;
        const postId = context.params.postId;

    //1.get all the followers of the user who made the post
    const userFollowersRef = admin.firestore()
    .collection('followers')
    .doc(userId)
    .collection('userFollowers');
    
    const querySnapshot = await userFollowersRef.get();

    // 2. Add new post to each follower's timeline
    querySnapshot.forEach(doc => {
        const followerId = doc.id;

        admin
        .firestore()
        .collection('timeline')
        .doc(followerId)
        .collection('timelinePosts')
        .doc(postId)
        .set(postCreated);
    });
    });

    exports.OnUpdatePost = functions.firestore
    .document('/posts/{userId}/userPosts/{postId}')
    .onUpdate(async (change, context)=>{
        const postUpdated = change.after.data();
        const userId = context.params.userId;
        const postId = context.params.postId;

        const userFollowersRef = admin
        .firestore()
        .collection('followers')
        .doc(userId)
        .collection('userFollowers');
    
    const querySnapshot = await userFollowersRef.get();

    // 2. update new post to each follower's timeline
    querySnapshot.forEach(doc => {
        const followerId = doc.id;

        admin
        .firestore()
        .collection('timeline')
        .doc(followerId)
        .collection('timelinePosts')
        .doc(postId)
        .get().then(doc => {
            if(doc.exists){
                doc.ref.update(postUpdated);
            }
            return null;
        }).catch(e => {
            console.log(e);
            //res.sendStatus(500);
        });
    });
    });

    exports.OnDeletePost = functions.firestore
    .document('/posts/{userId}/userPosts/{postId}')
    .onDelete(async (snapshot, context)=>{
        const userId = context.params.userId;
        const postId = context.params.postId;

        const userFollowersRef = admin
        .firestore()
        .collection('followers')
        .doc(userId)
        .collection('userFollowers');
    
    const querySnapshot = await userFollowersRef.get();

    // 2. delete post to each follower's timeline
    querySnapshot.forEach(doc => {
        const followerId = doc.id;

        admin
        .firestore()
        .collection('timeline')
        .doc(followerId)
        .collection('timelinePosts')
        .doc(postId)
        .get().then(doc => {
            if(doc.exists){
                doc.ref.delete();
            }
            return null;
        }).catch(e => {
            console.log(e);
            //res.sendStatus(500);
        });
    });
    });

exports.onCreateActivityFeedItem = functions.firestore
.document('/feed/{userId}/feedItems/{activityFeedItem}')
.onCreate(async (snapshot, context) => {
    console.log('Activity feed item created', snapshot.data());

    // 1. Get user connected to the feed
    const userId = context.params.userId;

    const userRef = admin.firestore().doc(`users/${userId}`);
    const doc = await userRef.get();

    // 2. once we have user, check if they have a notification token;
    //send notification if they have a token
    const androidNotificationToken = doc.data().androidNotificationToken;
    const createdActivityFeedItem = snapshot.data();
    if(androidNotificationToken){
        // send notification
        sendNotification(androidNotificationToken, createdActivityFeedItem);
    }
    else{
        console.log("No token for user, cannot send Notification");
    }

    function sendNotification(androidNotificationToken, activityFeedItem){
        let body;

        // 3. switch body value based on notification type 
        switch(activityFeedItem.type){
            case "comment":
                body = `${activityFeedItem.username} replied: ${activityFeedItem.commentData}`
                break;
            case "like":
                body = `${activityFeedItem.username} liked your post`;
                break;
            case "follow":
                body = `${activityFeedItem.username} started following you`;
                break;
            default:
                break;
        }

        // 4. Create message for push notification 
        const message = {
            notification : { body },
            token: androidNotificationToken,
            data: {recipient: userId}
        };

        // 5. Send message with admin.messaging()

        admin.messaging().send(message).then(response => {
            //response is a message ID string
            console.log("Successfully sent message", response);
            return null;
        })
        .catch(error => {
            console.log('Error sending message', error);
        });
    }

});




