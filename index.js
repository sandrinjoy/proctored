const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
var session = require("express-session");
var ssn;
const PORT = process.env.PORT || 5000;

const log = (a) => console.log(a);

const server = express()
  .use(express.static(path.join(__dirname, "public")))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(
    session({ secret: "sandrinqwerty", resave: true, saveUninitialized: true })
  )
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"))
  .get("/proctored", (req, res) => {
    if (!req.query.name && !req.query.id && req.query.room) {
      res.render("pages/user", { room: req.query.room });
    } else if (req.query.name && req.query.id && req.query.room) {
      iceServers = [
        { urls: "stun:stun.stunprotocol.org" },
        {
          urls: "turn:numb.viagenie.ca",
          credential: "googlesandrin",
          username: "sandrinejoy007@gmail.com",
        },
        {
          urls: "turn:numb.viagenie.ca",
          credential: "muazkh",
          username: "webrtc@live.com",
        },
      ];
      res.render("pages/candidate", {
        room: req.query.room,
        ice: iceServers,
        name: req.query.name,
        id: req.query.id,
        rname: req.query.rname,
      });
    } else {
      res.render("pages/index");
    }
  })

  .post("/userauth", (req, res) => {
    ssn = req.session;
    ssn.email = req.body.email;
    ssn.name = req.body.name;
    ssn.uid = req.body.uid;
    ssn.photourl = req.body.photourl;
    res.send({ cuser: ssn });
  })
  .get("/myroom", (req, res) => {
    code = req.query.code;
    console.log(code);
    res.render("pages/proctor", { code: code });
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

//for websockets

const { Server } = require("ws");
const wss = new Server({ server });
let users = {};
wss.on("connection", (client) => {
  client.on("message", (data) => {
    msg = JSON.parse(data);
    if (msg.to == "SERVER") {
      for_server(client, msg);
    }
    if (msg.to == "CLIENT") {
      for_client(client, msg);
    }
    if (msg.to == "PROCTOR") {
      for_proctor(client, msg);
    }
  });
  client.on("close", () => {
    try {
      userid = client.credentials.user.id;
      exm_id = client.credentials.exam;
      con = users[exm_id][userid];
      delete users[exm_id][userid];
      if (users[exm_id].PROCTOR) {
        proctor_conn = users[exm_id].PROCTOR;
        newpayload = {
          type: "STUDENTDISCONNECTED",
          student_conn: con,
        };
        proctor_conn.send(JSON.stringify(newpayload));
      }
      console.log(userid + " Disconnected");
    } catch (err) {
      console.log(err);
    }
  });
  client.on("error", (err) => {
    client.close();
    log("Oops ! something wrong happened");
  });
});

const for_server = (client, payload) => {
  user = payload.user;
  exam = payload.exam;
  if (!users[exam]) {
    users[exam] = {};
  }
  if (payload.type == "STUDENTJOIN") {
    if (!users[exam][user.id]) {
      wsObj = client;
      wsObj.credentials = {
        user: user,
        exam: exam,
      };
      users[exam][user.id] = wsObj;
      log(user.id + "Joined");
      if (users[exam].PROCTOR) {
        proctorWsObj = users[exam].PROCTOR;
        joinPayload = {
          type: "STUDENTJOINED",
          student_conn: client,
          data: payload,
        };
        proctorWsObj.send(JSON.stringify(joinPayload));
        client.send(
          JSON.stringify({
            type: "MAKEOFFER",
          })
        );
      }
      //  console.table(users[exam][user.id].credentials)
    } else {
      client.close();
    }
  } else if (payload.type == "PROCTORJOIN") {
    if (!users[exam].PROCTOR) {
      wsObj = client;
      wsObj.credentials = {
        user: user,
        exam: exam,
      };
      users[exam][user.id] = wsObj;
      log("Proctor Joined");
      Object.keys(users[exam]).forEach(function (student) {
        if (student != "PROCTOR") {
          var sclient = users[exam][student];
          joinPayload = {
            type: "STUDENTJOINED",
            student_conn: sclient,
            data: payload,
          };
          client.send(JSON.stringify(joinPayload));
          sclient.send(
            JSON.stringify({
              type: "MAKEOFFER",
            })
          );
        }
      });
      // console.table(users[exam][user.id].credentials)
    } else {
      log("Proctor is already present from somewhere else");
      client.close();
    }
  }
};
const for_proctor = (client, payload) => {
  if (payload.type == "OFFER") {
    exm_id = payload.exam;
    if (users[exm_id].PROCTOR) {
      proctor_conn = users[exm_id].PROCTOR;
      proctor_conn.send(JSON.stringify(payload));
    }
  }
  if (payload.type == "NEWICE") {
    exm_id = payload.user.exam_id;
    if (users[exm_id].PROCTOR) {
      proctor_conn = users[exm_id].PROCTOR;
      proctor_conn.send(JSON.stringify(payload));
    }
  }
};

function for_client(connection, message) {
  console.log("Recieved a msg to client .Type : ", message.type);
  payload = message;
  if (payload.type == "NEWICE") {
    exm_id = payload.user.exam;
    student = payload.student;
    if (users[exm_id][student]) {
      student_conn = users[exm_id][student];
      student_conn.send(JSON.stringify(payload));
    }
  }
  if (payload.type == "ANSWER") {
    exm_id = payload.exam;
    if (users[payload.exam][payload.user.id]) {
      client_conn = users[payload.exam][payload.user.id];
      client_conn.send(JSON.stringify(payload));
      console.log("ANSWER TO CLIENT" + client_conn.credentials.user.id);
    }
  }
}
