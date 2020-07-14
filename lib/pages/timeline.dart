import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:fluttershare/widgets/header.dart';
import 'package:fluttershare/widgets/progress.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

final userRef = Firestore.instance.collection('users');

class Timeline extends StatefulWidget {
  @override
  _TimelineState createState() => _TimelineState();
}

class _TimelineState extends State<Timeline> {

  List<dynamic> users;

  @override
  void initState() {
//    getUsers();
//  getUserById();
    super.initState();
    // createUser();
    // updateUser();
    deleteUser();
  }

  createUser(){
    userRef.document("random_custom").setData({
      "username" : "Kerry",
      "isAdmin" : false,
      "postsCount" : 0,
    });
  }

  updateUser() async{
    final doc = await userRef.document("RxKUbz3v2pbzPQOFfMXc").get();

    if(doc.exists){
      doc.reference.updateData({
      "username" : "Talukder",
      "isAdmin" : false,
      "postsCount" : 1,
    });
    }
  }
  
  deleteUser() async{
    final doc = await userRef.document("bsVgZeSUfWekJYdqgnC8").get();

    if(doc.exists){
      doc.reference.delete();
    }
  }

//  getUserById() async{
//    final String id = "dM73SOwNDMhK29gcZIcL";
//    final DocumentSnapshot doc = await userRef.document(id).get();
//        print(doc.data);
//        print(doc.documentID);
//        print(doc.exists);
//  }


  @override
  Widget build(context) {
    return Scaffold(
      appBar:header(context,isAppTitle: true),
      body: StreamBuilder<QuerySnapshot>(
        stream: userRef.snapshots(),
        builder: (context, snapshot){
          if(!snapshot.hasData){
            return circularProgress();
          }
          final List<Text> children = snapshot.data.documents
          .map((doc) => Text(doc['username']))
          .toList();
          return Container(
            child: ListView(
              children: children,
            ),
          );
        },
      )
    );
  }
}

//Container(
//child: ListView(
//children:  users.map((user) {
//return Text(user["username"]);
//}).toList(),
//),
//),
