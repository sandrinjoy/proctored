firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $.ajax({
        type: "POST",
        url: "/userauth",
        data: { 'email': user.email, 'name': user.displayName, 'verified': user.emailVerified, 'uid': user.uid, 'photourl': user.photoURL },
        success:function(data){
            $('.lin').css('display','block');
            $('.lout').css('display','none');
             userd=data.cuser;
            $('#linimg').attr("src",data.cuser.photourl);
            $('#linname').html(data.cuser.name);
          
        }
      });

  }
  else{
    $('.lin').css('display','none');
    $('.lout').css('display','block');
    myRooms([]);
  }
});
//sign up
const login=()=>{
    var provider = new firebase.auth.GoogleAuthProvider();
   
   firebase.auth().signInWithPopup(provider).then(function(result) {
   var token = result.credential.accessToken;
}).catch(function(error) {
   alert(error)
   var errorCode = error.code;
   var errorMessage = error.message;
   var email = error.email;
   var credential = error.credential;
 });
}
const logout=()=>{
    firebase.auth().signOut().then(function() {
        window.location.href = "/proctored"
     }).catch(function(error) {
      alert(error);
       window.location.href = "/proctored"
     });
}
