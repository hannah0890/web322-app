const Sequelize = require('sequelize');
var sequelize = new Sequelize('gohairtr ','gohairtr ','OtyqFw9wvLXQeKX9lcljs3WSKy91_Os-',
{
    host: 'postgres://gohairtr:OtyqFw9wvLXQeKX9lcljs3WSKy91_Os-@stampy.db.elephantsql.com/gohairtr',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: {rejectUnauthorized: false}
    },
    query: {raw: true}
});
    sequelize
    .authenticate()
    .then(function() {
        console.log('Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err);
    
});
//A5
const Item = sequelize.define("Item",{
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE   
})
const Category = sequelize.define("Category",{
    category: Sequelize.STRING,
})
//relationship - belongsTo
Item.belongsTo(Category,{foreignKey: "category"});

exports.initialize = ()=>{
    return new Promise ((resolve, reject)=>{
        sequelize
        .sync()
        .then(resolve("database synced!"))
        .catch(reject("Unable to sync the database!"));
    })
};
  
exports.getAllItems = function(){
    return new Promise((resolve,reject)=>{
        sequelize
        .sync()
        .then(resolve(Item.findAll()))
        .catch 
        reject(("No results returned"));
    });
};
exports.getItemsByCategory = function(category){
    return new Promise((resolve, reject)=>{
        Item.findAll({
            where:{
                category: category,
            },
        })
        .then (resolve(Item.findAll({where:{category: category} })))
        .catch (reject("No results returned"));
    });
};

exports.getItemsByMinDate = function(minDateStr){
    return new Promise((resolve, reject)=>{
        const {gte} = Sequelize.Op;
        Item.findAll({
            where: {
                postDate: {
                    [gte]: newDate(minDateStr)
                }
            }
        })
        .then(resolve(Item.findAll({where:{postDate:{[gte]: newDate(minDateStr)}}})))
        .catch(reject("No result returned"));
    })
}

exports.getItemById = function(id){
    return new Promise ((resolve, reject)=>{
        Item.findAll({
            where: {
                id: id,
            }
        })
        .then((data)=>{
            resolve(data[0]);
        })
        .catch(()=>reject("No result returned"));
    })
}

exports.addItem = (itemData)=>{
    return new Promise(function(resolve, reject){
        itemData.published = (itemData.published)? true: false;  
        for (var i in itemData){
            if (itemData[i]== ""){
                itemData[i] = null;
            }
        }
        itemData.postDate = new Date();
        Item.create(itemData)
        .then(resolve(Item.findAll()))
        .catch(reject("Unable to create item"));
    })
};
        
/*A4 Set the post date to the current date
        var currentDate = new Date();
        var formattedDate = currentDate.toISOString().slice(0,10);
        itemData.postDate = formattedDate;

        items.push(itemData);
        resolve(itemData);
        reject("error");
    })
}*/


exports.getPublishedItems = ()=>{
    return new Promise((resolve,reject)=>{
        Item.findAll({
            where:{
                published: true,
            },   
        })
        .then((data)=>{
            resolve(data);
        })
        .catch(()=> "No result returned");
       
    })
}

exports.getPublishedItemsByCategory = (category)=>{
    return new Promise((resolve, reject)=>{
        Item.findAll({
            where:{
                published: true,
                category: category,
            },
        })
        .then(resolve(Item.findAll({where:{published: true, category: category}})))
        .catch(reject("No result returned"));
        
    })
}

exports.getCategories = ()=>{
    return new Promise((resolve,reject)=>{
        Category.findAll()
        .then((data)=>{
            resolve(data);
        })
        .catch ((err)=>{
            reject(err);
        })
            
        })
    }
//A5: add new store-service function
exports.addCategory=(categoryData)=>{
    return new Promise(function(resolve, reject){        
        for (var i in categoryData){
            if (categoryData[i]== ""){
                categoryData[i] = null;
            }
        
        Category.create(categoryDataData)
        .then(resolve(Category.findAll()))
        .catch(reject("Unable to create item"));
    }
    })
}

exports.deleteCategoryById = (id)=>{
    return new Promise ((resolve, reject)=>{
        Category.destroy({
            where: {
                id : id,
            },            
        })
        .then(resolve())
        .catch(reject("Unable to delete category"));
    })
}

exports.deleteItemById = (id)=>{
    return new Promise ((resolve, reject)=>{
        Item.destroy({
            where: {
                id: id,
            },
        })
        .then(resolve())
        .catch(reject("Unable to delete post"));
    })
}