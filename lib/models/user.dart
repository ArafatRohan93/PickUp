import 'package:cloud_firestore/cloud_firestore.dart';

class User {
  final String id;
  final String username;
  final String photoUrl;
  final String displayName;
  final String email;
  final String bio;

  User({this.id,this.email,this.displayName,this.photoUrl,this.bio,this.username});

  factory User.fromDocument(DocumentSnapshot doc){
    return User(
      id : doc["id"],
      email: doc["email"],
      bio: doc["bio"],
      displayName: doc["displayName"],
      photoUrl: doc["photoUrl"],
      username: doc["username"]
    );
  }
}


// serRef.document(user.id).setData({
//         "id" : user.id,
//         "username": username,
//         "photoUrl" : user.photoUrl,
//         "displayName" : user.displayName,
//         "email": user.email,
//         "bio" : "",
//         "timestamp" : timestamp
//       });