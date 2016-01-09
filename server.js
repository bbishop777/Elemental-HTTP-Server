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
      //Passing a function to createFileArry is similar to bind.  It
      // is callback function.  The argument var 'fileArry' will be filled-in
      // in the createFileArry function...see that function for more notes
    } else if(request.method == 'POST') {
        createFileArry(function (fileArry) {
                // recreateIndex(fileArry);
          if(request.url === '/elements.html') {
            isAllowed(fileArry, buff);
            console.log('');
          } else {
            return error403Msg(); //illegal post
          }
      });
    }
  }

// Here the 'cb' or callback function (aka 'cheeseburger') that is passed
// in is not activated until called below.  So the reqHandler function above
// calls createFileArry and passes in a callback function for it. createFileArry
// then reads the public folder in the Elemental-HTTP-Server folder and
// assigns the content to 'files', an array, as long as there are not any errors.
// We then create a var='fixins'that sorts the files individually comparing them
// against the files we don't want included (cases). If they match, a false
// value is given and that element is not put in the new array.  If no match,
// a true value is give and that element is put into the new array. The array is
// assigned to fixins.  After this is all done, we call the callback function
// that was passed-in in the beginning. This is done because of the
// asynchronous nature of fs.readdir.  Before this design, I tried to call
// createFileArry with no arguments passed in and return the result of the
// filter function on the files.  I also tried assigning those results to a
// variable that was globally declared.  Lastly I split the 'filter' and
// 'fs.read' functions apart and tried to run them that way.  In all cases,
// the filter portion would work,but control would return to the reqHandler
// function before filter was done, resultingin no array being given back
// to reqHandler (undefined). A more straightforward way to do it is to use
// fs.readdirSync which I did and is found in the previous commit on github
  function createFileArry (cb) {
    fs.readdir('./public/', function(err, files) {
      if(err) { return console.log(err, 'Unexpected error');
      } else {
        var fixins = files.filter(function (element) {
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
        cb(fixins);
      }
    });
  }

  function isAllowed(fileArry, buff) {
    if(fileArry.indexOf(buff.elementName.toLowerCase() +'.html') < 0) {
      return parseMe(buff, fileArry);
      } else {
        error403Msg();
      }
  }

  // function recreateIndex(fileArry)
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
            if(err) { return console.log(err) ;
            } else {
              symbol = data.toString()
              .replace('{{&}}', details.eSym);

              fs.readFile('./atomNum.html', function (err, data) {
                if(err){ return console.log(err);
                } else {
                  num = data.toString()
                  .replace('{{num}}', details.eNum);

                  fs.readFile('./description.html', function (err, data) {
                    if(err) { return console.log(err);
                    } else {
                      desc = data.toString()
                      .replace('{{describe}}', details.eDesc);
                      console.log('Should not be here 1');
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
        console.log('Should not be here 2');
        status = 200;
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

  function setHeader() {
    response.statusCode = status;
    response.statusMessage = statusMess;
    response.setHeader('Server', 'Brad\'s Server');
    response.setHeader('Content-type' , 'text/'+ contType);
  }

});







server.listen(9000, function() {
  console.log('Server On and Listening!');
});