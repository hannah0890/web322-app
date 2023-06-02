const fs = require("fs");
let items = [];
let categories =[];

module.exports.initialize = function(){
    return new Promise((resolve,reject)=>{
        fs.readFile('./data/items.json',(err,data)=>{
            if(err){
                reject(err);
            }else{
                items = JSON.parse(data);
                fs.readFile('./data/categories.json',(err,data)=>{
                    if(err){
                        reject(err);
                    }
                    else{
                    categories = JSON.parse(data);
                    resolve();
                    }
                })
            }
        })
        
    })    
}
  
module.exports.getAllItems = function(){
    return new Promise((resolve,reject)=>{
        if(items.length==0){
            reject("No Items to show");
        }else{
            resolve(items);
        }
    })
}

module.exports.getPublishedItems = function(){
    return new Promise((resolve,reject)=>{
       let publishedItems = [];
       for(let i = 0; i< items.length; i++){
        if(items[i].published==true){
            publishedItems.push(items[i]);
        }
       }
       if(publishedItems.length==0){
        reject("No Items to be displayed");
       }else{
        resolve(publishedItems);
       }
    })
}

module.exports.getCategories = function(){
    return new Promise((resolve,reject)=>{
        if(categories.length==0){
            reject("No Categories to show");
        }else{
            resolve(categories);
        }
    })
}


