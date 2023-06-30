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
const urlDatabase = {};

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

const urlsForUser = (userID) => {
  let userUrls = {};

  for (const urlID in urlDatabase) {

    if (urlDatabase[urlID].userID === userID) {
      userUrls[urlID] = urlDatabase[urlID];
    }
  }

  
  return userUrls;
}

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

  if (!currentUser) { 
    res.send(`<h3>Error:</h3>
    <p>you must be logged in to see this page. Login <a href='http://localhost:8080/login'>here</a></p>`);
  } else {
    let templateVars = {
      user: currentUser,
      urls: urlsForUser(currentUser.userID)
    };
    // console.log(templateVars.urls, "get user urls")
    res.render("urls_index", templateVars);
  }


});

//page with form to create new tinyURL
app.get("/urls/new", (req, res) => {

  const currentUser = getUserById(req.cookies['user_id']);

  if (!currentUser) {
    res.redirect('/login');
    res.end()
  }
  let templateVars = { user: currentUser };
  res.render("urls_new", templateVars);

  
});


//page to access the info for a specific short url id
app.get('/urls/:id',  (req, res) => {
  
  const currentUser = getUserById(req.cookies['user_id']);
  //console.log(currentUser)

  //not a problem when coming from the new url creator
  //is  not a problem when coming from the edit button or from redirect link in /urls:id page
  //is a problem when accessign directly (due to www.?)
  const id = req.params.id;
  
  if(!urlDatabase[id]) {
    res.send(`<h3>error</h3>
    <p>That id does not exist <a href='/urls'>Go Back</a></p>`)
  
  } else if (!currentUser) { 
    res.send(`<h3>Error:</h3>
    <p>you must be logged in to see this page. Login <a href='/login'>here</a></p>`);
  } else  if (currentUser.userID !== urlDatabase[id].userID) {
    res.send(`<h3>Error:</h3>
    <p>You are not the owner of this url, so you cannot access it. <a href='/urls'>Go back</a></p>`);
  } else {
    const longURL = urlDatabase[id].longURL
  
    //console.log(longURL)
  
    let templateVars = {
      id,
      longURL,
      user: currentUser
    };
  
    res.render('urls_show', templateVars);
  }
});

//page to register an account for tinyURL
app.get('/register', (req, res) => {
  const currentUser = getUserById(req.cookies['user_id']);

  if(currentUser) {
    res.redirect('/urls');
  } else {
    const templateVars = {user: currentUser};
    res.render('register', templateVars);
  }
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
  const currentUser = getUserById(req.cookies['user_id'])

  if (!currentUser) {
    res.send(`<h3>error</h3>
  <p>You must be logged in to create a new tinyUrl</p>`)
    res.end();
  }

  //create id: longURL pair
  const longURL = req.body.longURL;
  const id = generateRandomString();

  //store in database
  urlDatabase[id] = {
    id, longURL,
    userID: currentUser.userID};
  console.log("urlDatabase: ", urlDatabase)
  console.log('currentUser: ', currentUser)
  res.redirect(`urls/${id}`);
});



//handle longUrl update forms
app.post('/urls/:id', (req, res) => {

  const id = req.params.id;
  const currentUser = getUserById(req.cookies['user_id']);
  console.log("id is:", id)
  console.log('current user in /urls/:id post: ', currentUser)
  console.log("urlDatabase in /urls/:id post: ", urlDatabase)
  
  if(!urlDatabase[id]) {
    res.send(`<h3>error</h3>
  <p>That id does not exist <a href='/urls'>Go Back</a></p>`)

  } else if (!currentUser) {
    res.send(`<h3>error</h3>
  <p>You must be logged in to edit a tinyUrl. <a href='/urls'>Login</a></p>`)
  
  } else if(currentUser.userID !== urlDatabase[id].userID) {
    res.send(`<h3>Error:</h3>
    <p>You are not the owner of this url, so you cannot edit it. <a href='/urls'>Go back</a></p>`);
  
  } else {
    urlDatabase[id] = {
      id, 
      longURL: req.body.newLongURL,
      userID: currentUser.userID
    };
    console.log("urlDatabase after change: ", urlDatabase)

    res.redirect('/urls');
  }
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
    res.cookie('user_id', user.userID);
    res.redirect("/urls");
  }
});

//handle tinyURL delete form submissions
app.post('/urls/:id/delete', (req, res) => {

  const id = req.params.id
  const currentUser = getUserById(req.cookies['user_id']);
  console.log(currentUser)
  
  if(!urlDatabase[id]) {
    res.send(`<h3>error</h3>
  <p>That id does not exist <a href='/urls'>Go Back</a></p>`)

  } else if (!currentUser) {
    res.send(`<h3>error</h3>
  <p>You must be logged in to delete a tinyUrl. <a href='/urls'>Login</a></p>`)
  
  } else if(currentUser.userID !== urlDatabase[id].userID) {
    res.send(`<h3>Error:</h3>
    <p>You are not the owner of this url, so you cannot delete it. <a href='/urls'>Go back</a></p>`);
  
  } else {
    delete urlDatabase[id]
    res.redirect('/urls');
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
    res.end()
  }
  if (getUserByEmail(email)) {
    res.statusCode = 400;
    res.send("Error: this email is already registered");
    res.end()
  }

  const userID = generateRandomString();
  //console.log(userID)

  //update user database
  users[userID] = {
    email,
    password,
    userID
  };

  res.cookie('user_id', userID);
  res.redirect("/urls");
  
});
/*----------------------------------------------*/

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

