//takes in email, returns user associated with email, or undefined if no such user exists
const getUserByEmail = (email, database) => {
  for (const id in database) {
    if (database[id].email === email) {
      return database[id];
    }
  }
};

module.exports = { getUserByEmail };