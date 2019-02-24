const inquirer = require("inquirer")
const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "greatbaydb"
});

function initialize(){
  console.log("*** Welcome to Greatbay! ***")
  inquirer.prompt([
    {
      type:"list",
      message:"Which would you like to do?",
      choices: ["Create a user","Login"],
      name: "selection"
  }
]).then(function(response){
  if (response.selection == "Login"){
    login();
  }
  if (response.selection == "Create a user"){
    accountCreate();
  }
})
}


function accountCreate(){
  inquirer.prompt([{
    type: "input",
    message: "What is your username?",
    name: "newUser"
  },
  {
  type:"password",
  message:"Enter your password",
  name: "newPassword"
  }
])
  .then(function (response) {
    connection.query(
      "INSERT INTO usernames SET ?", {
        userName: response.newUser,
        userPassword: response.newPassword
      }
    );
    console.log("Successfully added")
    login();
  })
  
}

function login(){
  inquirer.prompt([{
    type: "input",
    message: "What is your username?",
    name: "user"
  },
  {
  type:"password",
  message:"Enter your password",
  name: "password"
  }
])
  .then(function (response) {
    console.log(response.password + "pass")
    console.log(response.user + "user name")
    connection.query(
      "select userPassword from usernames WHERE ?", {
      userName: response.user
      },function (err, res){  
        try {          
        if (res[0].userPassword== response.password){
          console.log("Success!")
          loginSuccess(response.user)
        }
        else {
          console.log("Incorrect Password")
          login();
        }
      }

      catch(err){ console.log("That username does not exist")
      login();
    }
     
   
      })
  })
}

function loginSuccess(user) {
console.log("Hello "+ user)
inquirer.prompt([{
    type: "list",
    message: "Which do you want to do?",
    choices: ["Post", "Bid", "Remove", "Exit",],
    name: "userAction"
  }])
  .then(function (response) {
    if (response.userAction == 'Post') {
      console.log("connected as id " + connection.threadId + "\n");
      postItems(user);
    }
    if (response.userAction == "Bid") {
        console.log("connected as id " + connection.threadId + "\n");
        viewItems(user);
      };
    
    if (response.userAction == "Remove"){
      console.log("connected as id " + connection.threadId + "\n");
      deleteItems();
    }
    if (response.userAction == "Exit"){
      connection.end();
    }
  })
}
function viewItems(user) {
  connection.query("SELECT * FROM items", function (err, res) {
    if (err) throw err;
    
    inquirer.prompt([{
      type: "list",
      message: "Here are all the items\n",
      choices: function(){
        let itemArray = [];
        for (i = 0; i < res.length; i++) {
          itemArray.push(res[i].item_name)
        }
        return itemArray;
      },
      name: "itemChoice"

    }]).then(function (response) {
      console.log(response)
      connection.query("SELECT * FROM items WHERE?",{
        item_name: response.itemChoice
      }, function (err, res) {
        bidItems(response.itemChoice, res[0].highest_bid,user)
      })
    })
  });
}
function bidItems(item, itemHighest,user) {

  console.log("This should be highest Bid " + itemHighest);
  console.log("You're bidding on " + item)
  inquirer.prompt([{
    type: "input",
    message: "how much do you want to bid?",
    name: "bid"
  }]).then(function (response) {
    if (parseInt(response.bid) > itemHighest) {
      connection.query(
        "UPDATE items SET ? WHERE ?",
        [{
            highest_bid: response.bid
          },
          {
            item_name: item
          },
          {
          createdby:user
          }
        ],
        function (err, res) {
          console.log("You got the highest bid on " + item);
        }
      );
    } else {
      console.log("Too low")
    }
    connection.end();
  })

}
function postItems(user) {
  inquirer.prompt([{
      type: "input",
      message: "What item do you want to list?",
      name: "name"
    },
    {
      type: "input",
      message: "What is the starting bid?",
      name: "bid"
    },
    {
      type: "input",
      message: "what category is this item in?",
      name: "category"
    }
  ]).then(function (response) {
    createListing(response.category, response.name, response.bid,user)
  })
}
function createListing(category, name, bid,user) {
  console.log("Inserting a new item...\n");
  connection.query(
    "INSERT INTO items SET ?", {
      item_name: name,
      category: category,
      highest_bid: bid,
      starting_bid: bid,
      createdby:user      
    }
  );
  connection.end();
}
function deleteItems(){
  connection.query("SELECT * FROM items", function (err, res) {
    if (err) throw err;
    
    inquirer.prompt([{
      type: "list",
      message: "Here are all the items\n",
      choices: function(){
        let itemArray = [];
        for (i = 0; i < res.length; i++) {
          itemArray.push(res[i].item_name)
        }
        return itemArray;
      },
      name: "itemChoice"

    }]).then(function (response) {
      connection.query(
        "DELETE FROM items WHERE ?",
        {
        item_name: response.itemChoice
        }
      )
      console.log("Removed " + response.itemChoice)
      connection.end();
   
    })
  });
}



initialize();