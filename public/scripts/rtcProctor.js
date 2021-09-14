const HOST = location.origin.replace(/^http/, 'ws')
const conn = new WebSocket(HOST);

const user = {
    name: "PROCTOR",
    id: "PROCTOR",
    email:"protocr@gmail.com",
    exam:room
  };
const exm_id = room;
let myrtc = {}
const configuration = { 
  iceServers: [
    {urls: "stun:stun.stunprotocol.org"},
    {
      urls: 'turn:numb.viagenie.ca',
      credential: 'googlesandrin',
      username: 'sandrinejoy007@gmail.com'
    },
  {
      urls: 'turn:numb.viagenie.ca',
      credential: 'muazkh',
      username: 'webrtc@live.com'
  }]
}; 
const log = msg => console.log(msg)
const server_pass =(obj)=> conn.send(JSON.stringify(obj)) 
conn.onerror =(as)=> location.reload();
conn.onclose =() => console.log("Server Timeout");
conn.onopen = ()=> {
    console.log("Connected to WSS");
    server_pass({   
        from : "PROCTOR",
        to :   "SERVER",
        type : "PROCTORJOIN",
        user : user,
        exam : exm_id    
    }); 
};
conn.onmessage = message => {
  let msg = JSON.parse(message.data);
  if (msg.candidate) {
    let id = msg.user.id;
    myrtc[id].rtc.addIceCandidate(msg.candidate)
    .catch(e => console.log(e));
    }
  if(msg.type == "STUDENTJOINED"){
        onStudentJoined(msg)
         const id=msg.data.user.id
    }
    if(msg.type == "STUDENTDISCONNECTED"){
        let id=msg.student_conn.credentials.user.id
        myrtc[id].rtc.close();
        onStudentDisconnected(msg);
    }
    if(msg.type =="OFFER"){
      let id = msg.user.id;
      if(!myrtc[id]){
        myrtc[id] = {};
      }
       myrtc[id].rtc =new RTCPeerConnection(configuration);
       myrtc[id].rtc.onicecandidate = event => {
        if (event.candidate) {
            console.log("Creating Ice")
          server_pass({
            from:"PROCTOR",
            to:"CLIENT",
            user:user,
            student:id,
            type: "NEWICE",
            candidate: event.candidate
          });
        }
      };
      myrtc[id].rtc.addEventListener("datachannel", event => {
        myrtc[id].dataChannel = event.channel;
        addChannelFeed(id);
        myrtc[id].dataChannel.addEventListener('message', event => {
          const message = event.data;
        const nameobj2 = document.createElement("div");
        const incomingMessages = document.querySelector('#log'+id);
        nameobj2.innerHTML = message + '\n';
        incomingMessages.appendChild(nameobj2);
      });
    });
      let studsdp=msg.sdp
      myrtc[id].rtc.setRemoteDescription(studsdp);
      myrtc[id].tracknumber=0;
      myrtc[id].rtc.ontrack = ({streams:[stream]}) =>{
        if(myrtc[id].tracknumber==0)
          addCameraFeed(msg,stream);
        else
          addScreenFeed(msg,stream);
        myrtc[id].tracknumber+=1;
      }
      myrtc[id].rtc.createAnswer()
      .then(answer=>{return myrtc[id].rtc.setLocalDescription(answer);})
      .then(()=>{server_pass({ 
                  from : "PROCTOR",
                  to : "CLIENT",
                  type: "ANSWER",
                  user: msg.user,
                  exam: msg.exam,
                  sdp: myrtc[id].rtc.localDescription
              });
          })
        .catch(e=>{console.log(e)});  
    }
  }
  
  
  function onStudentJoined(payload){
   // addCameraFeed(payload);
    
  }
