// 1. Initialize EmailJS
emailjs.init({publicKey: "grh1BJmsO_p19oKHs"});

// 2. Listen for the submit
const myForm = document.getElementById("contactForm");

if (myForm) {
    myForm.addEventListener("submit", function(event) {
        // 3. STOP the page from refreshing/changing the URL
        event.preventDefault();

        const templateParams = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            subject: document.getElementById("subject").value,
            message: document.getElementById("message").value
        };

        // 4. Send the email
        emailjs.send("service_lfbii0h", "template_9vm5tmv", templateParams)
            .then(function() {
                alert("Sent successfully!");
                myForm.reset();
            }, function(error) {
                alert("Error: " + JSON.stringify(error));
            });
    });
} else {
    console.error("Could not find the form! Check your ID.");
}