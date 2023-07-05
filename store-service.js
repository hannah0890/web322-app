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

//A4
module.exports.getPublishedItemsByCategory = function(){
    return new Promise((resolve, reject)=>{
        let publishedItemsByCategory = [];
        for (let i=0; i < items.length; i++){
            if(items[i].published == true && items[i].category == category){
                publishedItemsByCategory.push(items[i]);
            }
        }
        if (publishedItemsByCategory.length == 0){
            reject("No Items to be displayed")            
        }
        else{
            resolve(publishedItemsByCategory);
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
//A3
module.exports.addItem = function(itemData){
    return new Promise(function(resolve, reject){
        itemData.published = (itemData.published)? true: false;  
        itemData.id = items.length + 1;
        
//Set the post date to the current date
        var currentDate = new Date();
        var formattedDate = currentDate.toISOString().slice(0,10);
        itemData.postDate = formattedDate;

        items.push(itemData);
        resolve(itemData);
        reject("error");
    })
}

module.exports.getItemsByCategory = function(category){
    return new Promise((resolve, reject)=>{
        const filteredItems = items.filter((item)=>item.category == category);
        if(filteredItems.length == 0){
            reject("No results returned");
        } 
        else{
            resolve(filteredItems);
        }
    })
}

module.exports.getItemsByMinDate = function(minDateStr){
    return new Promise((resolve, reject)=>{
        const minDate = new Date (minDateStr);
        const filteredItems = items.filter((item)=>{
            const postDate = new Date(item.postDate);
            return postDate >= minDate;
        });
        if(filteredItems.length == 0){
            reject ("No results returned");
        }
        else{
            resolve(filteredItems);
        }
    })
}

module.exports.getItemById = function(id){
    return new Promise ((resolve, reject)=>{
        const item = items.find((item)=> item.id == id);
        if (!item){
            reject ("No result returned");
        }
        else {
            resolve(item);
        }
    })
}