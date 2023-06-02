var express = require ("express");
const path = require ("path");
const data = require("./store-service");
var app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

//welcome message
function onHTTPSTART(){
    console.log("Express http server listening on: " + HTTP_PORT);
}
//set up route to my about page
app.get("/about",(req,res)=>{
    res.sendFile(path.join(__dirname,"/views/about.html"));
});


app.get("/shop",(req,res)=>{
    data.getPublishedItems().then((data)=>{
        res.json(data);
    })
    .catch((error)=>{
        res.status(500).json({massage:error});
    })
});

app.get("/items",(req,res)=>{
    data.getAllItems().then((data)=>{
        res.json(data);
    })
    .catch((error)=>{
        res.status(500).json({massage:error});
    })
});

app.get("/categories", (req,res)=>{
    data.getCategories().then((data)=>{
        res.json(data);
    })
    .catch((error)=>{
        res.status(500).json({massage:error});
    })
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
