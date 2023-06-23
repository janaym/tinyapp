const express = require('express');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  // declare all characters
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  
  let result = Array(6);
  for(let i = 0; i < 6; i++) {
    result[i] = characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result.join('');
};

app.get("/", (req, res) => {
  res.send("Hello");
});

// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

app.get('/urls/:id',  (req, res) => {
  const id = req.params.id
  const templateVars = { id, longURL: urlDatabase[id] };

  res.render('urls_show', templateVars)
});

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();

  urlDatabase[id] = longURL;
  
  res.redirect(`urls/${id}`)
})

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
})



// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n")
// });

app.listen(PORT, () => {
console.log(`Example app listening on port ${PORT}!`);
});

