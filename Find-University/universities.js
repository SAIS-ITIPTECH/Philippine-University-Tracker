const regionsContainer = document.getElementById("regionsContainer");

let regions = [];
let provinces = [];
let cities = [];
let munuiciplaities = [];
//kinuha ko ulit kulang yung nakukuha sa niversity ee
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
    munuiciplaities = m;
    buildRegions();
})
.catch(err => {
    regionsContainer.innerHTML = "<p>Error loading PSGC data.</p>";
    console.error(err);
});

function buildRegions() {
    regions.forEach(region => {
        const regionPrefix = region.code.substring(0, 2);

        const button = document.createElement("button");
        button.className = "region-btn";
        button.textContent = region.name;

        const content = document.createElement("div");
        content.className = "region-content";

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

    const matchedProvinces = provinces.filter(p => p.code.startsWith(prefix));
    const matchedCities = cities.filter(c => c.code.startsWith(prefix));
    const matchedMunicipalities = munuiciplaities.filter(m => m.code.startsWith(prefix));

    if (matchedProvinces.length === 0 && matchedCities.length === 0) {
        container.innerHTML = "<p>No administrative units found.</p>";
        return;
    }

    if (matchedProvinces.length > 0 || prefix == 13) {
        const title = document.createElement("p");
        title.innerHTML = "<strong>Provinces</strong>";
        container.appendChild(title);

        matchedProvinces.forEach(p => {
            const el = document.createElement("button");
            el.textContent = p.name;
            const provincePrefix = p.code.substring(0, 5);
            el.addEventListener('click', () => {
                getColleges(matchMuncipalities(provincePrefix), regionName);
            });
            container.appendChild(el);
        });

        if (prefix == 13) { 
            matchedCities.forEach(p => {
                const el = document.createElement("button");
                el.textContent = p.name;
                el.addEventListener('click', () => {
                    let cityName = p.name;
                    if (p.name == "City of Manila") cityName = 'manila';
                    getColleges(cityName, regionName);
                });
                container.appendChild(el);
            });

            matchedMunicipalities.forEach(p => {
                const el = document.createElement("button");
                el.textContent = p.name;
                const provincePrefix = p.code.substring(0, 5);
                el.addEventListener('click', () => {
                    getColleges(matchMuncipalities(provincePrefix), regionName);
                });
                container.appendChild(el);
            });
        }
    }

    container.dataset.loaded = "true";
}

function matchMuncipalities(prefix) {
    let matchedMuncipalities = "";
    munuiciplaities.forEach(a => {
        if (a.code.startsWith(prefix)) {
            matchedMuncipalities += a.name + " ";
        }
    });
    return matchedMuncipalities;
}

async function search(name) {
    const query = name + ' philippines official website';
    const url = 'https://api.langsearch.com/v1/web-search';

    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer sk-c399636d05c542a0b1e51e676bf89078',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "query": query,
            "freshness": "onLimit",
            "summary": true,
            "count": 1
        })
    });
    let data = await response.json();
    return data.data.webPages.value[0].url;
}

async function getIndex(name) {
    switch(name){
        case "National Capital region (NCR)": return 37;
        case "Cordillera Administrative Region (CAR)": return 40;
    }
    let response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&format=json&page=List of colleges and universities in the Philippines&prop=sections&disabletoc=1&origin=*`);
    let data = await response.json();
    let index;
    data.parse.sections.forEach(function(a){
        if(name.toLowerCase().match(a.line.toLowerCase())){
            index = a.index;
        }
    });
    return index;
}

async function getColleges(municipalities, name) {
    let ind = await getIndex(name);
    let response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&format=json&page=List of colleges and universities in the Philippines&prop=text&section=${ind}&disabletoc=1&origin=*`);
    let data = await response.json();
    let universities = await getCollegesNames(municipalities, data);

    const uniDisplay = document.getElementById("universities");
    while (uniDisplay.firstChild) uniDisplay.removeChild(uniDisplay.firstChild);

    universities.forEach(u => {
        const uniInfo = document.createElement('div');
        uniInfo.className = 'uniInfoContainer';

        const uniName = document.createElement('p');
        uniName.innerHTML = `<b>${u.name}</b>`;

        const uniLocation = document.createElement('p');
        uniLocation.innerHTML = `Location: ${u.location}`;

        const uniWeb = document.createElement('button');
        uniWeb.className = 'uniWebButton';
        uniWeb.innerHTML = 'Visit Website';
        uniWeb.addEventListener("click", async () => {
            let url = await search(u.name);
            window.open(url);
        });

        const uniMap = document.createElement('button');
        uniMap.className = 'uniWebButton';
        uniMap.innerHTML = 'View Map';
        uniMap.addEventListener("click", () => {
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(u.name + ", " + u.location)}`;
            window.open(mapUrl, '_blank');
        });

        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'uniButtonGroup';
        buttonGroup.append(uniWeb, uniMap);

        uniInfo.append(uniName, uniLocation, buttonGroup);
        uniDisplay.appendChild(uniInfo);
    });
}


async function getCollegesNames(municipalities, data) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.parse.text["*"], "text/html");
    const rows = doc.querySelectorAll("table.wikitable tbody tr");

    let universities = [];
    rows.forEach((row, index) => {
        if (index === 0) return;
        const cells = row.querySelectorAll("td");

        let name, location;
        if (cells.length == 6){
            name = cells[0].innerText.trim();
            location = cells[2].innerText.trim();
        } else if (cells.length == 5){
            name = cells[0].innerText.trim();
            location = cells[1].innerText.trim();
        } else return;

        let plainLocation = location.match(/^([^,]+)/);
        plainLocation = plainLocation[1].replace('sta.', 'santa').replace('sto.', 'santo');
        let regexLocation = new RegExp(`\\b${plainLocation}\\b`, 'i');

        if (location.toLowerCase().includes(municipalities.toLowerCase()) || municipalities.match(regexLocation)){
            universities.push({name, location});
        }
    });

    return universities;
}
