var express = require("express")
  , http = require("http")
  , app = express()
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , passport = require('passport')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
  
  
mongoose.connect(process.env.MONGOLAB_URI, function(err) {
  if (err) { throw err; }
});


/**
* Project schema
*/

var projectSchema = Schema({
    name: String
  , description: String
  , img: String
  , scm: String
  , scmUrl: String
  , url: String
  , tags: [String]
})
var Project = mongoose.model('Project', projectSchema);


/**
* Experiment schema
*/

var experimentSchema = Schema({
    title: String
  , description: String
  , scm: String
  , scmUrl: String
  , tags: [String]
})
var Experiment = mongoose.model('Experiment', experimentSchema);

/**
* User Schema
*/

var userSchema = new Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  username: { type: String, default: '' },
  provider: { type: String, default: '' },
  authToken: { type: String, default: '' },
  facebook: {},
  twitter: {},
  github: {},
  google: {}
})
var User = mongoose.model('User', userSchema);


app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'mypersonalwebsite' }));
app.use(passport.initialize());
app.use(passport.session());


// Passport sessions
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});


// use google strategy
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://iheb.khemissi.org/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({ 'google.id': profile.id }, function (err, user) {
        if (!user) {
            console.log('new google profile : %j', profile);
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            username: profile.username,
            provider: 'google',
            google: profile._json
          })
          user.save(function (err) {
            if (err) console.log(err);
            return done(err, user)
          })
        } else {
          return done(err, user)
        }
      })
    }
));


app.get("/", function(request, response) {
  response.render('index')
});

// Redirect the user to Google for authentication.  When complete, Google
// will redirect the user back to the application at
//     /auth/google/return
app.get('/auth/google', passport.authenticate('google'));

// Google will redirect the user to this URL after authentication.  Finish
// the process by verifying the assertion.  If valid, the user will be
// logged in.  Otherwise, authentication has failed.
app.get('/auth/google/callback', 
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                            'https://www.googleapis.com/auth/userinfo.email'] }));

app.get("*", function(request, response) {
  response.end("404!");
});

http.createServer(app).listen(process.env.PORT, process.env.IP);

console.log('Website online ...');