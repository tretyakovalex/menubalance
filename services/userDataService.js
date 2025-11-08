const UserData = require('../models/user'); // your UserData model

async function createUserData(userId) {
  if (!userId) throw new Error("User ID is required");

  const existingUserData = await UserData.findOne({ userId });
  if (existingUserData) {
    throw new Error("User data already exists");
  }

  const userData = new UserData({
    userId,
    menusByDay: [],
    shoppingList: []
  });

  await userData.save();
  return userData;
}

module.exports = { createUserData };