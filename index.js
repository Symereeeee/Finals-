
const express  = require('express')
const app = express()
const port = 4000
app.use(express.json())

let users = [
    {
      email: "sample@gmail.com",
      password: "sample1234",
      isAdmin: true
    },
    {
      email: "generic@yahoo.com",
      password: "generic4321",
      isAdmin: true
    }
  ];
  
  let cars = [
    {
      name: "Tesla Model S",
      description: "Luxury electric sedan",
      price: 80000,
      isActive: true,
      createdOn: "2023-06-22"
    },
    {
      name: "Toyota Camry",
      description: "Reliable mid-size sedan",
      price: 30000,
      isActive: true,
      createdOn: "2023-06-20"
    },
    {
      name: "Honda CR-V",
      description: "Compact SUV",
      price: 35000,
      isActive: false,
      createdOn: "2023-06-18"
    },
    {
      name: "Ford Mustang",
      description: "Iconic sports car",
      price: 50000,
      isActive: false,
      createdOn: "2023-06-14"
    }
  ];
  
  let loggedUser;
  let orders = [];
  
  app.post('/users', (req, res) => {
    console.log(req.body);
    let newUser = {
      email: req.body.email,
      password: req.body.password,
      isAdmin: req.body.isAdmin || false
    };
  
    const locateUser = users.find(user => user.email === req.body.email);
    if (locateUser) {
      res.status(400).send('Another user with the same email already exists. Please try again.');
      return;
    }
  
    users.push(newUser);
    console.log(users);
    res.send('Thank you for registering.');
  });
  
  app.post('/users/login', (req, res) => {
    console.log(req.body);
  
    let findUser = users.find((user) => {
      return user.email === req.body.email;
    });
  
    if (findUser) {
      let findUserIndex = users.findIndex((user) => {
        return user.email === findUser.email;
      });
      findUser.index = findUserIndex;
      loggedUser = findUser;
      console.log(loggedUser);
      res.send('Thank you for logging in.');
    } else {
      loggedUser = findUser;
      res.send('Login failed due to wrong credentials.');
    }
  });
  
  const checkLoggedIn = (req, res, next) => {
    if (loggedUser) {
      next();
    } else {
      res.status(401).send('Unauthorized access. Please login.');
    }
  };
  
  app.put('/users/admin/:index', checkLoggedIn, (req, res) => {
    console.log(req.params);
    console.log(req.params.index);
    let userIndex = parseInt(req.params.index);
  
    if (loggedUser.isAdmin === true) {
      users[userIndex].isAdmin = true;
      console.log(users[userIndex]);
      res.send('User is now an admin.');
    } else {
      res.send('Unauthorized access. Action is forbidden.');
    }
  });
  
  app.post('/cars', checkLoggedIn, (req, res) => {
    console.log(req.body);
  
    if (loggedUser.isAdmin === true) {
      let newCar = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        isActive: req.body.isActive || true,
        createdOn: req.body.createdOn || new Date()
      };
  
      cars.push(newCar);
      console.log(cars);
      res.send('You have added a new car.');
    } else {
      res.send('Unauthorized access. Action is forbidden.');
    }
  });
  
  app.get('/cars', checkLoggedIn, (req, res) => {
    console.log(loggedUser);
    res.send(cars);
  });
  
  app.get('/cars/active', checkLoggedIn, (req, res) => {
    const activeCars = cars.filter(car => car.isActive === true);
    res.send(activeCars);
  });
  
  app.get('/cars/:index', checkLoggedIn, (req, res) => {
    console.log(req.params);
    console.log(req.params.index);
    let index = parseInt(req.params.index);
    let car = cars[index];
    res.send(car);
  });
  
  app.put('/cars/archive/:index', checkLoggedIn, (req, res) => {
    console.log(req.params);
    console.log(req.params.index);
    let carIndex = parseInt(req.params.index);
    if (loggedUser.isAdmin === true) {
      cars[carIndex].isActive = false;
      console.log(cars[carIndex]);
      res.send('Car archived.');
    } else {
      res.send('Unauthorized access. Action is forbidden.');
    }
  });
  
  app.put('/cars/info/:index', checkLoggedIn, (req, res) => {
    if (loggedUser.isAdmin === true) {
      console.log(req.params);
      console.log(req.params.index);
      let carIndex = parseInt(req.params.index);
  
      if (carIndex < 0 || carIndex >= cars.length) {
        res.status(404).send('Car not found.');
        return;
      }
  
      cars[carIndex].description = req.body.description;
      console.log(cars[carIndex]);
      res.send('Car description updated.');
    } else {
      res.send('Unauthorized access. Action is forbidden.');
    }
  });
  
  app.post('/order', (req, res) => {
    if (loggedUser.isAdmin === true) {
      console.log(req.body);
      const selectedCar = req.body.car;
      const match = cars.find(car => car.name.toLowerCase().includes(selectedCar.toLowerCase()));
  
      if (!match) {
        res.status(400).send('Invalid car.');
        return;
      } else if (!match.isActive) {
        res.status(400).send('Selected car is inactive and cannot be added to the order.');
        return;
      }
  
      let newOrder = {
        emailId: loggedUser.email,
        car: match,
        price: match.price,
        quantity: req.body.quantity,
        purchased: req.body.purchased || new Date()
      };
  
      orders.push(newOrder);
      console.log(orders);
  
      res.send('You have created an order.');
    } else {
      res.send('Unauthorized access. Action is forbidden.');
    }
  });
  
  app.get('/order/cars', (req, res) => {
    if (loggedUser) {
      const userOrders = orders.filter(order => order.emailId === loggedUser.email);
      const userCars = userOrders.flatMap(order => {
        return {
          ...order.car,
          quantity: order.quantity
        };
      });
  
      console.log(userCars);
      res.send(userCars);
    } else {
      res.send('Unauthorized access. Please login.');
    }
  });
  
  app.put('/order/update/:index', (req, res) => {
    if (loggedUser) {
      const orderIndex = parseInt(req.params.index);
  
      if (orderIndex < 0 || orderIndex >= orders.length) {
        res.status(404).send('Order not found.');
        return;
      }
  
      orders[orderIndex].quantity = req.body.quantity;
  
      res.send('Product quantity updated.');
    } else {
      res.status(401).send('Unauthorized access. Please login.');
    }
  });
  
  app.delete('/order/remove/:index', (req, res) => {
    if (loggedUser) {
      const orderIndex = parseInt(req.params.index);
      const userOrders = orders.filter(order => order.emailId === loggedUser.email);
  
      if (orderIndex < 0 || orderIndex >= userOrders.length) {
        res.status(404).send('Order not found.');
        return;
      }
  
      userOrders[orderIndex].products.splice(orderIndex, 1);
      res.send('Product removed from the order.');
    } else {
      res.status(401).send('Unauthorized access. Please login.');
    }
  });
  
  app.get('/order/total', (req, res) => {
    let total = 0;
    if (loggedUser) {
      const userOrders = orders.filter(order => order.emailId === loggedUser.email);
      userOrders.forEach(order => {
        total += order.car.price * order.quantity;
      });
      res.send(`Total price for all cars in the order: $${total.toFixed(2)}`);
    } else {
      res.status(401).send('Unauthorized access. Please login.');
    }
  });
  
  app.get('/order/allOrders', (req, res) => {
    console.log(req.body);
    if (loggedUser.isAdmin === true) {
      res.send(orders);
    } else {
      res.send('Unauthorized access. Action is forbidden.');
    }
  });
  
  // error handling
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
  });
  
    app.listen(port, () => console.log(`Server is running at port ${port}`))