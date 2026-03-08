const regionsContainer = document.getElementById("regionsContainer");
let regions = JSON.parse(localStorage.getItem("regions"));
let provinces = JSON.parse(localStorage.getItem("provinces"));
let cities = JSON.parse(localStorage.getItem("cities"));
let munuiciplaities = JSON.parse(localStorage.getItem("munuiciplaities"));
let allUni = JSON.parse(localStorage.getItem("allUni"));

buildRegions();

//gumawa ng mga buttons ng region
function buildRegions() {
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
                getUniUnderRegion(regionPrefix, matchMuncipalities(provincePrefix))
            })
            container.appendChild(el);
        })

        //PARA SA NCR LANG TO KASI PURO CITY SILA
        if(regionPrefix == 13) {
            matchedCities.forEach(p => {
                const el = document.createElement("button");
                el.textContent = p.name;
                el.addEventListener('click',() => {
                    let cityName = p.name;
                    if(p.name == "City of Manila"){cityName = 'manila';}
                    getUniUnderRegion(regionPrefix, cityName)
                })
                container.appendChild(el);
            });

            //Para makuha yung pateros
            matchedMunicipalities.forEach(p => {
                const el = document.createElement("button");
                el.textContent = p.name;
                el.addEventListener('click',() => {
                    getUniUnderRegion(regionPrefix, p.name)
                })
                container.appendChild(el);
            });
        }
    }
    container.dataset.loaded = "true";
}

function matchMuncipalities(prefix){
    let matchedMuncipalities = ""
    munuiciplaities.forEach((a)=>{
        if(a.code.startsWith(prefix)){
            matchedMuncipalities += a.name + " "
        }
    });
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
   
    
    let uniName = [], uniLocation = [], uniType = [], uniInfo = [], uniWeb = [];
    const uniDisplay = document.getElementById("universities")

    //Remove the previouse result
    while (uniDisplay.firstChild){
        uniDisplay.removeChild(uniDisplay.firstChild);
    }

    //Show results
    for(let i = 0; i < results.length;i++){
        //Create new container
        uniInfo[i] = document.createElement('div');
        uniInfo[i].className = 'uniInfoContainer';
        uniDisplay.appendChild(uniInfo[i])

        //Create new name
        uniName[i] = document.createElement('p');
        uniName[i].class = 'uniName';
        uniName[i].innerHTML = `<b>${results[i]['name']}</b> `;

        //Create new typw
        uniType[i] = document.createElement('p');
        uniType[i].class = 'uniName';
        uniType[i].innerHTML = `Type: ${results[i]['type']}`;

        //Create new location
        uniLocation[i] = document.createElement('p')
        uniLocation[i].class = 'uniLocation';
        uniLocation[i].innerHTML = `Location: ${results[i]['location']}`;

        //Go to website button
        uniWeb[i] = document.createElement('Button')
        uniWeb[i].class = 'uniWebButton';
        uniWeb[i].innerHTML = 'visit website';
        uniWeb[i].addEventListener("click", async (event) => {
            let url = await search(results[i]['name'])
            window.open(url);
        })

        //Add name and location on container
        uniInfo[i].append(uniName[i], uniType[i], uniLocation[i] , uniWeb[i])
    }
}


