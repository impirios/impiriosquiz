var express = require('express');
var fs = require('fs');

var app = express();
app.set('view engine','ejs');

var path = require('path');
var bodyParser = require('body-parser');

app.use(express.static(__dirname+'/static'));
app.use(bodyParser.urlencoded({extended:true}));
var questions = [];
var prevdata = false;

var categories = [];
var category;

fs.readFile("categories.json",(err,data)=>
{
    if(err) throw err;

    var categoriesdata = JSON.parse(data);
    
    for(var i=0;i<categoriesdata.categories.length;i++)
    {
        var categoriesObject = {name:categoriesdata.categories[i],src:'/images/'+categoriesdata.categories[i]+'.jpg'};
        categories.push(categoriesObject);
    }

});




app.get('/',(req,res)=>{
    console.log(categories[0].src);

    res.render('categories.ejs',{c:categories});
});

app.post('/quiz',(req,res)=>{
    
    fs.readFile('questions/'+req.body.category+'.json','utf8',(err,data)=>{
        if(err) throw err;
        var questionsdata;
        questions = [];
        questionsdata = JSON.parse(data);
        for(var i=0;i<questionsdata.results.length;i++)
        { 
            var questionsObject = {url:'/images/'+req.body.category+'.jpg',index:i+1,question:questionsdata.results[i].question,correct:questionsdata.results[i].correct_answer,options:[]};
            questionsObject.options.push(questionsdata.results[i].correct_answer);
            for(var j=0;j<questionsdata.results[i].incorrect_answers.length;j++)
            {
                questionsObject.options.push(questionsdata.results[i].incorrect_answers[j]);
            }
            var CorrectIndex = Math.floor(Math.random()*3);
            if(CorrectIndex!=0)
            {
                var temp = questionsObject.options[0];
                questionsObject.options[0] = questionsObject.options[CorrectIndex];
                questionsObject.options[CorrectIndex] = temp;
            }
            questions.push(questionsObject);
        }
        res.render('index.ejs',{q:questions});

    });
});

app.post('/check',(req,res)=>{

    var score = 0;
    var performance;
    console.log(req.body[1]==questions[0].correct);
    for(x in req.body)
    {
        if(req.body[x] == questions[ parseInt(x)-1].correct)
        {
            score+=1;
        }
    }
    if(score==questions.length)
    {
        performance = "Man of your words you are";
    }
    else if(score<questions.length&&score>questions.length/3)
    {
        performance = "You got spirit kid";
    }
    else if(score<questions.length/3&&score>questions.length/2)
    {
        performance = "Need more reading";
    }
    else
    {
        performance = "404 IQ not found";
    }

    var result = {Score:score,outof:questions.length,Performance:performance};

    console.log(score);
    res.render('result.ejs',{result:result});
});

var server = app.listen(process.env.PORT || 8080,function()
{
    var host = server.address().address;
    var port = server.address().port;

    console.log("Example app listening at http://%s:%s",host,port);
})