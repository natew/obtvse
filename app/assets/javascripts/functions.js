$(function() {
	var textarea = document.getElementById("post_content");

	if (textarea) {
		textarea.onkeydown = function() {
		  textarea.style.height = ""; /* Reset the height*/
		  textarea.style.height = textarea.scrollHeight + "px";
		};
	}
});