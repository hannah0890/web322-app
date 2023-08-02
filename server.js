
/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy. 
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: __Thi Huyen Nguyen____ Student ID: _129494225____ Date: _July 20 2023____
*
*  Online (Cyclic) Link: _____https://web322-assignment.cyclic.app/shop ________
*
********************************************************************************/ 

var express = require ("express");
const path = require ("path");
const store_service = require("./store-service");
//A6
const authData = require("./auth-service.js");
const clientSessions = require("client-sessions");
//A3
const bodyParser = require("body-parser");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
//A4
const exphbs = require('express-handlebars');

var app = express();

const HTTP_PORT = process.env.PORT || 8080;
//A4 
app.engine(".hbs", exphbs.engine({ 
    extname: ".hbs",
    helpers: {
        navLink: function (url, options){
        return(
            '<li class="nav-item"><a' +
            (url== app.locals.activeRoute ? 'class="nav-link active"': ' class="nav-link" ') +
            ' href="' +
            url + 
            '">'+
            options.fn(this) + 
            "</a></li>"
        );
    },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
      },
      //A5: add another helper: formatDate
      formatDate: function(dateObj){
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
      }
}
})
);

app.set('view engine', '.hbs');

//A3
cloudinary.config ({
    cloud_name: 'dsuuvz6hb',
    api_key: '723662371632512',
    api_secret: 'Kgua19_OxBtBM03VEddsLVoPI3o',
    secure: true

})

//A3
const upload = multer();


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
//A5: adding regular express.urlencode() middleware
app.use(express.urlencoded({extended: true}));

//A6: Setup client-sessions
app.use(clientSessions ({
  cookieName: "session",
  secret: "anything-random",
  duration: 2 * 60 * 1000,
  activeDuration: 1000 * 60
}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next){
  if(!req.session.user){
    res.redirect("/login");
  } else{
    next();
  }
}


//welcome message
function onHTTPSTART(){
    console.log("Express http server listening on: " + HTTP_PORT);
}

//A4
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) 
    ? route.replace(/\/(?!.*)/, "") 
    : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
  });

// Redirect "/" to "/shop"
app.get("/", (req, res) => {
    res.redirect("/shop");
  });

 
//set up route to my about page
app.get('/about',(req,res)=>{
    res.render("about");
});


//A4 shop route updated 
app.get("/shop", async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
  
    try {
      // declare empty array to hold "post" objects
      let items = [];
  
      // if there's a "category" query, filter the returned posts by category
      if (req.query.category) {
        // Obtain the published "posts" by category
        items = await store_service.getPublishedItemsByCategory(req.query.category);
      } else {
        // Obtain the published "items"
        items = await store_service.getPublishedItems();
      }
  
      // sort the published items by postDate
      items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
  
      // get the latest post from the front of the list (element 0)
      let item = items[0];
  
      // store the "items" and "post" data in the viewData object (to be passed to the view)
      viewData.items = items;
      viewData.item = item;
    } catch (err) {
      viewData.message = "no results";
    }
  
    try {
      // Obtain the full list of "categories"
      let categories = await store_service.getCategories();
  
      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
    } catch (err) {
      viewData.categoriesMessage = "no results";
    }
  
    // render the "shop" view with all of the data (viewData)
    res.render("shop", { data: viewData });
  });

//A4
app.get('/shop/:id', ensureLogin, async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};
  
    try{
  
        // declare empty array to hold "item" objects
        let items = [];
  
        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            items = await store_service.getPublishedItemsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            items = await store_service.getPublishedItems();
        }
  
        // sort the published items by postDate
        items.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
  
        // store the "items" and "item" data in the viewData object (to be passed to the view)
        viewData.items = items;
  
    }catch(err){
        viewData.message = "no results";
    }
  
    try{
        // Obtain the item by "id"
        viewData.item = await store_service.getItemById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }
  
    try{
        // Obtain the full list of "categories"
        let categories = await store_service.getCategories();
  
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
  
    // render the "shop" view with all of the data (viewData)
    res.render("shop", {data: viewData})
  });

