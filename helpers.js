//takes in email, returns user associated with email, or undefined if no such user exists
const getUserByEmail = (email, database) => {
  for (const id in database) {
    if (database[id].email === email) {
      return database[id];
    }
  }
};

//takes in user id, returns user associated with id, or undefined if no such user exits
const getUserById = (id, database) => {
  return database[id];
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

const urlsForUser = (userID, urlDatabase) => {
  let userUrls = {};
  
  for (const urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === userID) {
      userUrls[urlID] = urlDatabase[urlID];
    }
  }
  
  return userUrls;
};

const isValidUrl = (testUrl) => {
  try {
    new URL(testUrl);
    return true;
  } catch (err) {
    return false;
  }
}



module.exports = { 
  getUserByEmail,
  getUserById,
  urlsForUser,
  generateRandomString,
  isValidUrl
 };