
document.addEventListener("DOMContentLoaded", function (){
    
    emailjs.init({publicKey: "grh1BJmsO_p19oKHs"})

    const myForm = document.getElementById("contactForm");

    if (myForm) {
        myForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const templateParams = {
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                subject: document.getElementById("subject").value,
                message: document.getElementById("message").value
            };

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

});
