//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');
require("dotenv").config();
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect(
  "mongodb+srv://admin-wanyu:" +
    process.env.MONGO_PASSWORD +
    "@cluster0.auob22t.mongodb.net/todolistDB"
);
const itemschema = {
  name: {
    type: String,
    required: true,
  }
};
const Item = mongoose.model("Item", itemschema)

const drink = new Item({
  name: "Drink 2100cc. water."
});
const exercise = new Item({
  name: "Run for 30 mins."
});
const read = new Item({
  name: "Read a book!"
});
const defaultItems = [drink, exercise, read];
const listSchema = {
  name: String,
  items: [itemschema]
};
const List = mongoose.model("List", listSchema);

// List.deleteMany({
//   name: "home"
// }, function(err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Successfully deleted!");
//   }
// });

app.get("/", function(req, res) {
  Item.find(function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("defaultItems added.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });

});


app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        // create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        console.log("List saved.");
        list.save();
        res.redirect("/" + customListName);
      } else {
        // show an existed list
        console.log("already existed.");
        res.render("list", {
          listTitle:foundList.name,
          newListItems: foundList.items
        });
      };
    };
  });
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newOne = new Item({
    name: itemName
  });
  if (listName === "Today") {
    newOne.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName},function(err, foundList){
      foundList.items.push(newOne);
      foundList.save();
      res.redirect("/"+listName);
    })
  }


});
app.post("/delete", function(req, res) {
  const deletedItem_id = req.body.checkbox;
  const listOfdeletedItem = req.body.listName;
  if (listOfdeletedItem === "Today"){
    Item.findByIdAndRemove(deletedItem_id, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully deleted the checked one.");
      }
      res.redirect("/")
    });
  } else {
    List.findOneAndUpdate({name : listOfdeletedItem},{$pull:{items:{_id: deletedItem_id}}},function(err,foundList){
    if(!err){
      List.deleteOne({items: foundList},function(err){
        console.log("Successfully deleted the checked one(yaa)");
      });
      res.redirect("/" +listOfdeletedItem);
    }
  });
};
});

// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });

app.get("/about", function(req, res) {
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
};
app.listen(port, function() {
  console.log("Server started on port 3000");
});
