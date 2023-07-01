//setup server
/*----------------------------------------------*/
const { getUserByEmail, getUserById, urlsForUser, generateRandomString } = require('./helpers.js');
const bcrypt = require('bcryptjs');
const express = require('express');
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['key1'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

/*----------------------------------------------*/


//data
/*----------------------------------------------*/

//tiny urls
const urlDatabase = {};

//users
const users = {};

/*----------------------------------------------*/



//Get Routes
/*----------------------------------------------*/

//pages shows index of current urls in database
app.get('/urls', (req, res) => {
  const currentUser = getUserById(req.session.user_id, users);

  if (!currentUser) {
    req.statusCode = 403;
    res.send(`<h3>Error 403 - Forbidden:</h3>
    <p>You must login to see this page. <a href='http://localhost:8080/login'>Login</a></p>`);
    return;
  }

  let templateVars = {
    user: currentUser,
    urls: urlsForUser(currentUser.userID, urlDatabase)
  };
  
  res.render("urls_index", templateVars);
});

//page with form to create new tinyURL
app.get("/urls/new", (req, res) => {
  const currentUser = getUserById(req.session.user_id, users);

  if (!currentUser) {
    res.redirect('/login');
    return;
  }

  let templateVars = { user: currentUser };
  res.render("urls_new", templateVars);
});


//page to access the info for a specific short url id
app.get('/urls/:id',  (req, res) => {
  const currentUser = getUserById(req.session.user_id, users);
  const id = req.params.id;
  
  if (!urlDatabase[id]) {
    res.statusCode = 404;
    res.send(`<h3>Error 404 - Not Found:</h3>
    <p>That id does not exist in our records. <a href='/urls'>Go Back</a></p>`);
    return;
  }

  if (!currentUser) {
    res.statusCode = 403;
    res.send(`<h3>Error 403 - Forbidden:</h3>
    <p>You must login to see this page. <a href='/login'>Login</a></p>`);
    return;
  }
  
  if (currentUser.userID !== urlDatabase[id].userID) {
    res.statusCode = 403;
    res.send(`<h3>Error 403 - Forbidden:</h3>
    <p>You are not the owner of this url, so you cannot access it. <a href='/urls'>Go back</a></p>`);
    return;
  }
  
  const longURL = urlDatabase[id].longURL;

  let templateVars = {
    id,
    longURL,
    user: currentUser
  };

  res.render('urls_show', templateVars);
});

//page to register an account for tinyURL
app.get('/register', (req, res) => {
  const currentUser = getUserById(req.session.user_id, users);

  //if already logged in:
  if (currentUser) {
    res.redirect('/urls');
    return;
  }

  const templateVars = {user: currentUser};
  res.render('register', templateVars);
});

//page to login to tinyURL account
app.get('/login', (req, res) => {
  const currentUser = getUserById(req.session.user_id, users);

  //if already logged in:
  if (currentUser) {
    res.redirect('/urls');
    return;
  }

  const templateVars = { user: currentUser };
  res.render('login', templateVars);
});

//redirect /u/:id paths to their respective long id
app.get('/u/:id', (req, res) => {
  //check longURL exists in database
  const longURL = urlDatabase[req.params.id];

  if (!longURL) {
    res.statusCode = 404;
    res.send(`<h3>Error 404 - Not Found</h3>
  <p>This tinyURL does not exist</p>`);
    return;
  }

  res.redirect(longURL);
});

/*----------------------------------------------*/

//Post routes
/*----------------------------------------------*/

//handle new short url request
app.post('/urls', (req, res) => {
  const currentUser = getUserById(req.session.user_id, users);

  if (!currentUser) {
    res.statusCode = 403;
    res.send(`<h3>Error 403 - Forbidden:</h3>
  <p>You must be logged in to create a new tinyUrl. <a href='http://localhost:8080/login'>Login</a></p>`);
    return;
  }

  //create id: longURL pair
  const longURL = req.body.longURL;
  const id = generateRandomString();

  //store in database
  urlDatabase[id] = {
    id, longURL,
    userID: currentUser.userID
  };

  res.redirect(`urls/${id}`);
});



//handle longUrl update forms
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const currentUser = getUserById(req.session.user_id, users);
  
  if (!urlDatabase[id]) {
    res.statusCode = 404;
    res.send(`<h3>Error 404 - Not Found:</h3>
  <p>That id does not exist <a href='/urls'>Go Back</a></p>`);
    return;
  }

  if (!currentUser) {
    res.statusCode = 403;
    res.send(`<h3>Error 403 - Forbidden:</h3>
  <p>You must be logged in to edit a tinyUrl. <a href='/urls'>Login</a></p>`);
    return;
  }
  
  if (currentUser.userID !== urlDatabase[id].userID) {
    res.statusCode = 403;
    res.send(`<h3>Error 403 - Forbidden:</h3>
    <p>You are not the owner of this url, so you cannot edit it. <a href='/urls'>Go back</a></p>`);
    return;
  }

  urlDatabase[id] = {
    id,
    longURL: req.body.newLongURL,
    userID: currentUser.userID
  };
  
  res.redirect('/urls');
});

//handle login form submissions
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (!user) {
    res.statusCode = 404;
    res.send(`<h3>Error 404 - Not Found:</h3>
  <p>Email not associated with a TinyApp account. <a href='/login'>Try Again</a></p>`);
    return;
  }
  
  if (!bcrypt.compareSync(password, user.encPassword)) {
    res.statusCode = 403;
    res.send(`<h3>Error 403 - Forbidden:</h3>
  <p>Incorrect password. <a href='/login'>Try Again</a></p>`);
    return;
  }

  //all good.
  //set user id cookie and redirect to urls
  req.session.user_id = user.userID;
  res.redirect("/urls");
});

//handle tinyURL delete form submissions
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const currentUser = getUserById(req.session.user_id, users);
  console.log(currentUser);
  
  if (!urlDatabase[id]) {
    res.statusCode = 404;
    res.send(`<h3>Error 404 - Not Found:</h3>
  <p>That id does not exist <a href='/urls'>Go Back</a></p>`);
    return;
  }
  
  if (!currentUser) {
    res.statusCode = 403;
    res.send(`<h3>Error 403 - Forbidden:</h3>
  <p>You must be logged in to delete a tinyUrl. <a href='/urls'>Login</a></p>`);
    return;
  }
  
  if (currentUser.userID !== urlDatabase[id].userID) {
    res.statusCode = 403;
    res.send(`<h3>Error 403 - Forbidden:</h3>
    <p>You are not the owner of this url, so you cannot delete it. <a href='/urls'>Go back</a></p>`);
  
  }

  delete urlDatabase[id];
  res.redirect('/urls');
});

//handle logout request
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//handle register form submission
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    res.statusCode = 400;
    res.send(`<h3>Error 400 - Bad Response:</h3>
    <p>Email or Password field left incomplete. <a href='/register'>Try Again</a></p>`);
    return;
  }
  
  if (getUserByEmail(email, users)) {
    res.statusCode = 400;
    res.send(`<h3>Error 400 - Bad Response:</h3>
    <p>Email already associated with account. <a href='/register'>Try Again</a></p>`);
    return;
  }

  const encPassword = bcrypt.hashSync(password, 10);
  const userID = generateRandomString();

  //update user database
  users[userID] = {
    email,
    encPassword,
    userID
  };

  req.session.user_id = userID;
  res.redirect("/urls");
});

/*----------------------------------------------*/

//initialize server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

