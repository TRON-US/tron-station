const httpRequest = require("request");
const httpProvider = {
  post(url, params) {
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain'
      },
      url: url,
      form: params
    };

    return new Promise(function(resolve, reject) {
      httpRequest.post(options, function(error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    }, function() {});
  },

  get(url, headers) {
    let options = {
      headers: headers,
      url: url
    };
  
    return new Promise(function(resolve, reject) {
      httpRequest.get(options, function(error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }
};

export default httpProvider;
