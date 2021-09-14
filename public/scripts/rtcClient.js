const HOST = location.origin.replace(/^http/, "ws");
const conn = new WebSocket(HOST);
const clientdata = {
  name: name,
  email: "xyz@gmail.com",
  id: id,
  exam_id: room,
};
const tunnelserver = {
  iceServers: JSON.parse(ice),
};
var sbtn = document.getElementById("sendbtn");
const openchannel = () => {
  sbtn.addEventListener("click", () => {
    var mymsg = document.getElementById("mymsg");
    if (mymsg.value != "") {
      dc.send("msg : " + mymsg.value);

      var c = document.createElement("div");
      c.className = "right";
      c.innerHTML = "you : " + mymsg.value;
      var ch = document.getElementById("chatbot");
      ch.appendChild(c);
      mymsg.value = "";
    }
  });
  $(document).keyup((e) => {
    if (e.keyCode == 17) {
      if (e.originalEvent.location == 1) dc.send("CTRL key is pressed.");
      else dc.send("CTRL key is pressed.");
    } else if (e.keyCode == 18) {
      if (e.originalEvent.location == 1) dc.send("ALT key is pressed.");
      else dc.send("ALT key is pressed.");

      e.preventDefault(); //because ALT focusout the element
    }
  });
  $(window).blur(function () {
    dc.send("Not active in the Exam webpage");
  });
  $(window).focus(function () {
    dc.send("Active in the Exam webpage");
  });
};

const toServer = (data) => conn.send(JSON.stringify(data));
const webrtconn = new RTCPeerConnection(tunnelserver);
webrtconn.onicecandidate = (event) => {
  if (event.candidate) {
    toServer({
      from: "CLIENT",
      to: "PROCTOR",
      user: clientdata,
      type: "NEWICE",
      candidate: event.candidate,
    });
  }
};

let dc = webrtconn.createDataChannel("my channel");
dc.onopen = openchannel;
dc.onclose = () => {
  console.log("datachannel close");
};
dc.addEventListener("message", (event) => {
  var c = document.createElement("div");
  c.className = "left";
  c.innerHTML = "proctor : " + event.data;
  var ch = document.getElementById("chatbot");
  ch.appendChild(c);
});

const camconsts = { audio: false, video: { width: 256, height: 144 } };
const screenconsts = { audio: false, video: { width: 256, height: 144 } };

const giveCamera = navigator.mediaDevices.getUserMedia(camconsts);
const giveScreen = navigator.mediaDevices.getDisplayMedia(screenconsts);

conn.onerror = (error) => {
  swal({
    title: "Oops ! Network Error",
    text: "Automatically Re-connecting ...",
    icon: "error",
    buttons: false,
    timer: 2000,
  });
  setTimeout(() => {
    location.reload();
  }, 2500);
};
conn.onclose = (reason) => {
  swal({
    title: "The Server is busy Now",
    text: "Automatically Reconnecting ...",
    icon: "info",
    timer: 2500,
    buttons: false,
  });
  setTimeout(() => {
    location.reload();
  }, 2500);
};
conn.onopen = () => {
  giveCamera.then(
    (tracks) => {
      for (const track of tracks.getTracks()) webrtconn.addTrack(track, tracks);
      giveScreen.then(
        (tracks) => {
          for (const track of tracks.getTracks())
            webrtconn.addTrack(track, tracks);
          console.log("Server Connected");
          $(".loader").fadeOut();
          $("#preloder").delay(10).fadeOut("slow");
          toServer({
            from: "CLIENT",
            to: "SERVER",
            type: "STUDENTJOIN",
            user: clientdata,
            exam: clientdata.exam_id,
          });
          //var id = setInterval(frame, 500);
          progress(100, 100, $("#progress"));
        },
        (error) => {
          swal({
            title: "Screen Capture Permission Denied",
            text: "Reload the Page & Grant Permissions",
            icon: "error",
            buttons: false,
          });
        }
      );
    },
    (error) => {
      swal({
        title: "Camera Permission Denied",
        text: "Grant Permissions & Reload the Page",
        icon: "error",
        buttons: false,
      });
    }
  );
};

conn.onmessage = (msg) => {
  payload = JSON.parse(msg.data);
  if (payload.candidate) {
    webrtconn
      .addIceCandidate(new RTCIceCandidate(payload.candidate))
      .catch((e) => {});
  }
  if (payload.sdp) {
    webrtconn.setRemoteDescription(payload.sdp);
  }
  if (payload.type == "MAKEOFFER") {
    webrtconn
      .createOffer()
      .then((offer) => {
        return webrtconn.setLocalDescription(offer);
      })
      .then(() => {
        toServer({
          from: "CLIENT",
          to: "PROCTOR",
          type: "OFFER",
          user: clientdata,
          exam: clientdata.exam_id,
          sdp: webrtconn.localDescription,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
