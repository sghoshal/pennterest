var connectData = { 
  "hostname": "cis550project.c2vffmuf4yhs.us-east-1.rds.amazonaws.com", 
  "user": "CIS550", 
  "password": "databaseproject", 
  "database": "CIS550" };
var oracle =  require("oracle");

var http = require('http');
var express = require('express');
var app = express();

var userid = null;
var max_score = 0;
var trial = null;
var photo_id = null;
var rec_photos = new Array();
var rec_photos_avg_rating = new Array();
var rec_photos_pin_count = new Array();
var rec_ppl = new Array();


function recommend_first(res)
{
	oracle.connect(connectData, function(err, connection) {
	    if ( err ) {
	    	console.log(connection);
	    } else {

		  	
		  	connection.execute("SELECT PHOTOID,AVG_RATING,PIN_COUNT,URL FROM PHOTO WHERE PHOTOID IN " +
		  			"(SELECT PHOTOID FROM PHOTO NATURAL JOIN TAG WHERE TAGVALUE IN " +
		  			"(SELECT TAGVALUE FROM TAG WHERE PHOTOID IN " +
		  			"(SELECT PHOTOID FROM RATING WHERE SCORE IN " +
		  			"(SELECT MAX(SCORE) FROM RATING WHERE USERID="+userid+")) " +
		  					"INTERSECT " +
		  					"SELECT INTERESTVALUE FROM INTEREST WHERE USERID="+userid+") AND PHOTOID NOT IN" +
		  							"(SELECT PHOTOID FROM PIN WHERE USERID="+userid+")) " +
		  									"ORDER BY AVG_RATING*PIN_COUNT DESC, PIN_COUNT ASC", 
		  			   [], 
		  			   function(err, results) {
		  		if(results.length == 0)
		  		{
		  			console.log("no photo found in first");
		  			recommend_second(res);
	  	    	}
		  	else if ( err ) {
		  	    	console.log(err);
		  	    } 
		  	else {
		  	    		trial=Math.floor(Math.random()*results.length);
		  	    		
		  	    		for(var i = 0;i<results.length;i++)
		  	    		{
		  	    			rec_photos[i] = results[i].URL;
		  	    			rec_photos_avg_rating[i] = results[i].AVG_RATING;
		  	    			rec_photos_pin_count[i] = results[i].PIN_COUNT;
		  	    		    console.log("\nphoto url="+rec_photos[i]);
		  	    		}
		  	    		connection.close();
		  	    		console.log("length of rec_photos is "+rec_photos.length);
		  	    		if(rec_photos.length < 10)
		  	    			recommend_second(res);
		  	    		else
		  	    			recommend_people(res);
		  	    }
		
		  	}); // end of connection.execute
	    }
	  }); // end oracle.connect
}

function recommend_second(res)
{
	oracle.connect(connectData, function(err, connection) {
	    if ( err ) {
	    	console.log(connection);
	    } else {

		  	
		  	connection.execute("SELECT PHOTOID,AVG_RATING,PIN_COUNT,URL FROM PHOTO WHERE PHOTOID IN " +
		  			"(SELECT PHOTOID FROM PHOTO NATURAL JOIN TAG WHERE TAGVALUE IN " +
		  			"(SELECT TAGVALUE FROM TAG WHERE PHOTOID IN " +
		  			"(SELECT PHOTOID FROM PIN WHERE USERID="+userid+") " +
		  					"INTERSECT " +
		  					"SELECT INTERESTVALUE FROM INTEREST WHERE USERID="+userid+") AND PHOTOID NOT IN " +
		  							"(SELECT PHOTOID FROM PIN WHERE USERID="+userid+")) " +
		  									"ORDER BY AVG_RATING*PIN_COUNT DESC, PIN_COUNT ASC",
 
		  			   [], 
		  			   function(err, results) {
		  		if(results.length == 0)
		  		{
		  			console.log("no photo found in second");
		  			recommend_third(res);
	  	    	}
		  	else if ( err ) {
		  	    	console.log(err);
		  	    } 
		  	else {
		  	    		trial=Math.floor(Math.random()*results.length);
		  	    		
		  	    		for(var j=0;j<results.length;j++)
		  	    		{  var count = 0;
		  	    			for(var k=0;k<rec_photos.length;k++)
		  	    			{
		  	    			if(rec_photos[k] == results[j].URL)
		  	    				count++;
		  	    			}
		  	    			if(count==0)
			  	    			{
		  	    				rec_photos.push(results[j].URL);
		  	    				rec_photos_avg_rating.push(results[j].AVG_RATING);
		  	    				rec_photos_pin_count.push(results[j].PIN_COUNT);
		  	    				console.log(results[j].URL);
			  	    			}
		  	    		 
		  	    		}
		  	    		connection.close();
		  	    		
		  	    		console.log("length of rec_photos 2 is "+rec_photos.length);
		  	    		if(rec_photos.length < 10)
		  	    			recommend_third(res);
		  	    		else
		  	    			recommend_people(res);
		  	    }
		
		  	}); // end of connection.execute
	    }
	  }); // end oracle.connect
}


