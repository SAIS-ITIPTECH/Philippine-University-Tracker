const regionsContainer = document.getElementById("regionsContainer");
const provinceContainer = document.getElementById("provinceContainer");
import { search } from "../SearchAPI/search.js";

let regions = JSON.parse(localStorage.getItem("regions"));
let provinces = JSON.parse(localStorage.getItem("provinces"));
let cities = JSON.parse(localStorage.getItem("cities"));
let munuiciplaities = JSON.parse(localStorage.getItem("munuiciplaities"));
let allUni = JSON.parse(localStorage.getItem("allUni"));
let filter = localStorage.getItem("filter")


if(localStorage.getItem("source") == "findUni"){
    buildRegions();
}

// hinsdi na buttons gagawin nya, option na sa regions selection
function buildRegions(){
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

        provinceContainer.addEventListener("change", function() {
            const text = this.options[this.selectedIndex].text;
            getUniUnderRegion(regionPrefix, [text])
        });

    } else {
        //para sa normal na province
        matchedProvinces.forEach(p => {
            const option = document.createElement("option");
            option.value = p.code.substring(0, 5); 
            option.textContent = p.name;
            provinceContainer.appendChild(option);
        });

        provinceContainer.addEventListener("change", function() {
            provinceContainer.value = this.options[this.selectedIndex].value
            const text = this.options[this.selectedIndex].text;
            getUniUnderRegion(regionPrefix, matchMuncipalities(provinceContainer.value), text)
        });
    }
}

function matchMuncipalities(prefix){
    let matchedMuncipalities = []
    munuiciplaities.forEach((a)=>{
        if(a.code.startsWith(prefix)){
            matchedMuncipalities.push(a.name.trim())
        }
    });

    cities.forEach((a)=>{
        if(a.code.startsWith(prefix)){
            let cleaned = a.name.replace(/\b(City of|City)\b\s*/gi, '').trim();
            matchedMuncipalities.push(cleaned)
        }
    });

    matchedMuncipalities.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    console.log(matchedMuncipalities)
    return matchedMuncipalities
}



//--------------------------------------------------------------------------------------------------------------------

//DI KO NA ALAM TO :<< pa help ako palabasin result ng mga universities sa div id = "universities"


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
                
                let uniTitle = document.createElement('Ttile');
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
    let uniInfo = document.createElement('div');
    uniInfo.className = 'uniInfoContainer';
    uniDisplay.appendChild(uniInfo)

    let uniName = document.createElement('p');
    uniName.class = 'uniName';
    uniName.innerHTML = `<b>${name}</b> `;

    //Create new typw
    let uniType = document.createElement('p');
    uniType.class = 'uniName';
    uniType.innerHTML = `Type: ${type}`;

    //Create new location
    let uniLocation = document.createElement('p')
    uniLocation.class = 'uniLocation';
    uniLocation.innerHTML = `Location: ${location}`;

    //Go to website button
    let uniWeb = document.createElement('Button')
    uniWeb.class = 'uniWebButton';
    uniWeb.innerHTML = 'visit website';
    uniWeb.addEventListener("click", async () => {
        let url = await search(name, location)
        window.open(url);
    })

    let uniMap = document.createElement('Button')
    uniMap.class = 'uniWebButton';
    uniMap.innerHTML = 'see on maps';
    uniMap.addEventListener("click",  () => window.open(`https://www.google.com/maps/search/${name}, ${location}`))

    //Add name and location on container
    uniInfo.append(uniName, uniType, uniLocation , uniWeb, uniMap)
    
}


