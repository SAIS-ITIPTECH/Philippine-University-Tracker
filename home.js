const regionsContainer = document.getElementById("regionsContainer");

//declaration ng array
let regions = [];
let provinces = [];
let cities = [];
let munuiciplaities = [];
let allUni = {};


//kinuha info sa api
Promise.all([
    fetch("https://psgc.cloud/api/regions").then(res => res.json()),
    fetch("https://psgc.cloud/api/provinces").then(res => res.json()),
    fetch("https://psgc.cloud/api/cities").then(res => res.json()),
    fetch("https://psgc.cloud/api/municipalities").then(res => res.json())
])

.then(([r, p, c, m]) => {
    regions = fixEnye(r);
    provinces = fixEnye(p);
    cities = fixEnye(c);
    munuiciplaities = fixEnye(m)
    allUniArrayBuilder()
})

.catch(err => {
    console.error(err);
});

function fixEnye(data){
    data.forEach(element => {
        element.name = element.name.replace('Ã±', '\u00f1')
    });
    return data
}

async function allUniArrayBuilder(){
    let index = 1
    console.log("wait")
    for(let i = 1; i < 49; i += 3){
        let regUni = await regUniArrayBuilder(i)
        if(index < 10) allUni["0" + index] = regUni
        else allUni[index] = regUni
        index++
    }
    console.log("done")
}

async function regUniArrayBuilder(ind){
    let response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&format=json&page=List of colleges and universities in the Philippines&prop=text&section=${ind}&disabletoc=1&origin=*`)
    let data = await response.json()
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.parse.text["*"], "text/html");
    const rows = doc.querySelectorAll("table.wikitable tbody tr");

    let regUni = []
    rows.forEach((row, index) => {
        if (index === 0) return;
        const cells = row.querySelectorAll("td");

        let name
        let location
        let type

        // For Public Schools
        if (cells.length == 6){
            name = cells[0].innerText.trim();
            location = cells[2].innerText.trim();//location info from wiki. ie. rodriguez, rizal
            type = getUniType(name)
            regUni.push({name, location, type})
        }

        else if (cells.length == 5){
            name = cells[0].innerText.trim();
            location = cells[1].innerText.trim();//location info from wiki. ie. rodriguez, rizal
            type = getUniType(name)
            regUni.push({name, location, type})
        }
    });
    return regUni
}


function getUniType(name){
    if(new RegExp('university', "i").test(name)){
        return "University"
    }

    else if(new RegExp('unibersidad', "i").test(name)){
        return "University"
    }

    else if(new RegExp('universidad', "i").test(name)){
        return "University"
    }

    else if(new RegExp('pamantasan', "i").test(name)){
        return "University"
    }
    
    else{
        return "College"
    }   
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
    Object.values(allUni).forEach((a) =>{
        for(let i = 0; i< a.length; i++){
            console.log(a[i].type.toLowerCase() == type.toLowerCase())
            if(a[i].type.toLowerCase() == type.toLowerCase()){
                results.push(a[i])
            }
        }
    });
    return results
}

function getUniUnderRegion(regionCode, municipalities){
    let results = []
    allUni[regionCode].forEach((content) =>{
        let plainLocation = content.location.match(/^([^,]+)/)//takes the municipality name. ie. rodriguez,rizal => rodriguez
        plainLocation = plainLocation[1].replace('sta.', 'santa')  
        plainLocation = plainLocation.replace('sto.', 'santo')       
        let regexLocation = new RegExp(`\\b${plainLocation}\\b`, 'i')//make regex searching for municpality. ie. rodriguez rizal
        
        //for manila only, checks if uni is in manila
        if (content.location.toLowerCase().includes(municipalities.toLowerCase())){
            results.push(content)
        }
        //check if municpality is included to the list of municpality in a provinces. ie rodriguez in "rodriguez san mateo antipolo..."
        else if(municipalities.match(regexLocation)){
            results.push(content)
        }
    })
}

function findUniversity(){
    console.log("cliked")
    localStorage.setItem("regions", JSON.stringify(regions))
    localStorage.setItem("provinces", JSON.stringify(provinces))
    localStorage.setItem("munuiciplaities", JSON.stringify(munuiciplaities))
    localStorage.setItem("cities", JSON.stringify(cities))
    localStorage.setItem("allUni", JSON.stringify(allUni))
    window.open("../Find-University/");
}

document.getElementById("find").addEventListener("click", ()=>{
    findUniversity();
})

function results(type){
    console.log("cliked")
    localStorage.setItem("type", type)
    localStorage.setItem("allUni", JSON.stringify(allUni))
    localStorage.setItem("querry", document.getElementById("querry").value)
    window.open("Results/index.html");
}

const buttons = document.querySelectorAll(".results"); // select all elements with class

buttons.forEach(button => {
    button.addEventListener("click", (event) => {
        results(event.target.value);
    });
});

