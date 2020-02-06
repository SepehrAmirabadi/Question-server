Name: Sepehr eslami amirabadi
Id :101112474 

Instructions: 
- run QuestionServer.js
- then open as many localhost:3000 instances as you want
	- you can only visit localhost:3000/ , localhost:3000/index.html, localhost:3000/questions, localhost:3000/sessions
- you can then test it however you want :the following is an example
- click on the dropdown beside the word method
-*if any invalid request urls are used it simply wont get it. it will return a status of 404 and a prompt
- pick get: then enter questions in the textbox and click submit
	- you can then test this with query parameters limit and category 
	- ex. type: questions?limit=someint(must be less that 501)&category= 1(must be between 1-12)
	- when you do this you will only get questions with the specified paramaters 
	- the status code will be 200
- pick Post: then enter sessions in the textbox and click submit
	- this produces a json file for a new session
	- you can open the file and look at its contents from the session folder in my assignment3
	- it should be empty 
	- then you can create a new get request to /questions with your id as a token paramter
		- ex. questions?limit=someint(must be less that 501)&category= 1(must be between 1-12)&token=idOfSession
- pick Get: then enter sessions in the textbox and click submit
	- you will recive a list of the id's of all the sessions that have been created 
	- you can confirm this bu looking in the sessions folder in assignment3
	- you should see a status code of 200
- pick delete: then enter sessions/:the_session_id_you_want_to_delete
	- if the session did not exist the status will be 404
	- otherwise the satus will be 200
	- you can confirm this is working using get session or by checking the sessions folder
- put has no functionality because the assignment does not require it


Design choices: 

- i chose to be flexible with what the user could enter
	- invalid params will notify the user that they are invalid and will return an empty array with the correct status code in the json object
	- if no questions are found that match the params it will return the json object with an empty array 

- if there are no sessions get sessions will return an empty array instead of crashing and giving 404 status
- i chose to store my session info in json files
- i read and write to files synchronosly throughout the entire program
-keep in mind that some categories have very few questions 
	-so if the server wont get the questions it is because there are not enough
	- category 1 and 2 dont have many but category 4 has lots






