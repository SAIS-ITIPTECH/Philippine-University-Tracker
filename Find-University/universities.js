const regionsContainer = document.getElementById("regionsContainer");
let regions = JSON.parse(localStorage.getItem("regions"));
let provinces = JSON.parse(localStorage.getItem("provinces"));
let cities = JSON.parse(localStorage.getItem("cities"));
let munuiciplaities = JSON.parse(localStorage.getItem("munuiciplaities"));
let allUni = JSON.parse(localStorage.getItem("allUni"));
let filter = localStorage.getItem("filter")


buildRegions();

//gumawa ng mga buttons ng region
function buildRegions() {
    console.log(filter + "received")
    regions.forEach(region => {
        const regionPrefix = region.code.substring(0, 2);
        const regionId = `region-${region.code}`;

        const button = document.createElement("button");
        button.className = "region-btn";
        button.textContent = region.name;

        const content = document.createElement("div");
        content.className = "region-content";
        content.id = regionId;

        regionsContainer.appendChild(button);
        regionsContainer.appendChild(content);

        button.addEventListener("click", () => {
            document.querySelectorAll(".region-content").forEach(c => {
                if (c !== content) c.classList.remove("show");
            });

            content.classList.toggle("show");
            //chat gpt ginamit ko dito sa function na loadRegionUnits haha
            if (!content.dataset.loaded) {
                loadRegionUnits(regionPrefix, content);
                
            }
        });
    });
}


//gumawa ng button ng mga provinces
function loadRegionUnits(regionPrefix, container) {
    container.innerHTML = "";

    //MATCH THE PROVINCES BASED ON THE CODE. IE REGION I HAS 01XXXXXX, 
    //EVERY PROVINCES UNDER REGION 1 ALSO HAS 01000 AT THE START
    const matchedProvinces = provinces.filter(p =>
        p.code.startsWith(regionPrefix)
    );

    const matchedCities = cities.filter(c =>
        c.code.startsWith(regionPrefix)
    );

    const matchedMunicipalities = munuiciplaities.filter(m =>
        m.code.startsWith(regionPrefix)
    );

    //PAGWALA
    if (matchedProvinces.length === 0 && matchedCities.length === 0) {
        container.innerHTML = "<p>No administrative units found.</p>";
        return;
    }


    
    //ILAGAY NA SA SCREEN
    if (matchedProvinces.length > 0 || regionPrefix == 13) {
        const title = document.createElement("p");
        title.innerHTML = "<strong>Provinces</strong>";
        container.appendChild(title);

        matchedProvinces.forEach(p => {
            const el = document.createElement("button");
            el.textContent = p.name;
            const provincePrefix = p.code.substring(0, 5)
            el.addEventListener('click',() => {
                getUniUnderRegion(regionPrefix, matchMuncipalities(provincePrefix), p.name)
            })
            container.appendChild(el);
        })

        //PARA SA NCR LANG TO KASI PURO CITY SILA
        if(regionPrefix == 13) {
            matchedCities.forEach(p => {
                const el = document.createElement("button");
                el.textContent = p.name;
                el.addEventListener('click',() => {
                    let cityName = [p.name.replace(/\b(City of|City)\b\s*/gi, '').trim()];
                    getUniUnderRegion(regionPrefix, cityName)
                })
                container.appendChild(el);
            });

            //Para makuha yung pateros
            matchedMunicipalities.forEach(p => {
                const el = document.createElement("button");
                el.textContent = p.name;
                el.addEventListener('click',() => {
                    let cityName = [p.name.replace(/\b(City of|City)\b\s*/gi, '').trim()];
                    getUniUnderRegion(regionPrefix, cityName)
                })
                container.appendChild(el);
            });
        }
    }
    container.dataset.loaded = "true";
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
    return matchedMuncipalities
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


