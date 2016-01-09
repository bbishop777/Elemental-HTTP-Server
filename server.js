var http = require('http');
var querystring = require('querystring');
var fs = require('fs');


var server = http.createServer(function (request, response) {



  // fs.readFile('./public/indexTemplate.html', function (err, data){
  //   console.log(querystring.parse(data.toString()));
  // });



  //setVariables(request, appVar);
  var buff = "";
  var status = 200;
  var statusMess = 'OK';
  contType = request.url.split('.')[1] + ', charset=utf-8';
  var body = null;
  var innards = '';
  var top = '';
  var symbol = '';
  var num = '';
  var desc = '';
  // var fat = [];



  if(request.url === '/') {
    request.url = '/index.html';
  }

  request.on('data', function (buffer) {
    buff = querystring.parse(buffer.toString());
    return buff;
  });

  request.on('end', function () {
    //if get call function..return headers....if post call function..change files
    return reqHandler(request);
  });




//you could write the 'if' like this:
//switch(request.method) {
// case 'GET' :
// (do GET Request)
// break;
//  case 'POST' :
//  (do POST Request)
//  break;
//  case 'PUT' :
//  (do PUT)
//  break;
//  case 'DELETE' :
//  (do DELETE)
//  break;
//
//  default :   //this is the default action if no case is met
//  console.log('Invalid request method')

  function reqHandler(request) {
    if(request.method == 'GET') {
      fs.readFile('./public' + request.url, function (err, data) {
        if (err) return error404Msg(); //if not found
        else {
          body = data;
          setHeader();
          response.end(body);
          return console.log('Response ended');
        }
      });
    } else if(request.method == 'POST') {
        var fileArry = createFileArry();
        console.log(fileArry, 'errrorrrr');
        if(request.url === '/elements.html') {
          return parseMe(buff, fileArry);
        } else {
          return error403Msg(); //illegal post
        }
    }
  }

  function setHeader() {
    response.statusCode = status;
    response.statusMessage = statusMess;
    response.setHeader('Server', 'Brad\'s Server');
    response.setHeader('Content-type' , 'text/'+ contType);
  }
//function is breaking here...maybe because async nature of
//fs.readdir...doesn't return the arry to above
  function createFileArry () {
    fs.readdir('./public/', function(err, files) {
      var fat = files.filter(function (element) {
        switch(element) {
          case '400.html' :
          case '403.html' :
          case '404.html' :
          case '.keep' :
          case 'css' :
          case 'index.html' :
          case 'indexTemplate.html' :
            return false;

          default :
            return true;
        }
      });
    console.log(fat);
    });
    // return fat;

  }


  function parseMe(buff, fileArry) {
    var details = checkForParams(buff, fileArry);
      fs.readFile('./topHalfElementName.html', function (err, data){
        if(err) {
          console.log(err);
          return error400Msg();
        } else {
           top = data.toString()
           //the forward slashes put into a regex standard and the 'g'
           //says do it 'globally'
          .replace(/{{ElementName}}/g, details.eName);
          // .replace('{{ElementName}}', details.eName);

          fs.readFile('./elementSymbol.html', function (err, data){
            if(err) return console.log(err);
            else {
              symbol = data.toString()
              .replace('{{&}}', details.eSym);

              fs.readFile('./atomNum.html', function (err, data) {
                if(err) return console.log(err);
                else {
                  num = data.toString()
                  .replace('{{num}}', details.eNum);

                  fs.readFile('./description.html', function (err, data) {
                    if(err) { return console.log(err);}
                    else {
                      desc = data.toString()
                      .replace('{{describe}}', details.eDesc);
                      createFile( buff, top, symbol, num, desc);
                    }
                  });//this closes read file description.html
                }
              }); //this closes read file atomNum.html
            }
          }); //this closes read file elementSymbol.html
        }
      }); //this closes read file topHalfElementName.html
  }

  function createFile(buff, top, symbol, num, desc) {
    fs.writeFile('./public/' + buff.elementName.toLowerCase() + '.html', top + symbol + num + desc, function (err){
      if(err) {
        return console.log(err, "Something went wrong");
      } else {
        contType = 'application/json';
        setHeader();
        response.end(JSON.stringify({ "success" : true }));
      }
    });
  }

  function checkForParams(buff, fileArry) {
    if(buff.elementName && buff.elementSymbol && buff.elementAtomicNumber && buff.elementDescription) {

      var details = {eName : buff.elementName,
                     eSym : buff.elementSymbol,
                     eNum : buff.elementAtomicNumber,
                     eDesc : buff.elementDescription
                    };

      return details;
    } else {
      return error400Msg();
    }
  }

  function error404Msg () {
    status = 404;
    statusMess = 'File Not Found';
    fs.readFile('./public/404.html', function (err, data) {
      if (err) {
        console.log(err);
        response.end();
      } else {
        body = data;
        setHeader();
        response.end(body);
      }
    });
  }

  function error403Msg () {
    fs.readFile('./public/403.html', function (err, data) {
      if (err) {
        console.log(err);
        response.end();
      } else {
        body = data;
        status = 403;
        statusMess = 'Request is Forbidden!';
        setHeader();
        response.end(body);
      }

    });
   }

  function error400Msg () {
    status = 400;
    statusMess = 'Bad Request. Check input name';
    fs.readFile('./public/400.html', function (err, data) {
      if (err) {
        console.log(err);
        response.end();
      } else {
        body = data;
        setHeader();
        response.end(body);
      }
    });
  }


});







server.listen(9000, function() {
  console.log('Server On and Listening!');
});