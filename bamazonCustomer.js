const inquirer = require('inquirer');
const mysql = require('mysql');

const productArray = [];

// create a connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'bamazon',
});

connect();

// open connection
function connect() {
  if (connection.state === 'disconnected') {
    connection.connect((err) => {
      if (err) throw err;
    });
  }
  display();
}

function display() {
  connection.query('SELECT * FROM products', (err, result) => {
    if (err) throw err;
    result.forEach((element) => {
      console.log(`${element.id}. ${element.name} $${element.price}`);
      productArray.push(JSON.parse(JSON.stringify(element)));
    });
    prompt();
  });
}

// update the store on purchase
function updateStore(numPurchased, selectedId) {
  connection.query(`UPDATE products SET quantity = quantity - ${numPurchased} WHERE id =${selectedId}`, (err, result) => {
    if (err) throw err;
  });
}

// show messages
function prompt() {
  inquirer
    .prompt([{
      name: 'id',
      message: 'What is the id of the product you would like to buy?',
    },
    {
      name: 'amount',
      message: 'How many would you like to buy?',
    },

    ])
    .then((answers) => {
      for (let i = 0; i < productArray.length; i++) {
        if (parseInt(answers.id, 0) === productArray[i].id) {
          if (answers.amount <= productArray[i].quantity) {
            console.log('------------------------');
            console.log('Order Processed!');
            console.log(`You bought ${answers.amount} ${productArray[i].name} at ${productArray[i].price}`);
            console.log(`Your total was ${productArray[i].price * parseFloat(answers.amount).toFixed(0)}`);
            console.log('------------------------');
            updateStore(answers.amount, answers.id);
            restart();
          } else {
            console.log('------------------------');
            console.log('Insufficient quantity!');
            console.log('------------------------');
            restart();
            return;
          }
        }
      }
    });
}

function restart() {
  inquirer.prompt([{
    name: 'restart',
    type: 'list',
    message: 'Would you like to buy something else?',
    choices: ['Yes', 'No'],
  }]).then((answers) => {
    process.stdout.write('\033c');
    if (answers.restart === 'Yes') {
      connect();
    } else {
      process.exit();
      connection.end();
    }
  });
}
