const expect = require("expect");
const { Users } = require("./users");

var users;

describe("Users", () => {
  beforeEach(() => {
    users = new Users();
    users.users = [
      {
        id: "1",
        name: "user1",
        room: "room1"
      },
      {
        id: "2",
        name: "user2",
        room: "room2"
      },
      {
        id: "3",
        name: "user3",
        room: "room2"
      }
    ];
  });

  it("should add new user", () => {
    var users = new Users();
    var user = {
      id: "123",
      name: "name",
      room: "room"
    };
    var resUser = users.addUser(user.id, user.name, user.room);
    expect(users.users).toEqual([user]);
  });

  it("should remove a user", () => {
    var updatedUsers = users.removeUser("1");
    expect(updatedUsers).toEqual([
      {
        id: "2",
        name: "user2",
        room: "room2"
      },
      {
        id: "3",
        name: "user3",
        room: "room2"
      }
    ]);
  });

  it("should return a user", () => {
    var user = users.getUser("1");
    expect(user).toBe(users.users[0]);
  });

  it("should return names for room2", () => {
    var userList = users.getUserList("room2");
    expect(userList).toEqual(["user2", "user3"]);
  });
});
