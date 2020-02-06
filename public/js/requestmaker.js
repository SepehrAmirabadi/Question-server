
function makeRequest(){
	req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4){
			let resultDiv = document.getElementById("response");
			
			resultDiv.innerHTML = "Status: " + this.status + "<br>";
			resultDiv.innerHTML += "Response Body: " + this.responseText;
			
			if (JSON.parse(this.responseText).results[0] == null) {
				alert ("either there were not enough questions to meet your request or a query parameter is invalid");
			}
		}
	}
	req.open(document.getElementById("method").value, "http://localhost:3000/" + document.getElementById("url").value);
	req.send();
}