//setup server
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;


//set up ejs
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//database we will be using
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//database of users
const users = {};

const getUserByEmail = (email) => {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
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

  const currentUserID = req.cookies['user_id'];
  const currentUser = users[currentUserID];
  let templateVars = {
    user: currentUser,
    urls: urlDatabase,
  };
  


  res.render("urls_index", templateVars);
});

//page to create a new short url id
app.get("/urls/new", (req, res) => {

  const currentUserID = req.cookies['user_id'];
  const currentUser = users[currentUserID];

  let templateVars = { user: currentUser };

  console.log(templateVars);
  res.render("urls_new", templateVars);
});


//access the info for a specific short url id
app.get('/urls/:id',  (req, res) => {
  const currentUserID = req.cookies['user_id'];
  const currentUser = users[currentUserID];

  const id = req.params.id;
  let templateVars = {
    id,
    longURL: urlDatabase[id],
    user: currentUser
  };

  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {

  const currentUserID = req.cookies['user_id'];
  const currentUser = users[currentUserID];

  const templateVars = {user: currentUser};
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const currentUser = users[req.cookies['user_id']];
  const templateVars = { user: currentUser };
  res.render('login', templateVars);
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
  const email = req.body.email;
  const password = req.body.passowrd;
  const user = getUserByEmail(email);

  if (!user) {
    res.statusCode = 403;
    res.send("Error: User email not found");
  } else if (password !== user.password) {
    res.statusCode = 403;
    res.send("Error: Incorrect Password");
  } else {
    res.cookie('user_id', user.id);
  }
  
  res.redirect("/urls");
});

//handle post to /logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

//handle post to /register
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    res.statusCode = 400;
    res.send("Error: either email or password field are empty");
  } else if (getUserByEmail(email)) {
    res.statusCode = 400;
    res.send("Error: this email is already registered");
  } else {

    const id = generateRandomString();

    users[id] = {
      email,
      password,
      id
    };
  
    res.cookie('user_id', id);
    res.redirect("/urls");
  }


});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

