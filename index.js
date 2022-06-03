const fs = require("fs");
const https = require("https");
const axios = require("axios").default
const FormData = require('form-data')
const express = require("express"),
app = express();
const bodyParser = require('body-parser');
//To parse URL encoded data
app.use(bodyParser.urlencoded({ extended: false }))
//To parse json data
app.use(bodyParser.json())

//https://www.youtube.com/watch?v=UbNtHMy4ewA




//recuration function to request all url and wait for response and display all urls info
function gettingVideoInfo(arr, callback, n = 0, info = []) {
  if (arr.length > n) {
    let fd = new FormData()
    //append user data
    fd.append('q', arr[n].trim());
    fd.append('vt', 'mp3');
    //start the request
    axios.post("https://yt1s.com/api/ajaxSearch/index", fd, {
      headers: fd.getHeaders(),
    }).then(data => {
      //getting data
      let d = data.data;
      //if there's no errors start the request to download the file
      if (!d.mess) {
        //returning video info
        info.push({
          id: d.vid,
          title: d.title,
          mp3: d.links.mp3,
          mp4: d.links.mp4,
          m4a: d.links.m4a,
        })
      } 
      //if there's an error message display it
      else {
         info.push({
          error: d.mess,
          status: d.c_status
        })
      }
      n++
      gettingVideoInfo(arr, callback, n, info)
    })
  } else {
    callback(info)
  }
}


app.all('/v-info', function(req, res) {
  if (req.body.vk) {
    download(req, res)
  } else if(req.body.url) {
    let object = {
      list: req.body.url,
      type: "mp3"
    }
    
    var urls = object.list.trim().split("**")
    
    gettingVideoInfo(urls, function(info){
      //res.setHeader("Content-Type", "application/json")
      //res.send(JSON.stringify(info, null, 2))
      res.render("index", {
        info: info
      })
    })
  }
})

function download(req, res) {
  let fd = new FormData()
    //append user data
    fd.append('vid', req.body.vid);
    fd.append('k', req.body.vk);
    //start the request
    axios.post("https://yt1s.com/api/ajaxConvert/convert", fd, {
      headers: fd.getHeaders()
    }).then(json => {
      json = json.data;
      if (json.status === "ok") {
        let winReversedChars = /\\|\/|\*|\:|\?|\"|\||\<|\>/ig
      }
      //console.log(json)
      res.redirect(json.dlink)
    });
}
/*
app.all('/download', function(req, res) {
  //console.log(req.body, req.body.vid)
  let fd = new FormData()
    //append user data
    fd.append('vid', req.body.vid);
    fd.append('k', req.body.vk);
    //start the request
    axios.post("https://yt1s.com/api/ajaxConvert/convert", fd, {
      headers: fd.getHeaders()
    }).then(json => {
      json = json.data;
      if (json.status === "ok") {
        let winReversedChars = /\\|\/|\*|\:|\?|\"|\||\<|\>/ig
      }
      console.log(json)
      res.redirect(json.dlink)
    });
})
*/
app.get('/', function(req, res) {
  res.render("index")
})
app.set("view engine", "pug")
app.set("views", __dirname + "/")
app.use(express.static(__dirname + "/"))
app.listen(8000)
