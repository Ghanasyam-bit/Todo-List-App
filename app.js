//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://ManiDp:Manideep%404@cluster0.dakuwwn.mongodb.net/todolistDB", {useNewUrlParser: true});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

const item1 = new Item(
  {
    name: "Welcome to your todolist!",
  }
);

const item2 = new Item(
  {
    name: "Hit the + button to add a new task!"
  }
);

const item3 = new Item(
  {
    name: "<-- Hit this to delete the task"
  }
);

let visitCount = 0;

const defaultItems = [item1,item2,item3];

app.get("/", function(req, res) {

  Item.find({}).then(
    function(response){

      if( !visitCount && response.length === 0){
        ++visitCount;
        Item.insertMany(defaultItems).then(function(name){
          console.log(name);
        }).catch(function(err){
          console.log(err);
        });

        redirectTo("/");
      }else{
        res.render("list", {listTitle: "Today", newListItems: response});
      }
    } 
  ).catch(function(err){
    console.log(err);
  })

});

app.post("/", function(req, res){

  const itemName = (req.body.newItem);
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
  
});

app.post("/delete",function(req,res){

  const checkedItemId = req.body.checkBox;
  const listName = req.body.listName;

  if(listName === "Today"){

    Item.findByIdAndRemove({_id: checkedItemId}).then(function () {
        console.log("Successfully deleted");
        res.redirect("/");
     })
     .catch(function (err) {
        console.log(err);
      });

  }else{
    List.findOneAndUpdate({name: listName},{$pull : {items: {_id: checkedItemId}}}).then(function(foundList){
      res.redirect("/"+ listName);
    });
  }

});

app.get("/:listName",function(req,res){ 
  const customListName =_.capitalize(req.params.listName);

  List.findOne({name: customListName}).then(function(foundList){

    if(!foundList){
        const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      console.log("Saved");
      res.redirect("/"+customListName);
    }else{
        res.render("list", {listTitle: customListName, newListItems: foundList.items});
    }
    
  }).catch(function(err){
    console.log(err);
  })
  

})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT ||3000, function() {
  console.log("Server started on port 3000");
});
