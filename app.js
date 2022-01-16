//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDb");

const itemSchema = {
  name: String
};
const Item = mongoose.model("item", itemSchema);
const item = new Item({
  name:"wake up"
});
const item1 = new Item({
  name:"Break"
});
const item2 = new Item({
  name:"wake up"
});

const defaultItem = [item,item1 , item2];

const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
       Item.insertMany(defaultItem, function(err){
        if(err){
          console.log("err");
        }else{
          console.log("success");
        }
        res.redirect("/");
      });

    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });



  // res.render("list", {listTitle: "Today", newListItems: items});

});

app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;
  List.findOne({name:customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItem
        })

        list.save();
        res.redirect("/" + customListName);

      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items} );
      }
    }
  })



  const list = new List({
    name: customListName,
    items: defaultItem
  })

  list.save();



})

app.post("/", function(req, res){

   const itemName = req.body.newItem;
   const listName = req.body.list;
   const item4 = new Item({
     name: itemName
   });
   if(listName === "Today"){
     item4.save();
     res.redirect("/");
   }else{
     List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item4);
      foundList.save();
      res.redirect("/" + listName);
    });
  }


  });



app.post("/delete", function(req, res){
  const checkedItemsId = req.body.checkbox;
  const listName = req.body.listTitle;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemsId, function(err){
      if(!err){
        console.log("Successfully Deleted");
          res.redirect("/");
      }


    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:checkedItemsId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + req.body.listTitle);
      }
    });
  }


});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
