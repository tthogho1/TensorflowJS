import express from 'express';
import bodyParser from "body-parser";

var app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true}))

var server = app.listen(80, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});

app.post("/api/test", function(req, res, next){
    console.log(req.body);
    const vectors = req.body.vectors;
    console.log(vectors);
    const value = vectors[0].values;
    console.log(value);
    res.json("{stauts:ok}");
});