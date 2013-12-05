var connectData = { 
  "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
  "user": "CIS550", 
  "password": "databaseproject", 
  "database": "CIS550" };
var oracle =  require("oracle");

var http = require('http');
var express = require('express')
, logout = require('./logout')
;

var app = express();

app.get('/logout',logout.do_work);

var b64pad  = "";
var chrsz   = 8;
var userid = null;
var username = null;
var user_display_name = null;

function generatehash(req,res,secretpassword, sitename) {
	var pwd = "";
            var error = "";
     if (sitename.length == 0)
         error = error + " sitename";
     if (secretpassword.length == 0)
         error = error + " secretpassword";
    
     if (error.length == 0) {
         var input = secretpassword + ':' + sitename.toLowerCase();
         pwd = binb2b64(core_sha1(str2binb(input), input.length * chrsz));
         pwd = pwd.substring(0, 10);
         pwd = ensurenumberandletter(pwd);
     }
   //  return { password: pwd, error: error };
     check_password(req,res,pwd);
}
 
function core_sha1(x, len)
{
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;
 
  var w = Array(80);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  var e = -1009589776;
 
  for(var i = 0; i < x.length; i += 16)
  {
  var olda = a;
  var oldb = b;
  var oldc = c;
  var oldd = d;
  var olde = e;
 
  for(var j = 0; j < 80; j++)
  {
   if(j < 16) w[j] = x[i + j];
   else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
   var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
           safe_add(safe_add(e, w[j]), sha1_kt(j)));
   e = d;
   d = c;
   c = rol(b, 30);
   b = a;
   a = t;
  }
 
  a = safe_add(a, olda);
  b = safe_add(b, oldb);
  c = safe_add(c, oldc);
  d = safe_add(d, oldd);
  e = safe_add(e, olde);
  }
  return Array(a, b, c, d, e);
 
}
 
function sha1_ft(t, b, c, d)
{
  if(t < 20) return (b & c) | ((~b) & d);
  if(t < 40) return b ^ c ^ d;
  if(t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
}
 
function sha1_kt(t)
{
  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
         (t < 60) ? -1894007588 : -899497514;
}
 
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}
 
function rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}
 
function str2binb(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
  bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
  return bin;
}
 
function binb2b64(binarray)
{
  var tab = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789?!#@&$";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i += 3)
  {
  var triplet = (((binarray[i >> 2] >> 8 * (3 - i%4)) & 0xFF) << 16)
           | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
           |  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
  for(var j = 0; j < 4; j++)
  {
   if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
   else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
  }
  }
  return str;
}
 
function ensurenumberandletter(s) {
     var numbers = "123456789";
     var letters = "ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
     var punct = "?!#@&$";
     var hasnumber = 0;
     var hasletter = 0;
     var haspunct = 0;
 
     for (var i = 0; i < s.length; i++) {
         if (numbers.indexOf(s[i]) > -1)
             hasnumber = 1;
         if (letters.indexOf(s[i]) > -1)
             hasletter = 1;
         if (punct.indexOf(s[i]) > -1)
             haspunct = 1;
     }
     if (hasnumber == 0)
         s = "1" + s.substring(1);
     if (hasletter == 0)
         s = s.substring(0, 1) + "a" + s.substring(2);
     if (haspunct == 0)
         s = s.substring(0, 2) + "@" + s.substring(3);
 
     return s;
}

function check_password(req,res,pwd) {
	 oracle.connect(connectData, function(err, connection) {
		    if ( err ) {
		    	console.log(connection);
		    } else {
			  	// selecting rows
			  	connection.execute("SELECT userid, firstname, passwd FROM users WHERE email='"+username+"'", 
			  			   [], 
			  			   function(err, results) {
			  	    if ( err ) {
			  	    	console.log(err);
			  	    } else {
			  	    	if((results.length != 0) && results[0].PASSWD == pwd)
			  	    	{
			  	    		connection.close(); // done with the connection
			  	    		userid = results[0].USERID;
			  	    		req.session.userid = userid;
			  	    		console.log("userid is "+req.session.userid);
			  	    		user_display_name = results[0].FIRSTNAME;
                  req.session.userAuthenticated = true;
			  	    		redirect_to_home(req, res);
			  	    	}
			  	    	else
			  	    		res.render('index.jade',
			  	   			   { title: 'Welcome to Pennterest!',
			  	    			msg: "Invalid username or password" }
			  	   		  );

			  	    }
			
			  	}); // end connection.execute
		    }
		  }); // end oracle.connect
}

function redirect_to_home (req, res){

  console.log("Session started. Redirecting user to home page");
  res.writeHead(301, {Location: '/home?id=' + req.session.userid});
  res.end();
}

exports.do_work = function(req, res){
    console.log("LOGIN PAGE!:");
    console.log("SESSION AUTH: " + req.session.userAuthenticated);
    console.log("SESSION user_id: " + req.session.userid);
     
    /* When the user is logging in for the first time */
		username = req.body.username;
		generatehash(req,res,req.body.password,"SHA");
		//req.session.userid = userid;
		//console.log(req.session.userid);
};