//Items route updated
app.get("/items", ensureLogin, (req, res)=> {
    if (req.query.category) {
      const category = req.query.category;
    store_service.getItemsByCategory(category)
        .then((data) => {
         if (data.length > 0) res.render("items", { items: data});
         else res.render ("items", { message: "no result" });
        })
        .catch((error) => {
          res.render("items", { message: "no results" });
        });
    } else if (req.query.minDate) {
      const minDateStr = req.query.minDate;
      store_service.getItemsByMinDate(minDateStr)
        .then((data) => {
          if (data.length > 0) res.render("items", { items: data});
         else res.render ("items", { message: "no result" });
        })
        .catch((error) => {
          res.render("items", { message: "no results" });
        });
    } else {
      store_service.getAllItems()
        .then((data) => {
          if (data.length > 0) res.render("items", { items: data});
         else res.render ("items", { message: "no result" });
        })
        .catch((error) => {
          res.render("items", { message: "no results" });
        });
    }
  });
  

app.get("/item/:id",(req, res)=>{
    store_service.getItemById(req.params.id)
    .then((data)=>{
        res.json(data);
    })
    .catch((error) => {
        res.status(500).json({message: error});
    })
})


app.get("/items/delete/:id", ensureLogin, (req,res) => {
  store_service.deleteItemById(req.params.id)
  .then(res.redirect("/items"))
  .catch((err)=>
  res.status(500).send("Unable to Remove Item / Item not found")
  );
})

//A5: set up another route to listen on "/item/add" route
app.get("/items/add", ensureLogin, (req,res)=>{
  store_service.getCategories()
  .then((data)=> res.render("addItem", {categories: data}))
  .catch((err)=> res.render("addItem", {categories: []}))
});

//A3
app.post('/items/add', ensureLogin,upload.single('featureImage'), (req, res)=>{
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processItem(uploaded.url);
        });
    }else{
        processItem("");
    }
     
    function processItem(imageUrl){
        req.body.featureImage = imageUrl;
         
        // TODO: Process the req.body and add it as a new Item before redirecting to /items
        store_service.addItem(req.body).then ((item)=>{
        res.redirect("/items");
        })      
        .catch((error)=>{
            res.status(500).send("Unable to add item: " + error);
        });
    } 
});

//A5: Categories route
app.get("/categories", ensureLogin, (req, res) => {
  store_service
    .getCategories()
    .then((data) => {
    if (data.length > 0) res.render("categories", { categories: data });
    else res.render("categories", { message: "no results" });
  })
  .catch((err) => {
    res.render("categories", { message: "no results" });
  });
});
// updating routes (server.js) to add / remove Categories & Posts
app.get("/categories/add", ensureLogin, (req, res) => {
  res.render("addCategory");
});

app.post("/categories/add", ensureLogin, (req, res) => {
  store_service.addCategory(req.body).then(() => {
    res.redirect("/categories");
  });
});

app.get("/categories/delete/:id", ensureLogin, (req, res) => {
  store_service
    .deleteCategoryById(req.params.id)
    .then(res.redirect("/categories"))
    .catch((err) =>
      res.status(500).send("Unable to Remove Category / Category not found")
  );
});

//A6 Get Login page route
app.get("/login", (req,res)=>{
  res.render("login");
})

//A6 Get Register page route
app.get("/register", (req,res)=>{
  res.render("register");
})

//A6 Post Login page route
app.post("/login", (req,res)=>{
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body)
  .then((user)=>{
    req.session.user = {
      userName: user.userName,
      email: user.email,
      loginHistory: user.loginHistory
    };
    res.redirect('/items');
  })
  .catch((err)=>{
    res.render('login', {errorMessage: err, userName: req.body.userName});
  });
})

//A6 Post Register page route
app.post("/register",(req,res) =>{
  authData.registerUser(req.body)
  .then(()=>{
    res.render('register', {successMessage: 'User created'});
  })
  .catch((err)=>{
    res.render('register', {errorMessage: err, userName: req.body.userName});
  });
})

//A6 Logout route
app.get("/logout",(req,res)=>{
  req.session.reset();
  res.redirect("/");
})

//A6 User History route
app.get("/userHistory", ensureLogin,(req,res) => {
  res.render("userHistory");
})

// 404 error handler
app.get('*', function(req, res){
    res.render("404");
  });

  app.use((req,res)=>{
    res.status(404).send("Page does not exist")
  })
  
//Update for A6 - app.listen(HTTP_PORT,onHTTPSTART);
store_service.initialize()
.then(authData.initialize)
  .then(function() {
    app.listen(HTTP_PORT, function(){
      console.log("app listening on: " + HTTP_PORT)
    });     
}).catch(function(err){
  console.log("Unable to start server:" + err);
});
