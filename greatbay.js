var inquirer = require("inquirer")
var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "greatbayDB"
});

inquirer.prompt([{
    type: "list",
    message: "Which do you want to do?",
    choices: ["Post", "Bid"],
    name: "userAction"
  }])
  .then(function (response) {
    if (response.userAction == 'Post') {
      postItems();
    }
    if (response.userAction == "Bid") {
      connection.connect(function (err) {
        if (err) throw err;
        console.log("connected as id " + connection.threadId + "\n");

        viewItems();

      });
    }
  })

var highest;
var itemBid;

function viewItems() {
  connection.query("SELECT * FROM items", function (err, res) {
    if (err) throw err;
    var itemArray = [];
    for (i = 0; i < res.length; i++) {
      itemArray.push(res[i].item_name)
    }
    inquirer.prompt([{
      type: "list",
      message: "Here are all the items\n",
      choices: itemArray,
      name: "itemChoice"

    }]).then(function (response) {
      itemBid= response.itemChoice
      highest= res[0].highest_bid
      console.log(highest)
      console.log("You picked "+ itemBid)

      bidItems(itemBid,highest)
    })
  });
}

function bidItems(item,itemHighest) {

  console.log("This should be highest Bid "+ itemHighest);
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
          }
        ],
        function (err, res) {
          console.log("You got the highest bid on" + item);
          // Call deleteProduct AFTER the UPDATE completes

        }
      );
    } else {
      console.log("Too low")
    }
    connection.end();
  })

}
function postItems() {
  inquirer.prompt([
    {
      type:"input",
      message:"What item do you want to list?",
      name: "name"
    },
    {
      type:"input",
      message:"What is the starting bid?",
      name: "bid"
    },
    {
    type:"input",
    message: "what category is this item in?",
    name: "category"
    }
  ]).then(function(response){
    createListing(response.category,response.name,response.bid)
})
}
function createListing(category,name,bid) {
  console.log("Inserting a new item...\n");
  connection.query(
    //replaces the ? with the object identified afterwards
    "INSERT INTO items SET ?",
    {
      item_name: name,
      category: category,
      highest_bid:bid,
      starting_bid:bid
    }
  );

  connection.end();
}