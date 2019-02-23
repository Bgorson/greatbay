var inquirer = require("inquirer")
var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "fenrir32",
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
      console.log("Ryan and Mike's code here")
    }
    if (response.userAction == "Bid") {
      connection.connect(function (err) {
        if (err) throw err;
        console.log("connected as id " + connection.threadId + "\n");

        viewItems();

      });
    }
  })



function viewItems() {
  connection.query("SELECT * FROM items", function (err, res) {
    if (err) throw err;
    var itemArray = [];
    console.log("this is res" + res[0].item_name)
    for (i = 0; i < res.length; i++) {
      itemArray.push(res[i].item_name)
    }
    inquirer.prompt([{
      type: "list",
      message: "Here are all the items\n",
      choices: itemArray,
      name: "itemChoice"

    }]).then(function (response) {

      bidItems(response.itemChoice)
    })
  });
}
var highest;
var itemBid;
function bidItems(item) {
  itemBid=item
  connection.query("SELECT * FROM items WHERE?", {
    item_name : item
  }, function (err, res) {
    if (err) throw err;
    highest= parseInt(res[0].highest_bid)
    console.log("This should be highestBid"+ res[0].highest_bid);
  });

  console.log("You're bidding on " + item)
  inquirer.prompt([{
    type: "input",
    message: "how much do you want to bid?",
    name: "bid"
  }]).then(function (response) {
    if (parseInt(response.bid) > highest) {
      connection.query(
        "UPDATE items SET ? WHERE ?",
        [{
            highest_bid: highest
          },
          {
            item_name: itemBid
          }
        ],
        function (err, res) {
          console.log("You got the highest bid on" + res.item_name);
          // Call deleteProduct AFTER the UPDATE completes

        }
      );
    } else {
      console.log("Too low")
    }
    connection.end();
  })

}