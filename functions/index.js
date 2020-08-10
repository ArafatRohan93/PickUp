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
        })

    })





