
/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy. 
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: __Thi Huyen Nguyen____ Student ID: _129494225____ Date: _June 16 2023____
*
*  Online (Cyclic) Link: _____https://web322-assignment2.cyclic.app/about ________
*
********************************************************************************/ 

var express = require ("express");
const path = require ("path");
const data = require("./store-service");
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
app.engine('.hbs', exphbs({ extname: '.hbs' }));
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

//welcome message
function onHTTPSTART(){
    console.log("Express http server listening on: " + HTTP_PORT);
}

//A4
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    app.locals.viewingAbout = req.query.about;
    app.locals.viewingItems = req.query.item;
    app.locals.viewingAddItem = req.query.about && req.query.about.additem;
    next();
  });

navLink: function Helper (url, options){
    return(
        '<li class="nav-item"><a' +
        (url== app.locals.activeRoute ? 'class="nav-link active"': ' class="nav-link" ') +
        ' href="' +
        url + 
        '">'+
        options.fn(this) + 
        "</a></li>"
    );
};
    equal: function Helper (lvalue, rvalue, options) {
        if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    
};  
//set up route to my about page
app.get('/about',(req,res)=>{
    res.render('about');
});

//shop route
app.get("/shop",(req,res)=>{
    data.getPublishedItems().then((data)=>{
        res.json(data);
    })
    .catch((error)=>{
        res.status(500).json({massage:error});
    })
});

//A3
//set up route to addItem page
app.get('/items/add',(req,res)=>{
    res.render('addItem');
});

//Items route updated
app.get("/items", (req, res) => {
    if (req.query.category) {
      const category = parseInt(req.query.category);
      data.getItemsByCategory(category)
        .then((data) => {
          res.render("items", { items: data, layout: false });
        })
        .catch((error) => {
          res.render("items", { message: "no results" });
        });
    } else if (req.query.minDate) {
      const minDateStr = req.query.minDate;
      data.getItemsByMinDate(minDateStr)
        .then((data) => {
          res.render("items", { items: data, layout: false });
        })
        .catch((error) => {
          res.render("items", { message: "no results" });
        });
    } else {
      data.getAllItems()
        .then((data) => {
          res.render("items", { items: data, layout: false });
        })
        .catch((error) => {
          res.render("items", { message: "no results" });
        });
    }
  });
  

app.get("/item/:id",(req, res)=>{
    data.getItemById(req.params.id)
    .then((data)=>{
        res.json(data);
    })
    .catch((error) => {
        res.status(500).json({message: error});
    })
})

/

//Categories route
app.get("/categories", (req,res)=>{
    data.getCategories().then((data)=>{
        res.json(data);
    })
    .catch((error)=>{
        res.status(500).json({massage:error});
    })
});

//A3
app.post('/items/add', upload.single('featureImage'), (req, res)=>{
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
        const itemData = {
            id: req.body.id,
            category: req.body.category,
            postDate: req.body.postDate,
            featureImage: req.body.featureImage,
            price: req.body.price,
            title: req.body.title,
            body: req.body.body,
            published: req.body.published || false,
        };

        data.addItem(itemData).then (()=>{
            res.redirect("/items");
        })      
        .catch((error)=>{
            res.status(500).send("Unable to add item: " + error);
        });
        
    } 
    
});
 


// 404 error handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
  });


  
  

//app.listen(HTTP_PORT,onHTTPSTART);
data.initialize().then(function(){
      app.listen(HTTP_PORT,onHTTPSTART);
}).catch(function(err){
  console.log("Unable to start server:" + err);
})
