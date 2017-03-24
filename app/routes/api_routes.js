var request = require('request');
module.exports = function(app, db) {
  this.ratings = '';
  app.get('/vehicles/:modelyear/:make/:model', (req, res) => {
    var withRating = false;
    if(req.query.withRating != undefined){
      withRating = (req.query.withRating=="true");
    }



    request.get({ url: "https://one.nhtsa.gov/webapi/api/SafetyRatings/modelyear/"+req.params.modelyear+"/make/"+req.params.make+"/model/"+req.params.model+"?format=json" },      function(error, response, body) {
      if (!error && response.statusCode == 200 && withRating == false) {
        body = body.replace(/"VehicleDescription":/g, '"Description":');// update VehicleDescription json key to Description as required in output formate.
        var formatedJSON = JSON.parse(body)
        delete formatedJSON.Message;  // Removed Message tag from json as it is not required in application output formate.
        res.json(formatedJSON);
      }
      function functionCallBack(objBodyJSON,key,info) {
        //console.log(objBodyJSON["Results"]);
        objBodyJSON["Results"][key]["CrashRating"] =info.Results[0].OverallRating;
        res.json(objBodyJSON);
      }
      if (!error && response.statusCode == 200 && withRating == true) {
        body = body.replace(/"VehicleDescription":/g, '"Description":');// update VehicleDescription json key to Description as required in output formate.
        var objBodyJSON = JSON.parse(body)
        delete objBodyJSON.Message;  // Removed Message tag from json as it is not required in application output formate.
        for (var key in objBodyJSON.Results) {
          if (objBodyJSON.Results.hasOwnProperty(key)) {
            request.get({ url: "https://one.nhtsa.gov/webapi/api/SafetyRatings/VehicleId/"+objBodyJSON.Results[key]['VehicleId']+"?format=json" },function(error, response, body) {
              var objBodySubJSON = JSON.parse(body);
              functionCallBack(objBodyJSON,key,objBodySubJSON);
            }); // end of req get
          }  // end of if
        } // end of for
      } // end of IF
    });
  });

  app.post('/vehicles', (req, res) => {
    var modelYear = req.param('modelYear');
    var manufacturer = req.param('manufacturer');
    var model = req.param('model');
    request.get({ url: "https://one.nhtsa.gov/webapi/api/SafetyRatings/modelyear/"+modelYear+"/make/"+manufacturer+"/model/"+model+"?format=json" },      function(error, response, body) {
      if (!error && response.statusCode == 200) {
        // update VehicleDescription json key to Description as required in output formate.
        // Removed Message tag from json as it is not required in application output formate.
        body = body.replace(/"VehicleDescription":/g, '"Description":');
        var formatedJSON = JSON.parse(body)
        delete formatedJSON.Message;
        res.json(formatedJSON);
      }
    });
  });



};
