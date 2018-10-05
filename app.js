var express = require("express"),
  mongoose = require("mongoose"),
  bodyParser = require("body-parser"),
  passport = require("passport"),
  localStrategy = require("passport-local"),
  User = require("./models/user");
var app = express();

var request = require("request");

app.use(
  require("express-session")({
    secret: "I'm nikhil",
    resave: false,
    saveUninitialized: false
  })
);

// mongoose.connect("mongodb://localhost/MusikUserDB");
mongoose.connect(
  "mongodb://nikhilyadav:Nikkhsssp1@ds149742.mlab.com:49742/nikmusik"
);
// mongodb://nikhilyadav:Nikkhsssp1@@ds149742.mlab.com:49742/nikmusik
global["data"];
console.log(global["data"]);

console.log(global);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
  request(
    "http://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=4805952fc67479eac7e65e3dff46536f&format=json",
    function(er, re, body) {
      if (!er && res.statusCode == 200) {
        global.data = JSON.parse(body);
        console.log(global.data);
        res.render("index", { data: global.data, currentUser: req.user });
      } else {
        console.log(er);
      }
    }
  );
  console.log(global.data);
});
app.get("/contact", function(req, res) {
  res.render("contact");
});
app.get("/all", function(req, res) {
  var data;
  request(
    "http://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=4805952fc67479eac7e65e3dff46536f&format=json",
    function(er, response, body) {
      if (!er && res.statusCode == 200) {
        data = JSON.parse(body);
        res.render("all", { data: data });
        // name = data.results.trackmatches.track[0].name;
        // url = data.results.trackmatches.track[0].url;
      } else {
        console.log(er);
      }
    }
  );
});
app.get("/secret", function(req, res) {
  res.render("secret");
});

app.get("/results", function(req, res) {
  var song1 = req.query.song;

  var song =
    "http://ws.audioscrobbler.com/2.0/?method=track.search&track=" +
    song1 +
    "&api_key=4805952fc67479eac7e65e3dff46536f&format=json";
  var name;
  var url;
  request(song, function(er, response, body) {
    if (!er && res.statusCode == 200) {
      var data = JSON.parse(body);
      res.render("results", { data: data });
      // name = data.results.trackmatches.track[0].name;
      // url = data.results.trackmatches.track[0].url;
    } else {
      console.log(er);
    }
  });
});

app.get("/register", function(req, res) {
  res.render("register");
});
app.post("/register", function(req, res) {
  var newUser = new User({ username: req.body.username });
  req.body.username;
  req.body.password;
  User.register(newUser, req.body.password, function(er, user) {
    if (er) {
      console.log(er);
      return res.render("register");
    }
    passport.authenticate("local")(req, res, function() {
      res.redirect("/");
    });
  });
});
app.get("/login", function(req, res) {
  res.render("login");
});
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
  }),
  function(req, res) {}
);
app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("login");
}

app.listen(9000, function() {
  console.log("server is on");
});
