//actual code

const roomList = document.querySelector(".rooms");
const signupbtn = document.querySelector("#signup-btn");

const signupbtn1 = document.querySelector("#signup-btn1");
const signoutbtn = document.querySelector("#signout-btn");
let userd = null;
const newroombtn = document.querySelector("#newroombtn");
const newroomform = document.querySelector("#newroomform");

signupbtn.addEventListener("click", (e) => {
  e.preventDefault();
  login();
});

signupbtn1.addEventListener("click", (e) => {
  e.preventDefault();
  login();
});
signoutbtn.addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});
function loadroom(x) {
  $.ajax({
    type: "POST",
    url: "/myroom",
    data: { code: x },
    success: function (data) {},
  });
}
function confirmDialog(message, onConfirm) {
  var fClose = function () {
    modal.modal("hide");
  };
  var modal = $("#confirmModal");
  modal.modal("show");
  $("#confirmMessage").empty().append(message);
  $("#confirmOk").unbind().one("click", onConfirm).one("click", fClose);
  $("#confirmCancel").unbind().one("click", fClose);
}
const myRooms = (rooms) => {
  let html = "";
  const infobar = `<div class="container ">
    <div class="row">
        <div class="feature-intro text-center col-md-10 col-xl-8 mx-md-auto">
            <h1 class="feature-title mb-3">How to Start ?</h1>
            <p class="lead">Use <kbd>New Proctor Room</kbd> Button for Creating a Proctored Room</p>
        </div>
    </div></div>`;
  var counter = 0;
  rooms.forEach((e) => {
    const room = e.data();
    if (room.user == userd.email) {
      counter = counter + 1;
      var type = room.public ? "public" : "private";
      const queryString = room.link;
      const roomcode = queryString.substr(queryString.indexOf("=") + 1);
      const li = `
        <div class="col-md-4">
              <div class="card mb-4 box-shadow">
              <div class="card-header font-weight-bold">${room.name}</div>
                <div class="card-body">
                  <div class="p-1 rounded ${
                    room.public ? "bg-success" : "bg-danger"
                  } text-white">${type}</div><br>

                  <div class=""><span class="font-weight-bold">Participants Link </span><br>
               
       </div>
       <div class=" ">
  <div class="input-group-prepend">
    <span class="input-group-text text-wrap text-truncate p-1"><a href="${
      room.link
    }" target="_blank" class="small">${room.link}</a></span>
    <div class="input-group-append">
    <button title="copy link" class=" btn btn-light  border shadow" value="${
      room.link
    }" onclick="copy(this.value)"><i class="fas fa-copy" ></i></button></div>
    </div>

</div>

                  </p>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="btn-group">
                      <button type="button" class="btn btn-sm btn-warning"><a class="btn btn-sm btn-warning" href="/myroom?code=${roomcode}" target="_blank"><i class="fas fa-door-open"></i>Start to Proctor</a></button>
                      <button type="button" class="btn btn-sm btn-dark" value="${
                        e.id
                      }" onclick="deleteRoom(this.value)"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        `;
      html += li;
    }
  });
  if (counter == 0) {
    html += infobar;
  }
  roomList.innerHTML = html;
};
const copy = (e) => {
  navigator.clipboard.writeText(e);
  $("#copyToast").toast("show");
};
const typecheck = () => {
  let x = $("#roomtype").val();
  if (x == "false") {
    $("#emailsform").attr("hidden", false);
  } else {
    $("#emailsform").attr("hidden", true);
  }
};
newroombtn.addEventListener("click", (e) => {
  $("#exampleModalCenter").modal("hide");
  let room = {
    name: newroomform["roomname"].value,
    public: newroomform["roomtype"].value == "true" ? true : false,
    user: userd.email,
    participants:
      newroomform["roomtype"].value == "false"
        ? $("#emails").tagsinput("items")
        : "",
    link: "https://proctored.herokuapp.com/",
  };
  newRoom(room);
});
