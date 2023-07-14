const Sequelize = require('sequelize');
var sequelize = new Sequelize('gohairtr','gohairtr','sZCb_ti9cNqQbk_6glXDpOb4izNvSiba',
{
    host: 'postgres://gohairtr:sZCb_ti9cNqQbk_6glXDpOb4izNvSiba@stampy.db.elephantsql.com/gohairtr',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: {rejectUnauthorized: false}
    },
    query: {raw: true}
});


module.exports.initialize = function(){
    return new Promise((resolve,reject)=>{
        reject();
        
})
}
  
module.exports.getAllItems = function(){
    return new Promise((resolve,reject)=>{
        reject();
    })
}

module.exports.getPublishedItems = function(){
    return new Promise((resolve,reject)=>{
        reject();
       
    })
}

//A4
module.exports.getPublishedItemsByCategory = function(){
    return new Promise((resolve, reject)=>{
        reject();
        
    })
}

module.exports.getCategories = function(){
    return new Promise((resolve,reject)=>{
        reject();
        
    })
}
//A3
module.exports.addItem = function(itemData){
    return new Promise(function(resolve, reject){
        itemData.published = (itemData.published)? true: false;  
        itemData.id = items.length + 1;
        
//A4 Set the post date to the current date
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
        reject();
        
    })
}

module.exports.getItemsByMinDate = function(minDateStr){
    return new Promise((resolve, reject)=>{
        reject();
    })
}

module.exports.getItemById = function(id){
    return new Promise ((resolve, reject)=>{
        reject();
    })
}