const onStudentDisconnected = payload => removeFeeds(payload);
  function addCameraFeed(payload,stream){
    name = payload.user.id;
    var cameralist = document.getElementById("webcams");
    var camerapannel = document.createElement("div");
    camerapannel.id =  "CameraObj_"+name;
    camerapannel.className = "camera_obj";
    var vid_obj = document.createElement("video");
    vid_obj.id = "video_cam_"+name;
    vid_obj.className = "camera_obj_video";
    vid_obj.poster = pic;
    vid_obj.srcObject=stream;
    vid_obj.autoplay = true;
    camerapannel.appendChild(vid_obj);
    var nameobj = document.createElement("div");
    nameobj.className = "camera_obj_name";
    nameobj.innerHTML = "<b>" + name + "</b>";
    camerapannel.appendChild(nameobj);
    cameralist.append(camerapannel);
  }
  function addScreenFeed(payload,stream){
    name = payload.user.id;
    var screenlist = document.getElementById("computers");
    var screenpannel = document.createElement("div");
    screenpannel.id =  "ScreenObj_"+name;
    screenpannel.className = "camera_obj";
    var vid_obj2 = document.createElement("video");
    vid_obj2.id = "screen"+name;
    vid_obj2.className = "camera_obj_video";
    vid_obj2.poster =pic;
    vid_obj2.srcObject=stream;
    vid_obj2.autoplay = true;
    screenpannel.appendChild(vid_obj2);
    var nameobj2 = document.createElement("div");
    nameobj2.className = "camera_obj_name";
    nameobj2.innerHTML = "<b>" + name + "</b>";
    screenpannel.appendChild(nameobj2);
    screenlist.append(screenpannel);

  }
  function addChannelFeed(name){
    var screenlist = document.getElementById("logdata");
    var screenpannel = document.createElement("div");
    screenpannel.id =  "logObj_"+name;
    screenpannel.className = "camera_obj";
    var vid_obj2 = document.createElement("div");
    vid_obj2.id = "log"+name;
    vid_obj2.className = "camera_obj_video3";
    screenpannel.appendChild(vid_obj2);
    var nameobj2 = document.createElement("div");
    nameobj2.className = "camera_obj_name";
    nameobj2.innerHTML = "<b>" + name + "</b>";
    var chatter = document.createElement("div");
    /*
     <div class="input-group mb-3">
            <input type="text" class="form-control" id="mymsg" placeholder="type your message">
            <div class="input-group-append">
              <button class="btn btn-success" type="button" id="sendbtn"><i class="fa fa-paper-plane"></i></button>
            </div>
          </div>
    */
    chatter.className = "input-group mb-3";
    var inputter = document.createElement("input");
    inputter.id="input"+name;
    inputter.className="form-control"
    var sdiv=document.createElement("div");
    sdiv.className="input-group-append"
    var sender = document.createElement("button");
    sender.className="btn btn-success"
    sender.innerHTML="<i class='fa fa-paper-plane'></i>";
    myrtc[name].dataChannel.onopen = (event)=>{
      sender.addEventListener("click", ()=>{
        var dt =document.getElementById("input"+name);
        if(dt.value!=""){
          myrtc[name].dataChannel.send(dt.value);
          var msg = document.createElement("div");
          msg.style.textAlign = "right";
          var incomingMessages = document.querySelector('#log'+name);
          msg.innerHTML ="you : "+ dt.value + '\n';
          incomingMessages.appendChild(msg);
          dt.value="";
        }
      });
    }
   
    chatter.appendChild(inputter);
    sdiv.appendChild(sender);
    chatter.appendChild(sdiv)
    screenpannel.appendChild(nameobj2);
    screenpannel.appendChild(chatter);
    screenlist.appendChild(screenpannel);
  }

  function removeFeeds(payload){
    try{
      document.getElementById("CameraObj_"+payload.student_conn.credentials.user.id).remove();
      document.getElementById("ScreenObj_"+payload.student_conn.credentials.user.id).remove();
      document.getElementById("logObj_"+payload.student_conn.credentials.user.id).remove();
    }catch(err){
    }
    
  }
  