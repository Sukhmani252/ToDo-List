const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");
// const items = ["Buy food", "Cook food", "Eat food"];
// const workItems = [];

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todo list."
});
const item2 = new Item({
    name: "Hit the + button to add an item."
});
const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
    // const day = date.getDate();
    // res.render("list", { listTitle: day, newListItems: items });
    Item.find({}, function(err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Default Items successfully added to DB");
                }
            });
            res.redirect("/"); //Next time, it will go in else block and will render items.
        } else {
            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
    });


});
// var currentDay = today.getDay();
// var day = "";

// if (currentDay === 6 || currentDay === 0) {
// res.write("<h1>Yeah, its the weekend.</h1>");
//    day = "weekend";
//} else {
// res.sendFile(__dirname + "/index.html");
//  day = "weekday";
// }
// switch (currentDay) {
//     case 0:
//         day = "Sunday";
//         break;
//     case 1:
//         day = "Monday";
//         break;
//     case 2:
//         day = "Tuesday";
//         break;
//     case 3:
//         day = "Wednesday";
//         break;
//     case 4:
//         day = "Thursday";
//         break;
//     case 5:
//         day = "Friday";
//         break;
//     case 6:
//         day = "Saturday";
//         break;
//     default:
//         console.log("Error: Current day is" + currentDay);
// }




app.post("/", function(req, res) {
    // console.log(item);
    // const item = req.body.newItem;
    const itemName = req.body.newItem;
    const listName = req.body.list;
    // console.log(req.body);
    // if (req.body.list === "Work List") {
    //     workItems.push(item);
    //     res.redirect("/work");
    // } else {
    //     items.push(item);
    //     res.redirect("/");
    // }
    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }

});

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully deleted the checked item");
                res.redirect("/");
            }
        })
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function(err) {
            if (!err) {
                res.redirect("/" + listName);
            }
        })
    }

});

// app.post("/work", function(req, res) {
//     let item = req.body.newItem;
//     workItems.push(item);
//     res.redirect("/work");
// });

//app.get("/work", function(req, res) {
//  res.render("list", { listTitle: "Work List", newListItems: workItems });
//whenever we render, we have to provide value of all variables used in ejs template

//});
app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({ name: customListName }, function(err, foundList) {
        if (!err) {
            if (!foundList) {
                //Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);

            } else {
                //Show an existing list
                res.render("list", { listTitle: customListName, newListItems: foundList.items });
            }
        }
    })
})

app.get("/about", function(req, res) {
    res.render("about");
});
app.listen(3000, function() {
    console.log("Server is running on port 3000");
});