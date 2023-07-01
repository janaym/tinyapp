const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js')

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe("getUserByEmail", () => {
  it("should return a user with a vaild email", () => {
    const user = getUserByEmail('user@example.com', testUsers).id;
    const expectedUserID = 'userRandomID';
    assert.equal(user, expectedUserID);
  });
  it("should return undefined if passed an email that is not in the database", () => {
    const user = getUserByEmail('notanemail@gmail.com', testUsers);
    assert.isUndefined(user);
  })
  
})