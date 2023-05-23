//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://ankit705yadav:kailash1ankit2@cluster0.4zmwuk5.mongodb.net/todoListDB",{ useNewUrlParser: true },e => console.error(e));  //mongodb+srv://ankit705yadav:kailash1ankit2@cluster0.4zmwuk5.mongodb.net/todoListDB

const itemSchema = {
  name:String
}

const Item = mongoose.model("item",itemSchema)

const item1 = new Item({
  name:"Welcome to todoList"
})

const item2 = new Item({
  name:"+ To add new item"
})

const item3 = new Item({
  name:"<- Hit this to delete item"
})

const defaultItems = [item1,item2,item3]


const listSchema = {
  name:String,
  items:[itemSchema]
}

const List = mongoose.model("List",listSchema)



app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){

    if(foundItems.length === 0 ){
      Item.insertMany(defaultItems,function(err){
        if(err){
        console.log(err)
        }else{
        console.log("successfullly saved items to database")
  }
})
    res.redirect("/")
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
});








app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName)

  List.findOne({name:customListName}, function(err,foundList){
    if(!err){
      if(!foundList){
        //Create New List
        const list = new List({
          name:customListName,
          items:defaultItems  
        })
      
        list.save()
        res.redirect("/" + customListName)

      }else{
        //Show an existing List
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})

      }
    }
  })

  

})

app.post("/", function(req, res){

  const itemName = req.body.newItem
  const listName = req.body.list

  const item = new Item({
    name:itemName
  })

  if (listName === "Today"){
    item.save()
    res.redirect("/")
  }else{
    List.findOne({name:listName} , function(err,foundList){
      foundList.items.push(item)
      foundList.save()
      res.redirect("/" + listName)
    })
  }

});

app.post('/delete',function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("deleted checkeed item")
        res.redirect("/")
      }
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/" + listName)
      }      
    })
  }

  
})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
