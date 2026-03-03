const regionsContainer = document.getElementById("regionsContainer");

let regions = [];
let provinces = [];
let cities = [];
let munuiciplaities = [];

Promise.all([
    fetch("https://psgc.cloud/api/regions").then(res => res.json()),
    fetch("https://psgc.cloud/api/provinces").then(res => res.json()),
    fetch("https://psgc.cloud/api/cities").then(res => res.json()),
    fetch("https://psgc.cloud/api/municipalities").then(res => res.json())
])

.then(([r, p, c, m]) => {
    regions = r;
    provinces = p;
    cities = c;
    munuiciplaities = m
    buildRegions();
})

.catch(err => {
    regionsContainer.innerHTML = "<p>Error loading PSGC data.</p>";
    console.error(err);
});

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

            if (!content.dataset.loaded) {
                loadRegionUnits(regionPrefix, content, region.name);
            }
        });
    });
}


function loadRegionUnits(prefix, container, regionName) {
    container.innerHTML = "";

    //MATCH THE PROVINCES BASED ON THE CODE. IE REGION I HAS 01XXXXXX, 
    //EVERY PROVINCES UNDER REGION 1 ALSO HAS 01000 AT THE START
    const matchedProvinces = provinces.filter(p =>
        p.code.startsWith(prefix)
    );

    const matchedCities = cities.filter(c =>
        c.code.startsWith(prefix)
    );

    const matchedMunicipalities = munuiciplaities.filter(m =>
        m.code.startsWith(prefix)
    );

    //PAGWALA
    if (matchedProvinces.length === 0 && matchedCities.length === 0) {
        container.innerHTML = "<p>No administrative units found.</p>";
        return;
    }

    //ILAGAY NA SA SCREEN
    if (matchedProvinces.length > 0 || prefix == 13) {
        const title = document.createElement("p");
        title.innerHTML = "<strong>Provinces</strong>";
        container.appendChild(title);

        matchedProvinces.forEach(p => {
            const el = document.createElement("button");
            el.textContent = p.name;
            const provincePrefix = p.code.substring(0, 5)
            el.addEventListener('click',() => {
                getColleges(matchMuncipalities(provincePrefix), regionName)
            })
            container.appendChild(el);
        })

        //PARA SA NCR LANG TO KASI PURO CITY SILA
        if(prefix == 13) {
            matchedCities.forEach(p => {
                const el = document.createElement("button");
                el.textContent = p.name;
                const provincePrefix = p.code.substring(0, 5)
                el.addEventListener('click',() => {
                    
                })
                container.appendChild(el);
            });

            //Para makuha yung pateros
            matchedMunicipalities.forEach(p => {
                const el = document.createElement("button");
                el.textContent = p.name;
                const provincePrefix = p.code.substring(0, 5)
                el.addEventListener('click',() => {
                })
                container.appendChild(el);
            });
        }
    }
    container.dataset.loaded = "true";
}

function matchMuncipalities(prefix){
    console.log(prefix + "nigga")
    let matchedMuncipalities = ""
    munuiciplaities.forEach((a)=>{
        if(a.code.startsWith(prefix)){
            matchedMuncipalities += a.name + " "
        }
    });
    return matchedMuncipalities
}

//Colege Api
//Search for website
async function search(name) {
    const query = name + 'philipines official website'
    console.log(query)
    const url = 'https://api.langsearch.com/v1/web-search'

    let response = await fetch(url, {
        method: 'POST', 
        headers: {
            'Authorization' : 'Bearer sk-c399636d05c542a0b1e51e676bf89078', 
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
        "query": query,
        "freshness": "onLimit",
        "summary": true,
        "count": 1
        })
    })
    let data = await response.json();
    console.log(data)
    return data.data.webPages.value[0].url
}

//take the index of proper region
async function getIndex(name){
    switch(name){
        case "National Capital region (NCR)":
            return 37
        case "Cordillera Administrative Region (CAR)":
            return 40
    }
    let response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&format=json&page=List of colleges and universities in the Philippines&prop=sections&disabletoc=1&origin=*`)
    let data = await response.json()
    let index
    data.parse.sections.forEach(function(a){
        if(name.toLowerCase().match(a.line.toLowerCase())){
            index = a.index
        }
    })
    return index
}

async function getColleges(municipalities, name){
    let ind = await getIndex(name);
    let response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&format=json&page=List of colleges and universities in the Philippines&prop=text&section=${ind}&disabletoc=1&origin=*`)
    let data = await response.json()
    console.log(municipalities)
    let universities = await getCollegesNames(municipalities, data);
    console.log(universities)

    let uniName = [];

    const uniDisplay = document.getElementById("universities")
    

    //Remove the previouse result
    while (uniDisplay.firstChild){
        uniDisplay.removeChild(uniDisplay.firstChild);
    }

    //Show results
    for(let i = 0; i < universities.length;i++){
        uniName[i] = document.createElement('button');
        uniName[i].innerHTML = universities[i]['name'];
        uniName[i].addEventListener("click", async (event) => {
            let url = await search(event.target.innerHTML)
            window.open(url);
        })
        uniDisplay.appendChild(uniName[i])
    }
}

//get colleges of the region
async function getCollegesNames(municipalities, data){
    const parser = new DOMParser();
    
    const doc = parser.parseFromString(data.parse.text["*"], "text/html");

    const rows = doc.querySelectorAll("table.wikitable tbody tr");

    let universities = [];
    rows.forEach((row, index) => {
    if (index === 0) return;
    const cells = row.querySelectorAll("td");
    //Public Schools
    if (cells.length == 6) {
        const name = cells[0].innerText.trim().toLowerCase();
        const location1 = cells[2].innerText.trim().toLowerCase();
        let location2 = location1.match(/^([^,]+)/)
        let regex = new RegExp(`\\b${location2[1]}\\b`, 'i')
        if(municipalities.match(regex)){
            universities.push({name, location1})
        }
    }

    //Private Schools
    else if(cells.length == 5){
        const name = cells[0].innerText.trim().toLowerCase();
        const location1 = cells[1].innerText.trim().toLowerCase();
        let location2 = location1.match(/^([^,]+)/)
        let regex = new RegExp(`\\b${location2[1]}\\b`, 'i')
        if(municipalities.match(regex)){
            universities.push({name, location1})
        }
    
    }
    });

    return universities;
}
