module.exports = function(io){

var express = require('express');
var router = express.Router();
var httpMsgs = require('./httpMsgs');
var db = require('./db');
var multer  = require('multer');
var crypto = require('crypto');
var mime = require('mime');
var file_name = {image_wash:"", image_switch:""};
var storage_wash = multer.diskStorage({
  destination: function (req, file, cb) {
  	console.log(req.files);
  	console.log(file);
  	console.log(cb);
    cb(null, 'public/uploads/washes')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
    	if (err) return cb(err);
    	file_name.image_wash = raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype);
      cb(null, file_name.image_wash);
    });
  }
});
var storage_switch = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/switches')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
    	if (err) return cb(err)
    	file_name.image_switch = raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype);
      cb(null, file_name.image_switch);
    });
  }
});
var upload_wash = multer({ storage: storage_wash });
var upload_switch = multer({ storage: storage_switch });

router.get('/', function(req, res){
	res.redirect('/');
});



router.post('/wash_order_fullfill', upload_wash.single('image'), function(req, res){
	console.log(file_name);
	console.log(req.body);
	try{
		if(req.body.length < 8) throw new Error("All fields are mandatory");
		var reason;
		if(req.body.reason == null || req.body.reason == ""){
			reason = "successfully fullfilled by "+req.body.employeeid;
		}else{
			reason = req.body.reason;
		}
		var sql = "INSERT INTO `washes_order_fullfillment` (`order_id`, `customer_id`, `address`, `lat_pos`, `long_pos`, `ac_details`, `fullfilled_by`, `reasons`, `image_url`) VALUES ('"+req.body.order_id+"', '"+req.body.customer_id+"', '"+req.body.address+"', '"+req.body.lat_pos+"', '"+req.body.long_pos+"', '"+req.body.ac_details+"', '"+req.body.employeeid+"', '"+reason+"', '/uploads/washes/"+file_name.image_wash+"')";
		db.executeSql(sql, function(data, err){
			if(err){
				httpMsgs.showError(req, res, err);
			}else if(data == null || data == ""){
				httpMsgs.showError(req, res, "Not Updated, Database Error.!");
			}else{
				httpMsgs.sendJSON(req, res, {msg: "successfully entered"});
			}
		})
	}catch(ex){
		httpMsgs.showError(req, res, ex);
	}
})

return router;
}