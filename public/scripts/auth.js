let userx;
let usern;
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    let fuser = formatUser(user);
    createUser(fuser.uid, fuser);
    $.ajax({
      type: "POST",
      url: "/userauth",
      data: {
        email: user.email,
        name: user.displayName,
        verified: user.emailVerified,
        uid: user.uid,
        photourl: user.photoURL,
      },
      success: function (data) {
        $(".lin").css("display", "block");
        $(".lout").css("display", "none");
        userd = data.cuser;
        $("#linimg").attr("src", data.cuser.photourl);
        $("#linname").html(data.cuser.name);
        db.collection("rooms").onSnapshot((rooms) => {
          myRooms(rooms);
        });
      },
    });
  } else {
    userx = null;
    usern = null;
    $(".lin").css("display", "none");
    $(".lout").css("display", "block");
  }
});
//sign up
const login = () => {
  var provider = new firebase.auth.GoogleAuthProvider();

  firebase
    .auth()
    .signInWithPopup(provider)
    .then(function (result) {
      var token = result.credential.accessToken;
    })
    .catch(function (error) {
      alert(error);
      var errorCode = error.code;
      var errorMessage = error.message;
      var email = error.email;
      var credential = error.credential;
    });
};
const logout = () => {
  firebase
    .auth()
    .signOut()
    .then(function () {
      window.location.href = "/";
    })
    .catch(function (error) {
      alert(error);
      window.location.href = "/";
    });
};
const newRoom = (room) => {
  db.collection("rooms")
    .add(room)
    .then((myid) => {
      db.collection("rooms")
        .doc(myid.id)
        .update({
          link: location.origin + "/proctored?room=" + myid.id,
        });
      newroomform.reset();
    });
};
const deleteRoom = (id) => {
  confirmDialog("Are you sure to Delete this room ?", function () {
    db.collection("rooms")
      .doc(id)
      .delete()
      .then(function () {
        $("#deleteToast").toast("show");
      })
      .catch(function (error) {
        console.error("Error removing document: ", error);
      });
  });
};
