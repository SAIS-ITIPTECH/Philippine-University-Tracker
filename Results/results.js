import { search } from "../SearchAPI/search.js";

let allUni= JSON.parse(localStorage.getItem("allUni"));
console.log(allUni)

searchUniversity()

function searchUniversity(){
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


function displayResults(results, uniDisplay, name, type, location){
    results.forEach(content =>{
        
        const uniDisplay = document.getElementById("universities");

        //Create new container
        let uniInfo = document.createElement('div');
        uniInfo.className = 'uniInfoContainer';
        uniDisplay.appendChild(uniInfo);

        let topRow = document.createElement('div');
        topRow.className = 'uniTopRow'; 

        //Create new name
        let uniName = document.createElement('p');
        uniName.className = 'uniName';
        uniName.innerHTML = `${content['name']}`;

        let buttonGroup = document.createElement('div');
        buttonGroup.className = 'uniButtonGroup';

        let uniWeb = document.createElement('button');
        uniWeb.className = 'uniWebButton';
        uniWeb.innerHTML = 'visit website';
        uniWeb.addEventListener("click", async () => {
            let url = await search(name, location);
            window.open(url);
        });

        let uniMap = document.createElement('button');
        uniMap.className = 'uniWebButton';
        uniMap.innerHTML = 'see on maps';
        uniMap.addEventListener("click", () => window.open(`https://www.google.com/maps/search/${name}, ${location}`));

        buttonGroup.append(uniWeb, uniMap);
        topRow.append(uniName, buttonGroup);

        let bottomRow = document.createElement('div');
        bottomRow.className = 'uniBottomRow';

        //Create new location
        let uniType = document.createElement('p');
        uniType.className = 'uniType';
        uniType.innerHTML = `Type: <strong>${content['type']}</strong>`;

        let uniLocation = document.createElement('p');
        uniLocation.className = 'uniLocation';
        uniLocation.innerHTML = `Location: <strong>${content['location']}</strong>`;

        //Go to website button
        

        let uniMap = document.createElement('button');
        uniMap.className = 'uniWebButton';
        uniMap.innerHTML = 'see on maps';
        uniMap.addEventListener("click", () => window.open(`https://www.google.com/maps/search/${name}, ${location}`));

        bottomRow.append(uniType, uniLocation);

        uniInfo.append(topRow, bottomRow);
    });
}