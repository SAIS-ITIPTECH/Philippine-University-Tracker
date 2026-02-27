const buttons = document.querySelectorAll(".region-btn");
const contents = document.querySelectorAll(".region-content");

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const targetId = button.getAttribute("data-target");
        const targetContent = document.getElementById(targetId);

        contents.forEach(content => {
            if (content !== targetContent) {
                content.classList.remove("show");
            }
        });

        targetContent.classList.toggle("show");
    });
});
