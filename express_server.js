//setup server
/*----------------------------------------------*/

const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/*----------------------------------------------*/


//data
/*----------------------------------------------*/

//tiny urls
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//users
const users = {};

/*----------------------------------------------*/


//helper functions
/*----------------------------------------------*/

//takes in email, returns user associated with email, or undefined if no such user exists
const getUserByEmail = (email) => {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
};

//takes in user id, returns user associated with id, or undefined if no such user exits
const getUserById = (id) => {
  return users[id];
};

//returns a randomly generated 6-character alphanumeric string
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

/*----------------------------------------------*/

// //set homepage to say hello
// app.get("/", (req, res) => {
//   res.send("Hello");
// });

// //access url info in JSON format
// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });


//Get Routes
/*----------------------------------------------*/

//pages shows index of current urls in database
app.get('/urls', (req, res) => {

  const currentUser = getUserById(req.cookies['user_id']);

  let templateVars = {
    user: currentUser,
    urls: urlDatabase,
  };

  res.render("urls_index", templateVars);
});

//page with form to create new tinyURL
app.get("/urls/new", (req, res) => {

  const currentUser = getUserById(req.cookies['user_id']);

  if (!currentUser) {
    res.redirect('/login');
  } else {
    let templateVars = { user: currentUser };
    res.render("urls_new", templateVars);
  }
  
});


//page to access the info for a specific short url id
app.get('/urls/:id',  (req, res) => {

  const currentUser = getUserById(req.cookies['user_id']);
  const id = req.params.id;

  let templateVars = {
    id,
    longURL: urlDatabase[id],
    user: currentUser
  };

  res.render('urls_show', templateVars);
});

//page to register an account for tinyURL
app.get('/register', (req, res) => {
  const currentUser = getUserById(req.cookies['user_id']);

  if(currentUser) {
    res.redirect('/urls');
    res.end()
  }

  const templateVars = {user: currentUser};
  res.render('register', templateVars);
  

});

//page to login to tinyURL account
app.get('/login', (req, res) => {
  const currentUser = getUserById(req.cookies['user_id'])

  if (currentUser) {
    res.redirect('/urls');
    res.end();
  }

  const templateVars = { user: currentUser };
  res.render('login', templateVars);
  
});

//redirect /u/:id paths to their respective long id
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];

  //check longURL exists in database
  if(!longURL) {
    res.send(`<h3>error</h3>
  <p>This tinyURL does not exist</p>`)
    res.end();
  }
  res.redirect(longURL);
});

/*----------------------------------------------*/

//Post routes
/*----------------------------------------------*/

//handle new short url request
app.post('/urls', (req, res) => {
  //check if logged in
  if (!getUserById(req.cookies['user_id'])) {
    res.send(`<h3>error</h3>
  <p>You must be logged in to create a new tinyUrl</p>`)
    res.end();
  }

  //create id: longURL pair
  const longURL = req.body.longURL;
  const id = generateRandomString();

  //store in database
  urlDatabase[id] = longURL;
  
  res.redirect(`urls/${id}`);
});

//handle tinyURL delete form submissions
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];

  res.redirect('/urls');
});

//handle longUrl update forms
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.newLongURL;

  res.redirect('/urls');
});

//handle login form submissions
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);

  //check email/password valid
  if (!user) {
    res.statusCode = 403;
    res.send("Error: User email not found");
  } else if (password !== user.password) {
    res.statusCode = 403;
    res.send("Error: Incorrect Password");
  } else {
    //all good.
    //set user id cookie and redirect to urls
    res.cookie('user_id', user.id);
    res.redirect("/urls");
  }
});

//handle logout request
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

//handle register form submission
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

    //update user database
    users[id] = {
      email,
      password,
      id
    };
  
    res.cookie('user_id', id);
    res.redirect("/urls");
  }
});
/*----------------------------------------------*/

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

