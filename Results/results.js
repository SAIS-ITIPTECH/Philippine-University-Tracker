import { search } from "../SearchAPI/search.js";

let allUni= JSON.parse(localStorage.getItem("allUni"));
let title = document.getElementById("title")
console.log(allUni)

searchUniversity()

function searchUniversity(){
    title.innerHTML = "Results for: "
    let querry = localStorage.getItem("querry")

    let results = []
    Object.values(allUni).forEach((a) =>{
        for(let i = 0; i< a.length; i++){
            if(new RegExp(querry, "i").test(a[i].name)){
                results.push(a[i])
            }
        }
    });
    
    displayResults(results)
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
        let uniInfo = document.createElement('div');
        uniInfo.className = 'uniInfoContainer';
        container.appendChild(uniInfo)

        //Create new name
        let uniName = document.createElement('p');
        uniName.class = 'uniName';
        uniName.innerHTML = `<b>${content['name']}</b> `;

        //Create new typw
        let uniType = document.createElement('p');
        uniType.class = 'uniName';
        uniType.innerHTML = `Type: ${content['type']}`;

        //Create new location
        let uniLocation = document.createElement('p')
        uniLocation.class = 'uniLocation';
        uniLocation.innerHTML = `Location: ${content['location']}`;

        //Go to website button
        let uniWeb = document.createElement('Button')
        uniWeb.class = 'uniWebButton';
        uniWeb.innerHTML = 'visit website';
        uniWeb.addEventListener("click", async (event) => {
            let url = await search(content['name'])
            window.open(url);
        })

        let uniMap = document.createElement('Button')
        uniMap.class = 'uniWebButton';
        uniMap.innerHTML = 'see on maps';
        uniMap.addEventListener("click",  () => window.open(`https://www.google.com/maps/search/${name}, ${location}`))

        //Add name and location on container
        uniInfo.append(uniName, uniType, uniLocation , uniWeb, uniMap)
    });
}