const express = require ('express');
const fs = require ('fs'); 
const uuid = require('uuid/v4');

// initiazing index.html with express
let app = express();
app.use(express.static("public"));
app.use (express.json()); 


//eventhandlers
app.get('/questions',getQ);
app.get('/sessions',getSesh);
app.post('/sessions',postSesh);
app.delete ('/sessions/*',deleteSesh); 



// gets the questions the client asks for 
function getQ (req,res,next) {
	
	// variable declerations 
	let questions = []; 
	let query = req.query; 
	let limit = 10;
	let stat = 1; 
	let stat2 = 200; 
	let possible = true; 
	let unusablequestions = []; 

		
		
	// if the user has inputed any query parameters it runs the code below
	if (Object.keys(req.query).length != 0) {
		
		// varaiable declerations 
		let limittemp = 10;  // if the query parameter limit is invalid we use this by default
		limit = req.query.limit;
		let diff = req.query.difficulty;
		let category = req.query.category; 
		let token = req.query.token; 
		let notoken=true; 
		
		if (limit != null) {limittemp = limit;} // sets the limittemp variable to limit if limit exists
		
		
		// calculates if the server has enough questions with the specified paramaters 
		//sets the possible variable to false if it does not 
		//possible variable is used later to handle invalid requests
		function isPossible() {

			let counter = 0; // keeps track of the number of valid questions 
			
			// iterates through every question on the file system and determines if it meets the parameter requirments
			//if it meets the requirments counter is incremented
			for (let i = 1; i<501; i++) {
				
			//if the question number is a number that has previously been used it will not run the following
			//otherwise it will test the other requirements
			if (unusablequestions.includes(i) == false) {
				
				// opening the question files syncronously and extracting data
				let path = 'questions/'+ i + '.txt'
				let data = 	fs.readFileSync (path);
				let question = JSON.parse(data); 
				
				// if the category and difficulty params exist it tests both 
				//it only increments the counter if the category and difficulty of the question matches whats requested
				if (category != null && diff !=null) {
					if (category == question.category_id && diff == question.difficulty_id) {
						counter++;
					}
				}
				// if the category param exist it tests both 
				//it only increments the counter if the category  of the question matches whats requested
				else if (category != null) {
					if (category == question.category_id) {
						counter++;
					}
				}
				// if the  difficulty params exist it tests both 
				//it only increments the counter if the difficulty of the question matches whats requested
				else if (diff != null) {
					if (diff == question.difficulty_id){
						counter++;
					}
				}
				// if there are no additional param it increments counter
				else {
					counter++;
				}
			}
		}
			
			possible = limittemp<=counter; // set the value of possible to false if the counter is less than the limit parameter
		}
		
		
		// if token exisits it pulls the infomation from that session file
		//it then send all the previously used questions to an unUsableQuestion Array
		//this is used to make sure a session never gets the same question twice
		if (token != null){
			try {
			let data = fs.readFileSync("sessions/" + token+ ".json"); 
				JSON.parse(data).questions.forEach(function (question){
						unusablequestions.push(question); 
				})
			}
			catch(err) {
				possible = false;
				console.log("the token was invalid"); 
				stat = 2; 
			}
		}
		
		//determines if based on the given query paramaters the request is possible 
		//handles invalid query params by simply not returning a list and setting the status to 1
		if (possible == true) {
			isPossible();
			if (!possible) {console.log("not enough questions");}
		}

		if (limit != null && (limit >500 || limit<0)) {
			possible = false; 
		}
		if (diff != null && (diff !=1 && diff != 2 && diff !=3)) {
			possible = false; 
		}
		if (category != null && ((category<0)&&(category>24))) {
			possible = false; 
		}
		
		
		let count = 0; 
		let num
		
		// uses a random number generator to pick a number and test it against the query params 
		// if it passes the testing it is added to the questions array which is later ouput to the user
		while(count <limittemp && possible == true) {
			num = Math.ceil(Math.random() *500); // random num between 1 -500
			
			// checks to see if the number has previously been used by the session
			//if no session was specified it tests it against an empty array
			// if the question was not previously served it tests the other params
			if (unusablequestions.includes(num) == false) {
				
				// opening and reading the question file
				let path = 'questions/'+ num + '.txt'
				let data = 	fs.readFileSync (path);
				let question = JSON.parse(data); 
				
				// if the category and difficulty params exist it tests both 
				//it only increments the counter if the category and difficulty of the question matches whats requested
				if (category != null && diff !=null) {
					if (category == question.category_id && diff == question.difficulty_id) {
						questions.push (question); 
						unusablequestions.push(num);
						count++;
					}
				}
				// if the category param exist it tests both 
				//it only increments the counter if the category  of the question matches whats requested
				else if (category != null) {
					if (category == question.category_id) {
						questions.push (question); 
						unusablequestions.push(num);
						count++;
					}
				}
				// if the  difficulty params exist it tests both 
				//it only increments the counter if the difficulty of the question matches whats requested
				else if (diff != null) {
					if (diff == question.difficulty_id){
						questions.push (question); 
						unusablequestions.push(num);
						count++;
					}
				}
				// if there are no additional param it increments counter
				else {
					questions.push (question); 
					unusablequestions.push(num);
					count++;
				}
			}
			
		}
		
		// sets the status code to 0 if the while loop completed with no interuptions
		if (count >=limit) {
			stat = 0;
		}
		
		// updates the session json with all the new questions that have been served
		if (possible && token != null){
			let json =JSON.stringify({ ID : token, questions: unusablequestions});
			fs.writeFileSync('sessions/' + token+ ".json",json)
			console.log("the session file has been updated");
		}

		// sends the json to the client
		res.json({status:stat , results: questions}); 
		console.log(possible);
	}
	else {
		// if there is no query params it prints 10 random questions 
		let count = 0; 
		let num
		while(count <10) {
			num = Math.ceil(Math.random() *500);
			let path = 'questions/'+ num + '.txt'
			let data = 	fs.readFileSync (path);
			questions.push (JSON.parse(data)); 
			count++;
		}
		res.json({status: 0, results: questions}); 
		res.status = stat2; 
		
	}
		
		next();
	
}

// creates a json file and populates it with the appropriate json object
function postSesh (req,res,next) {
	let id = uuid (); 
	let json =JSON.stringify({ ID : id, questions: []});
	fs.writeFileSync('sessions/' + id + ".json",json)
	res.status(201).send (id); 
	console.log("a new session was created with id: " + id );
}


// iterates thorugh the sessions in the session folder and returns an array containing all their id's 
function getSesh (req,res,next) {
	let sessions = [] ; 
	fs.readdir('sessions', function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    files.forEach(function (file) {
        let data= fs.readFileSync('sessions/' +file);
		let id = JSON.parse(data).ID; 
		sessions.push(id);
    });
	 res.status(200).send(sessions); 
	 console.log("sucssesfully sent the list of sessions");
	});
}

// deletes the json file for a session if it is valid otherwise it return a status of 404
function deleteSesh (req,res,next) {   
	let id = (req.url).substr(10);
	//console.log(id);
	fs.unlink( 'sessions/'+id +'.json', function (err) {
	  if (err) {res.status(404).send("session does not exist");}
	  else {
		console.log('File and session deleted!');
		res.status(200).send("removed the session sucssesfully");
	  }
	});
}


// designates the port the server is on 
app.listen(3000); 
console.log("server running at port 3000");