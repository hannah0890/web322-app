const Sequelize = require('sequelize');
var sequelize = new Sequelize('gohairtr', 'gohairtr', 'OtyqFw9wvLXQeKX9lcljs3WSKy91_Os-',
{
    host: 'stampy.db.elephantsql.com',
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
const Category = sequelize.define("Category", {
    category: Sequelize.STRING,
    });
// relationship - belongsTo
Item.belongsTo(Category, { foreignKey: "category" });

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize
        .sync()
        .then(resolve("database synced!"))
        .catch(reject("Unable to sync the database!"));
    });
};

module.exports.getAllItems = () => {
    return new Promise((resolve, reject) => {
        sequelize
        .sync()
        .then(resolve(Item.findAll()))
        .catch(reject("no results returned!"));
    });
};

module.exports.getPublishedItems = () => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
             published: true,
         },
    })
    .then((data) => {
        resolve(data);
    })
    .catch(() => "no results returned!");
    });
};

module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll()
        .then((data) => {
            resolve(data);
        })
        .catch((err) => {
            reject(err);
    });
    });
};

module.exports.addItem = (itemData) => {
    return new Promise((resolve, reject) => {
        itemData.published = itemData.published ? true : false;
        for (var i in itemData) {
            if (itemData[i] == "") {
                itemData[i] = null;
            }
        }
        itemData.postDate = new Date();
        Item.create(itemData)
        .then(resolve(Item.findAll()))
        .catch(reject("Unable to create item!"));
    });
};

module.exports.getItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                category: category,
            },
        })
        .then(resolve(Item.findAll({ where: { category: category } })))
        .catch(reject("no results returned!"));
    });
};

module.exports.getItemsByMinDate = (minDate) => {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;
        Item.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr),
                },
            },
        })
        .then(resolve(Item.findAll({ where: { postDate: { [gte]: new Date(minDateStr) } } })))
        .catch(reject("no results returned!"));
    });
};

module.exports.getItemById = (id) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                id: id,
            },
        })
        .then((data) => {
        resolve(data[0]); // return a single object
        })
        .catch(() => reject("no results returned!"));
    });
};

module.exports.getPublishedItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                published: true,
                category: category,
            },
        })
        .then(resolve(Item.findAll({ where: { published: true, category: category } })))
        .catch(reject("no results returned!"));
    });
};

// adding new blog-service.js functions
module.exports.addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
        
        for (var i in categoryData) {
            if (categoryData[i] == "") {
                categoryData[i] = null;
            }
        }        
        Category.create(categoryData)
        .then(resolve(Category.findAll()))
        .catch(reject("Unable to create category!"));
        
    });
};

module.exports.deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {
                id: id,
            },
        })
        .then(resolve())
        .catch(reject("Unable to delete category"));
    });
};

module.exports.deleteItemById = (id) => {
    return new Promise((resolve, reject) => {
        Item.destroy({
            where: {
                id: id,
            },
        })
        .then(resolve())
        .catch(reject("Unable to delete item"));
    });
};