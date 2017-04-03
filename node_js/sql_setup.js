var mysql = require('mysql');
var settings = require('./config');

exports.executeSql = function(sql, callback){    
    var conn = mysql.createConnection(settings.dbConfig);
    conn.connect(function(err){
        if(err) {
            console.log(err);            
            callback(null, err);
            conn.end();
        }else{
            console.log('Connected to db!');
            conn.query(sql, function(error, results, next){
                if(error){                    
                    console.log(error);
                    callback(null, error);
                    console.log("if not work");
                    conn.end();
                    //next();
                }else{
                    //console.log(results);
                      console.log("statement executed");
                      callback(results, null);
                      //console.log("timer not work");
                    conn.end();
                }
                });
            }
        });
    };
