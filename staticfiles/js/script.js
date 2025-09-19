document.addEventListener("DOMContentLoaded", function() {
    console.log("JavaScript Loaded!");

    const messageButton = document.getElementById("messageBtn");
    if (messageButton) {
        messageButton.addEventListener("click", function() {
            alert("Hello! This is a message from JavaScript.");
        });
    }
});

