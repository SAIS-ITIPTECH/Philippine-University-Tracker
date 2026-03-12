document.getElementById("searchIcon").addEventListener("click", ()=>{
    localStorage.setItem("allUni", JSON.stringify(allUni))
    localStorage.setItem("query", document.getElementById("query").value)
    window.location.href = "Find-University/index.html";
})

const filteredButtons = document.querySelectorAll(".filtered"); // select all elements with class

filteredButtons.forEach(button => {
    button.addEventListener("click", (event) => {
        localStorage.setItem("filter", event.target.value);
        window.location.href = "Find-University/index.html"
    });
});

