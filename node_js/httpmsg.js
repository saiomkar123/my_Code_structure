var settings = require('./config');

exports.show500 = function(req, resp, err){
	if(settings.httpMsgsFormat === "HTML"){
		resp.writeHead(500, "Internal Error Occured", {"Content-Type": "text/html"});
			resp.write("<html><head><title>500 Internal Error</title></head><body>500 Internal error. For Details: "+err+"</body></html>");
		}else{
			resp.writeHead(500, "Internal Error Occured", {"Content-Type": "application/json"});
			resp.write(JSON.stringify({data: "500 ERROR Occured:" + err}));
		}
	resp.end();
};

exports.sendJSON = function(req, resp, data){
	resp.writeHead(200, {'Content-Type': 'application/json'});
	if(data){
		resp.write(JSON.stringify(data));
	}
	resp.end();
};

exports.show405 = function(req, resp){
	if(settings.httpMsgsFormat === "HTML"){
		resp.writeHead(405, "Method Not supported", {"Content-Type": "text/html"});
			resp.write("<html><head><title>405</title></head><body>405: Method Not supported</body></html>");
		}else{
			resp.writeHead(405, {"Content-Type": "application/json"});
			resp.write(JSON.stringify({data: "Method Not supported"}));
		}
	resp.end();
};

exports.show404 = function(req, resp){
	if(settings.httpMsgsFormat === "HTML"){
		resp.writeHead(404, "Resource Not Found", {"Content-Type": "text/html"});
			resp.write("<html><head><title>404</title></head><body>404: Resource Not Found</body></html>");
		}else{
			resp.writeHead(404, {"Content-Type": "application/json"});
			resp.write(JSON.stringify({data: "Resource Not Found"}));
		}
	resp.end();
};


exports.show413 = function(req, resp){
	if(settings.httpMsgsFormat === "HTML"){
		resp.writeHead(413, "Request entity too large", {"Content-Type": "text/html"});
			resp.write("<html><head><title>413</title></head><body>413: Request entity is too large</body></html>");
		}else{
			resp.writeHead(413, {"Content-Type": "application/json"});
			resp.write(JSON.stringify({data: "Request entity too large"}));
		}
	resp.end();
};

exports.send200 = function(req, resp){
	resp.writeHead(200, {'Content-Type': 'Content-Type": "application/json'});
	resp.write("200 Response Ok")
	resp.end();
};

exports.showHome = function(req, resp){
	if(settings.httpMsgsFormat === "HTML"){
		resp.writeHead(200, {"Content-Type": "text/html"});
			resp.write("<html><head><title>Home</title></head><body>Valid end points: </br> /employees - GET To search for an employee.</body></html>");
		}else{
			resp.writeHead(200, {"Content-Type": "application/json"});
			resp.write(JSON.stringify([
				{url: "/employee", description: "to list all employees"},
				{url: "/employee/<empno>", description: "to list employee of emp no"}]));
		}
	resp.end();
};

exports.show400 = function(req, resp){
	resp.writeHead(200, {"Content-Type": "application/json"});
	resp.write(JSON.stringify({data: "Bad Request"}));
	resp.end();
}

exports.showError = function(req, resp, error){
	resp.writeHead(200, {'Content-Type': 'application/json'});
	if(error){
		resp.write(JSON.stringify({Error: error}));
	}
	resp.end();
}