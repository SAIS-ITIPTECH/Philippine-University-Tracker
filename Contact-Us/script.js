emailjs.init({publicKey: "grh1BJmsO_p19oKHs"});

const contactForm = document.getElementById("contactForm");
const statusModal = document.getElementById("statusModal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");

function showModal(title, message, isError = false) {
    modalTitle.innerText = title;
    modalMessage.innerText = message;
    modalTitle.style.color = isError ? "red" : "#ff5900";
    statusModal.style.display = "flex";
}

function closeModal() {
    statusModal.style.display = "none";
}

if (contactForm) {
    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const templateParams = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            subject: document.getElementById("subject").value,
            message: document.getElementById("message").value
        };

        emailjs.send("service_lfbii0h", "template_9vm5tmv", templateParams)
            .then(function() {
                showModal("Success!", "Sent successfully!");
                contactForm.reset();
            }, function(error) {
                showModal("Error", "Error: " + JSON.stringify(error), true);
            });
    });
}