function recommend_third(res)
{
	oracle.connect(connectData, function(err, connection) {
	    if ( err ) {
	    	console.log(connection);
	    } else {

		  	
		  	connection.execute("SELECT PHOTOID,AVG_RATING,PIN_COUNT,URL FROM PHOTO WHERE PHOTOID IN " +
		  			"(SELECT PHOTOID FROM PHOTO NATURAL JOIN TAG WHERE TAGVALUE IN " +
		  			"(SELECT INTERESTVALUE AS TAGVALUE FROM INTEREST WHERE USERID="+userid+")) AND PHOTOID NOT IN " +
		  					"(SELECT PHOTOID FROM PIN WHERE USERID="+userid+") " +
		  							"ORDER BY AVG_RATING*PIN_COUNT DESC, PIN_COUNT ASC",
 
		  			   [], 
		  			   function(err, results) {
		  		if(results.length == 0)
		  		{
		  			console.log("no photo found in third");
		  			recommend_fourth(res);
	  	    	}
		  	else if ( err ) {
		  	    	console.log(err);
		  	    } 
		  	else {
		  	    		trial=Math.floor(Math.random()*results.length);
		  	    		
		  	    		for(var j=0;j<results.length;j++)
		  	    		{ var count = 0;
		  	    			for(var k=0;k<rec_photos.length;k++)
		  	    			{
		  	    			if(rec_photos[k] == results[j].URL)
		  	    				count++;
		  	    			}
		  	    			if(count==0)
			  	    			{
		  	    				rec_photos.push(results[j].URL);
		  	    				rec_photos_avg_rating.push(results[j].AVG_RATING);
		  	    				rec_photos_pin_count.push(results[j].PIN_COUNT);
		  	    				console.log(results[j].URL);
			  	    			}
		  	    		 
		  	    		}
		  	    		connection.close();
		  	    		
		  	    		console.log("length of rec_photos 3 is "+rec_photos.length);
		  	    		if(rec_photos.length < 10)
		  	    			recommend_fourth(res);
		  	    	else
		  	    			recommend_people(res);
		  	    }
		
		  	}); // end of connection.execute
	    }
	  }); // end oracle.connect
}



function recommend_fourth(res)
{
	oracle.connect(connectData, function(err, connection) {
	    if ( err ) {
	    	console.log(connection);
	    } else {

		  	
		  	connection.execute("SELECT PHOTOID,AVG_RATING,PIN_COUNT,URL FROM PHOTO WHERE PHOTOID IN " +
		  			"(SELECT PHOTOID FROM PHOTO NATURAL JOIN TAG WHERE TAGVALUE IN " +
		  			"(SELECT TAGVALUE FROM TAG WHERE PHOTOID IN " +
		  			"(SELECT PHOTOID FROM PIN WHERE USERID="+userid+"))) AND PHOTOID NOT IN " +
		  					"(SELECT PHOTOID FROM PIN WHERE USERID="+userid+") " +
		  							"ORDER BY AVG_RATING*PIN_COUNT DESC, PIN_COUNT ASC",
 
		  			   [], 
		  			   function(err, results) {
		  		if(results.length == 0)
		  		{
		  			console.log("no photo found in fourth");
		  			recommend_fourth(res);
	  	    	}
		  	else if ( err ) {
		  	    	console.log(err);
		  	    } 
		  	else {
		  	    		trial=Math.floor(Math.random()*results.length);
		  	    		
		  	    		for(var j=0;j<results.length;j++)
		  	    		{ var count = 0;
		  	    			for(var k=0;k<rec_photos.length;k++)
		  	    			{
		  	    			if(rec_photos[k] == results[j].URL)
		  	    				count++;
		  	    			}
		  	    			if(count==0)
			  	    			{
		  	    				rec_photos.push(results[j].URL);
		  	    				rec_photos_avg_rating.push(results[j].AVG_RATING);
		  	    				rec_photos_pin_count.push(results[j].PIN_COUNT);
		  	    				console.log(results[j].URL);
			  	    			}
		  	    		 
		  	    		}
		  	    		connection.close();
		  	    		
		  	    		console.log("length of rec_photos 4 is "+rec_photos.length);
		  	    		if(rec_photos.length < 10)
		  	    			recommend_fifth(res);
		  	    		else
		  	    			recommend_people(res);
		  	    }
		
		  	}); // end of connection.execute
	    }
	  }); // end oracle.connect
}


