const regionsContainer = document.getElementById("regionsContainer");
const provinceContainer = document.getElementById("provinceContainer");


let regions = JSON.parse(localStorage.getItem("regions"));
let provinces = JSON.parse(localStorage.getItem("provinces"));
let cities = JSON.parse(localStorage.getItem("cities"));
let munuiciplaities = JSON.parse(localStorage.getItem("munuiciplaities"));
let allUni = JSON.parse(localStorage.getItem("allUni"));
let filter = localStorage.getItem("filter")


buildRegions();

// hinsdi na buttons gagawin nya, option na sa regions selection
function buildRegions() {

    regionsContainer.innerHTML = '<option value="">Select Region</option>';

    regions.forEach(region => {
        const option = document.createElement("option");
        option.value = region.code.substring(0, 2); // sa value ng option nilalagay yung regionPrefix
        option.textContent = region.name;
        regionsContainer.appendChild(option);
    });
}

//event listener pag iniba mo yung region
regionsContainer.addEventListener("change", (e) => {
    const regionPrefix = e.target.value; 
    
    provinceContainer.innerHTML = '<option value="">Select Province</option>';
    
    if (regionPrefix) {
        loadProvinceOptions(regionPrefix);
    }
});

//dropdown na rin yung province
function loadProvinceOptions(regionPrefix) {
    const matchedProvinces = provinces.filter(p => p.code.startsWith(regionPrefix));
    
    //para sa NCR region
    if (regionPrefix === "13") {
        const ncrUnits = [
            ...cities.filter(c => c.code.startsWith(regionPrefix)),
            ...munuiciplaities.filter(m => m.code.startsWith(regionPrefix))
        ];
        
        ncrUnits.forEach(unit => {
            const option = document.createElement("option");
            option.value = unit.code;
            option.textContent = unit.name.replace(/\b(City of|City)\b\s*/gi, '').trim();
            provinceContainer.appendChild(option);
        });
    } else {
        //para sa normal na province
        matchedProvinces.forEach(p => {
            const option = document.createElement("option");
            option.value = p.code.substring(0, 5); 
            option.textContent = p.name;
            provinceContainer.appendChild(option);
        });
    }
}



//--------------------------------------------------------------------------------------------------------------------

//DI KO NA ALAM TO :<< pa help ako palabasin result sa div id = "universities"



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

function uniSort(res){
    res.sort((a, b) => {
        let nameA = a.name.toLowerCase();
        let nameB = b.name.toLowerCase();

        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });
    return res
}

async function search(name, loc) {
    const query = `${name}, ${loc}, philippines official website'`
    const url = 'https://api.langsearch.com/v1/web-search'

    let response = await fetch(url, {
        method: 'POST', 
        headers: {
            'Authorization' : 'Bearer sk-c399636d05c542a0b1e51e676bf89078', 
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
        "query": query,
        "freshness": "noLimit",
        "summary": false,
        "count": 5
        })
    })
    let data = await response.json();
    console.log(data)
    let keywords = [
        "edu.ph",
        "gov.ph",
        "classmate.ph",
        "wikipedia",
        "noMatch"
    ]

    let uniUrl = ""
    keywords.some(key => {
        if(key == "noMatch"){
            console.log(data.data.webPages.value[0].url)
            uniUrl = data.data.webPages.value[0].url
            return true
        }

        return data.data.webPages.value.some(url =>{
            const regex = new RegExp(`\\b${key}\\b`, "i");
            if(regex.test(url.url)){
                console.log("matched!", url.url)
                uniUrl = url.url
                return true
            }
        })

        }); 

    return uniUrl
}

function getUniUnderRegion(regionCode, municipalities, province){
    let results = []

    console.log(municipalities)

    municipalities.forEach(muni => {
        results.push({})
        results[results.length - 1]["regionName"] = muni
        results[results.length - 1]["uni"] = []
        allUni[regionCode].forEach((content) =>{
            const regex = new RegExp(`\\b${muni}\\b`, "i");
            if(regex.test(content.location)){
                if(filter != "none"){
                    console.log(content.location)
                        if(filter == content.type.toLowerCase()) {
                            console.log("filtered");
                            results[results.length - 1]["uni"].push(content);
                        }
                    }
                    else results[results.length - 1]["uni"].push(content);
                }
        });
    });
   
    const uniDisplay = document.getElementById("universities")

    //Remove the previouse result
    while (uniDisplay.firstChild){
        uniDisplay.removeChild(uniDisplay.firstChild);
    }
    
    //Show results
        results.forEach(a => {
        if(a['uni'].length == 0);
        else{
            let location;
            if(province==undefined) location = a['regionName'];
            else {
                location = `${a['regionName']}, ${province}`
                
                uniTitle = document.createElement('Ttile');
                uniTitle.className = 'muniTitle';
                let title = a["regionName"].toUpperCase()
                uniTitle.innerHTML = title
                uniDisplay.append(uniTitle)
            }

            let uniSorted = uniSort(a["uni"])
            uniSorted.forEach(res =>{
                
                displayUni(uniDisplay, res['name'], res['type'], `${location}`)
            });
        }
    })
}

function displayUni(uniDisplay, name, type, location){
    //Create new name
    uniInfo = document.createElement('div');
    uniInfo.className = 'uniInfoContainer';
    uniDisplay.appendChild(uniInfo)

    uniName = document.createElement('p');
    uniName.class = 'uniName';
    uniName.innerHTML = `<b>${name}</b> `;

    //Create new typw
    uniType = document.createElement('p');
    uniType.class = 'uniName';
    uniType.innerHTML = `Type: ${type}`;

    //Create new location
    uniLocation = document.createElement('p')
    uniLocation.class = 'uniLocation';
    uniLocation.innerHTML = `Location: ${location}`;

    //Go to website button
    uniWeb = document.createElement('Button')
    uniWeb.class = 'uniWebButton';
    uniWeb.innerHTML = 'visit website';
    uniWeb.addEventListener("click", async () => {
        let url = await search(name, location)
        window.open(url);
    })

    uniMap = document.createElement('Button')
    uniMap.class = 'uniWebButton';
    uniMap.innerHTML = 'see on maps';
    uniMap.addEventListener("click",  () => window.open(`https://www.google.com/maps/search/${name}, ${location}`))

    //Add name and location on container
    uniInfo.append(uniName, uniType, uniLocation , uniWeb, uniMap)
    
}


