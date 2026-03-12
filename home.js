document.getElementById("searchIcon").addEventListener("click", ()=>{
    localStorage.setItem("query", document.getElementById("query").value)
    window.location.href = "Find-University/index.html";
})