function recommend_fifth(res)
{
	oracle.connect(connectData, function(err, connection) {
	    if ( err ) {
	    	console.log(connection);
	    } else {

		  	
		  	connection.execute("SELECT PHOTOID,AVG_RATING,PIN_COUNT,URL FROM PHOTO WHERE PHOTOID NOT IN" +
		  			"(SELECT PHOTOID FROM PIN WHERE USERID="+userid+")"+
		  			" AND AVG_RATING > 4.5 " +
		  			"ORDER BY AVG_RATING*PIN_COUNT DESC, PIN_COUNT ASC",
 
		  			   [], 
		  			   function(err, results) {
		  		if(results.length == 0)
		  		{
		  			console.log("no photo found in fifth");
		  			
	  	    	}
		  	else if ( err ) {
		  	    	console.log(err);
		  	    } 
		  	else {
		  	    		trial=Math.floor(Math.random()*results.length);
		  	    		
		  	    		for(var j=0;j<results.length;j++)
		  	    		{ var count = 0;
		  	    			for(var k=0;k<rec_photos.length;k++)
		  	    			{
		  	    			if(rec_photos[k] == results[j].URL)
		  	    				count++;
		  	    			}
		  	    			if(count==0)
			  	    			{
		  	    				rec_photos.push(results[j].URL);
		  	    				rec_photos_avg_rating.push(results[j].AVG_RATING);
		  	    				rec_photos_pin_count.push(results[j].PIN_COUNT);
		  	    				console.log(results[j].URL);
			  	    			}
		  	    			
		  	    		 
		  	    		}
		  	    		connection.close();
		  	    		
		  	    		console.log("length of rec_photos 5 is "+rec_photos.length);
		  	    		//if(rec_photos.length < 10)
		  	    		//	recommend_fifth(res);
		  	    		//else
		  	    		}
		  	    			recommend_people(res);
		  	    
		
		  	}); // end of connection.execute
	    }
	  }); // end oracle.connect
}

function recommend_people(res)
{
	oracle.connect(connectData, function(err, connection) {
	    if ( err ) {
	    	console.log(connection);
	    } else {

		  	
		  	connection.execute("SELECT FIRSTNAME, LASTNAME FROM USERS NATURAL JOIN INTEREST WHERE INTERESTVALUE IN (SELECT INTERESTVALUE FROM INTEREST WHERE USERID="+userid+") AND USERID <> "+userid+" AND ROWNUM<10", 
		  			   [], 
		  			   function(err, results) {
		  		if(results.length == 0)
		  		{
		  			console.log("no ppl with similar interests");
		  			display_recommended(res);
	  	    	}
		  	else if ( err ) {
		  	    	console.log(err);
		  	    } 
		  	else {
		  			rec_ppl = results;
		  	    	display_recommended(res);	
		  	    }
		
		  	}); // end of connection.execute
	    }
	  }); // end oracle.connect
}



function display_recommended(res)
{
	console.log("here....");
	res.render('recommendation.jade',
  			   { title: 'Photos you may like....',
   				 rec_photos: rec_photos,
   				 rec_photos_avg_rating: rec_photos_avg_rating,
   				 rec_photos_pin_count: rec_photos_pin_count,
  				 rec_ppl: rec_ppl,
   				 
   				 }
  		  );	
}


exports.do_work = function(req, res){
	
	userid = req.session.userid;
	recommend_first(res);
	
};