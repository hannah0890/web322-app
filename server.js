
/*********************************************************************************
*  WEB322 – Assignment 02
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

var app = express();

const HTTP_PORT = process.env.PORT || 8080;
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
//set up route to my about page
app.get("/about",(req,res)=>{
    res.sendFile(path.join(__dirname,"/views/about.html"));
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
app.get("/items/add",(req,res)=>{
    res.sendFile(path.join(__dirname,"/views/addItem.html"));
});

//Items route
app.get("/items",(req,res)=>{
    if(req.query.category){
        const category = parseInt(req.query.category);
        data.getItemsByCategory (category)
        .then((data)=>{
            res.json(data);
        })
        .catch ((error)=>{
            res.status(500).json({message: error});
        });
    }
    else if (req.query.minDate){
        const minDateStr = req.query.minDate;
        data.getItemsByMinDate(minDateStr)
        .then((data)=>{
            res.json(data);
        })
        .catch ((error)=>{
            res.status(500).json({message: error});
        })
    }
    else{
        data.getAllItems().then((data)=>{
            res.json(data);
        })
        .catch((error)=>{
            res.status(500).json({massage:error});
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
