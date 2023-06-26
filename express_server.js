//setup server
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;
let username = "none";

//set up ejs
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//database we will be using
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Checks if login cookie is present. Returns username if so.
const checkLoginStatus = (req) => {
  if (req.cookies) {
    return req.cookies.username;
  }
  return;
};



/**
 * @returns a six character long random alphanumeric string
 */
const generateRandomString = () => {
  // declare all alphanumeric characters
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  let result = Array(6);
  //populate array with random characters
  for (let i = 0; i < 6; i++) {
    result[i] = characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result.join('');
};

//set homepage to say hello
app.get("/", (req, res) => {
  res.send("Hello");
});

//access url info in JSON format
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//show index of current urls in database
app.get('/urls', (req, res) => {
  let templateVars = {urls: urlDatabase};
  
  //check to see if logged in
  if (req.cookies) {
    templateVars.username = req.cookies['username'];
  }

  res.render("urls_index", templateVars);
});

//page to create a new short url id
app.get("/urls/new", (req, res) => {
  let templateVars = {};

  //check to see if logged in
  if (req.cookies) {
    templateVars.username = req.cookies['username'];
  }
  console.log(templateVars);
  res.render("urls_new", templateVars);
});


//access the info for a specific short url id
app.get('/urls/:id',  (req, res) => {
  const id = req.params.id;
  let templateVars = { id, longURL: urlDatabase[id] };

  //check to see if logged in
  if (req.cookies) {
    templateVars.username = req.cookies['username'];
  }

  res.render('urls_show', templateVars);
});

//redirect /u/:id paths to their respective long id
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//handle new short url request
app.post('/urls', (req, res) => {
  //create id: longURL pair
  const longURL = req.body.longURL;
  const id = generateRandomString();

  //store in database
  urlDatabase[id] = longURL;
  
  res.redirect(`urls/${id}`);
});

//handle delete form submissions
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];

  res.redirect('/urls');
});

//handle longurl update forms
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.newLongURL;
  res.redirect('/urls');
});

//handle post to /login
app.post('/login', (req, res) => {
  const input = req.body.username;
  res.cookie("username", input);
  
  res.redirect("/urls");
});

//handle post to /logout
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

