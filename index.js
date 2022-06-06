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
const URL = require("url")

//https://www.youtube.com/watch?v=UbNtHMy4ewA



function fetch(obj) {
  if (!obj.url || !obj.method) {
    return "please check your method, url"
  }
  let fd, data = {}
  if (obj.fd) {
    //https://154.82.111.45.sslip.io/newp
    fd = new FormData()
    for(let i in obj.fd) {
      fd.append(i, obj.fd[i]);
      data.headers = fd.getHeaders();
    }
  }
  if (obj.headers) {
    for(let i in obj.headers) {
      data.headers[i] = obj.headers[i]
    }
  }
  return new Promise((resolve, reject) => {
    if (fd) {
      //console.log([obj.method.toLowerCase()], obj.url, obj.fd, data)
      axios[obj.method.toLowerCase()](obj.url, fd, data).then(data => resolve(data))
    } else {
      axios[obj.method.toLowerCase()](obj.url, data).then(data => resolve(data))
    }
  }) 
}

//recuration function to request all url and wait for response and display all urls info
async function gettingVideoInfo(arr, callback, n = 0, info = []) {
  if (arr.length > n) {
    fetch({
      url: "https://yt1s.com/api/ajaxSearch/index",
      method: "post",
      fd: {
        "q": arr[n].trim(),
        "vt": 'mp3'
      }
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
        n++
        gettingVideoInfo(arr, callback, n, info)
      } 
      else if (d.c_status.toLowerCase() === "failed") {
        //console.log("failed")
        fetch({
          url: "https://154.82.111.45.sslip.io/newp",
          method: "post",
          fd: {
            "u": arr[n].trim(),
            "c": 'EG'
          }
        }).then(result => {
          //console.log(data.data)
          let responseData = result.data.data
          let status = result.data.message
          info.push({
            id: responseData.id,
            title: responseData.title,
            mp3: "https://154.82.111.45.sslip.io"+responseData.mp3,
            mp4: "https://154.82.111.45.sslip.io"+responseData.mp4,
          })
          n++
          gettingVideoInfo(arr, callback, n, info)
          //console.log(info)
          //console.log(result)
        })
      }
      //if there's an error message display it
      else {
         info.push({
          error: d.mess,
          status: d.c_status
        })
        n++
        gettingVideoInfo(arr, callback, n, info)
      }
    })
  } else {
    //apply the call back function after finishing all requests, responses
    callback(info)
  }
}


app.all('/download', function(req, res) {
  console.log(req.body)
  if (req.body.vk) {
    let url = URL.parse(req.body.vk)
    if (!url.host) {
      download(req, res)
    } else {
      res.redirect(req.body.vk)
    }
    
  }
  else if(req.body.url) {
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
  fetch({
    url: "https://yt1s.com/api/ajaxConvert/convert",
    method: "post",
    fd: {
      "vid": req.body.vid,
      "k": req.body.vk
    },
  }).then(json => {
    json = json.data;
    if (json.status === "ok") {
      let winReversedChars = /\\|\/|\*|\:|\?|\"|\||\<|\>/ig
    }
    //console.log(json)s
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

