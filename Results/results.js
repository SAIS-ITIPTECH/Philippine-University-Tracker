let type =localStorage.getItem("type");
let allUni= JSON.parse(localStorage.getItem("allUni"));
let title = document.getElementById("title")
let container = document.getElementById("container")
console.log(allUni)


switch(type){
    case "search":
        title.innerHTML = "Results for: "
        let querry = localStorage.getItem("querry")
        displayResults(searchUniversity(querry))
        break;

    case "university":
        title.innerHTML = "Universities: "
        displayResults(typeIdentifier('university'))
        break;

    case "college":
        title.innerHTML = "Colleges: "
        displayResults(typeIdentifier('college'))
    break;
}

function searchUniversity(querry){
    let results = []
    Object.values(allUni).forEach((a) =>{
        for(let i = 0; i< a.length; i++){
            if(new RegExp(querry, "i").test(a[i].name)){
                results.push(a[i])
            }
        }
    });
    return results
}

function typeIdentifier(type){
    let results = []
    let total = 0
    Object.values(allUni).forEach((a) =>{
        for(let i = 0; i< a.length; i++){
            if(a[i].type.toLowerCase() == type.toLowerCase()){
                results.push(a[i])
            }
        }
        
    });
    return results
}

function displayResults(results){
    results.forEach(content =>{
    const container = document.getElementById("container")
        //Create new container
        uniInfo = document.createElement('div');
        uniInfo.className = 'uniInfoContainer';
        container.appendChild(uniInfo)

        //Create new name
        uniName = document.createElement('p');
        uniName.class = 'uniName';
        uniName.innerHTML = `<b>${content['name']}</b> `;

        //Create new typw
        uniType = document.createElement('p');
        uniType.class = 'uniName';
        uniType.innerHTML = `Type: ${content['type']}`;

        //Create new location
        uniLocation = document.createElement('p')
        uniLocation.class = 'uniLocation';
        uniLocation.innerHTML = `Location: ${content['location']}`;

        //Go to website button
        uniWeb = document.createElement('Button')
        uniWeb.class = 'uniWebButton';
        uniWeb.innerHTML = 'visit website';
        uniWeb.addEventListener("click", async (event) => {
            let url = await search(content['name'])
            window.open(url);
        })

        //Add name and location on container
        uniInfo.append(uniName, uniType, uniLocation , uniWeb)
    });
}