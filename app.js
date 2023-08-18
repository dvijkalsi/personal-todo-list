const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const render  = require('ejs');
const _ = require('lodash');


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
var username = '';


// USE YOUR MONDODB SRV TO CONNECT TO YOUR DATABASE
mongoose.connect('<YOUR MONGODB SRV>/todolistDB', {family: 4, useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log(`CONNECTED TO MONGO!`);
    })
    .catch((err) => {
        console.log(`OH NO! MONGO CONNECTION ERROR!`);
        console.log(err);
})


const itemsSchema = {
    name: String
};

const Item = mongoose.model('Item', itemsSchema);

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);




const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

app.get('/get_user', (req, res) => {
    res.render('getUsername');
});

app.post('/get_user', (req, res) => {
    username =_.capitalize(req.body.username);
    res.redirect('/' + username);
});


app.get('/', (req, res) => {  
    res.redirect('/get_user');
});





app.post('/', (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    // console.log(req.body);
    const item = new Item({
        name: itemName
    });


    if(listName === 'Today'){
        item.save();
        res.redirect('/');
    } else {
        List.findOne({ name: listName }).then((foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect('/' + listName);
        }).catch((err) => {
            console.log(err);
        });
    }

});

app.get('/:customListName', (req, res) => {
    const customListName =_.capitalize(req.params.customListName);

    List.findOne({ name: customListName }).then((foundList) => {
        if(!foundList){
            // Create a new list
            const list = new List({
                name: customListName,
                items: defaultItems
            });
            list.save();
            res.redirect('/' + customListName);
        } else {
            // Show an existing list
            res.render('list', { listTitle: foundList.name, newItems: foundList.items });
        }

    }).catch((err) => {
        console.log(err);
    });


});




app.post('/delete', (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === 'Today'){
        Item.deleteOne({ _id: checkedItemId }).then(() => {
            console.log('Successfully deleted checked item');
            res.redirect('/');
        }).catch((err) => {
            console.log(err);
        }
        );
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }).then((foundList) => {
            res.redirect('/' + listName);
        }).catch((err) => {
            console.log(err);
        });

    }
});



app.listen(process.env.PORT || 3000, () => {
    console.log('Server has started!');
});