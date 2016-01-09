var http = require('http');
var querystring = require('querystring');
var fs = require('fs');

// var appVar= {};

// function setVariables(request, appVar) {
//  //request.method;
//  //url = request.url;
// }

var server = http.createServer(function (request, response) {



  fs.readFile('./topHalfElementName.html', function (err, data){
    console.log(querystring.parse(data.toString()));
  });



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

  if(request.url === '/') {
    request.url = '/index.html';
  }


  request.on('end', function () {
    //if get call function..return headers....if post call function..change files
    return reqHandler(request);
  });

  function setHeader() {
    response.statusCode = status;
    response.statusMessage = statusMess;
    response.setHeader('Server', 'Brad\'s Server');
    response.setHeader('Content-type' , 'text/'+ contType);
  }

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
        if(request.url === '/elements.html') {
          return parseMe(buff);
        } else {
          return error403Msg(); //illegal post
        }
    }
  }

  request.on('data', function (buffer) {
    buff = querystring.parse(buffer.toString());
    return buff;
  });


  function parseMe(buff) {
    var details = checkForParams(buff);

    console.log("Am I heeeeeereeee?", details);
      fs.readFile('./topHalfElementName.html', function (err, data){
        if(err) {
          console.log(err);
          return error400Msg();
        } else {
           top = data.toString()
          .replace('{{ElementName}}', details.eName)
          .replace('{{ElementName}}', details.eName);

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
    fs.writeFile('./public/' + buff.elementName + '.html', top + symbol + num + desc, function (err){
      if(err) {
        return console.log(err, "Something went wrong");
      } else {
        contType = 'application/json';
        setHeader();
        response.end('{ "success" : true }');
      }
    });
  }

  function checkForParams(buff) {
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