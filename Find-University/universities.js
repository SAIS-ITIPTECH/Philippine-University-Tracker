
const regionsContainer = document.getElementById("regionsContainer");
const provinceContainer = document.getElementById("provinceContainer");
const uniDisplay = document.getElementById("universities");
const paginationDisplay = document.getElementById("pagination");


let regions = JSON.parse(localStorage.getItem("regions")) || [];
let provinces = JSON.parse(localStorage.getItem("provinces")) || [];
let cities = JSON.parse(localStorage.getItem("cities")) || [];
let munuiciplaities = JSON.parse(localStorage.getItem("munuiciplaities")) || [];
let allUni = JSON.parse(localStorage.getItem("allUni")) || {};
let filter = localStorage.getItem("filter");

//para sa pagination
let currentPage = 1;
const itemsPerPage = 8;
let filteredUniList = [];


buildRegions();
searchUniversity(); 
//gumagawa ng dropdown para sa region
function buildRegions() {
    regionsContainer.innerHTML = '<option value="">Select Region</option>';
    
    regions.forEach(function(region) {
        const option = new Option(region.name, region.code.substring(0, 2));
        regionsContainer.appendChild(option);
    });
}


//listener kung sakaling ichange yung region marereset ulit province dropdown
regionsContainer.addEventListener("change", function(e) {
    const regionPrefix = e.target.value;
    
    provinceContainer.innerHTML = '<option value="">Select Province</option>';
    
    if (regionPrefix !== "") {
        loadProvinceOptions(regionPrefix);
    }
});



//taga load ng province
function loadProvinceOptions(regionPrefix) {
    let list;
    
    //eto na yung sa NCR
    if (regionPrefix === "13") {
        list = [...cities, ...munuiciplaities];
    } else {
        list = provinces;
    }

    list.forEach(function(item) {
        if (item.code.startsWith(regionPrefix)) {
            const cleanName = item.name.replace(/\b(City of|City)\b\s*/gi, '').trim();
            
            // Code prefix for provinces is usually 5 digits
            const option = new Option(cleanName, item.code.substring(0, 5));
            provinceContainer.appendChild(option);
        }
    });


    //taga search ng universities sa selected province
    provinceContainer.onchange = function() {
        const selectedIndex = provinceContainer.selectedIndex;
        const text = provinceContainer.options[selectedIndex].text;
        
        let subUnits;
        let provinceNameForDisplay;

        if (regionPrefix === "13") {
            //di na hinahanap sa NCR kasi yun na yung subUnits nila
            subUnits = [text];
            provinceNameForDisplay = ""; 
        } else {
            //hahanapain yung municipalities sa province container
            subUnits = matchMuncipalities(provinceContainer.value);
            provinceNameForDisplay = text;
        }
        
        getUniUnderRegion(regionPrefix, subUnits, provinceNameForDisplay);
    };
}



//taga hanap ng municipalities based sa provincecode
function matchMuncipalities(provincePrefix) {
    let combinedList = [...munuiciplaities, ...cities];
    let matches = [];

    combinedList.forEach(function(item) {
        if (item.code.startsWith(provincePrefix)) {
            const cleanName = item.name.replace(/\b(City of|City)\b\s*/gi, '').trim();
            matches.push(cleanName);
        });

        provinceContainer.addEventListener("change", function() {
            provinceContainer.value = this.options[this.selectedIndex].value
            const text = this.options[this.selectedIndex].text;
            getUniUnderRegion(regionPrefix, matchMuncipalities(provinceContainer.value, text), text)
        });
    }
}

function matchMuncipalities(prefix, provinceName){
    let matchedMuncipalities = {}
    matchedMuncipalities[provinceName] = []


    munuiciplaities.forEach((a)=>{
        if(a.code.startsWith(prefix)){
            matchedMuncipalities[provinceName].push(a.name.trim())
        }
    });

    cities.forEach((a)=>{
        if(a.code.startsWith(prefix)){
            let cleaned = a.name.replace(/\b(City of|City)\b\s*/gi, '').trim();
            matchedMuncipalities[provinceName].push(cleaned)
        }
    });

    let uniqueMatches = [...new Set(matches)];
    return uniqueMatches.sort();
}



//finds universities based sa selected region and province
function getUniUnderRegion(regionCode, municipalities, provinceName) {
    filteredUniList = [];

    // Safety check: if the region doesn't exist in our university data, stop.
    if (!allUni[regionCode]) {
        finalizeResults();
        return;
    }

    municipalities.forEach(function(muni) {
        // Create a search pattern for the municipality name
        const regex = new RegExp("\\b" + muni + "\\b", "i");

        allUni[regionCode].forEach(function(uni) {
            //taga check if uni contains muni
            if (regex.test(uni.location)) {
                
                //taga check ng type
                let matchesFilter = false;
                if (filter === "none" || filter === null) {
                    matchesFilter = true;
                } else if (filter === uni.type.toLowerCase()) {
                    matchesFilter = true;
                }

                if (matchesFilter === true) {
                    let displayLoc;
                    if (provinceName !== "") {
                        displayLoc = muni + ", " + provinceName;
                    } else {
                        displayLoc = muni;
                    }
                    
                    
                    filteredUniList.push({ ...uni, displayLocation: displayLoc });
                }
            }
        });
    });

    finalizeResults();
}



//para sa search (AYAW GUMANA NG NASA FIND UNIVERSITY)
function searchUniversity() {

    
    let query = localStorage.getItem("querry");
    if (query === null) { query = ""; }

    
    const allUniversitiesFlat = Object.values(allUni).flat();
    //nilalagay lahat sa contianer natin
    filteredUniList = allUniversitiesFlat.filter(function(uni) {
        const regex = new RegExp(query, "i");
        return regex.test(uni.name);
    });

    filteredUniList = filteredUniList.map(function(uni) {
        return { ...uni, displayLocation: uni.location};
    })

    finalizeResults();
}


//event listener para sa search
const searchIcon = document.getElementById("searchIcon");
const searchInput = document.getElementById("querry");

searchIcon.onclick = function() {
    searchUniversity();
};

searchInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        searchUniversity();
    }
});


//taga finalize ng results and taga sort
function finalizeResults() {
    filteredUniList.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });
    currentPage = 1;
    renderPagedResults();
}


//para sa pagination
function renderPagedResults() {
    uniDisplay.innerHTML = "";
    paginationDisplay.innerHTML = "";

    if (filteredUniList.length === 0) {
        uniDisplay.innerHTML = "<p>No universities found.</p>";
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = filteredUniList.slice(start, end);

    paginatedItems.forEach(function(uni) {
        renderUniCard(uni);
    // Display the 10 items
    paginatedItems.forEach(res => {
        displayUni(uniDisplay, res.name, res.type, res.location);
    });

    paginatedItems.forEach(res => {
        displayResults(uniDisplay, res.name, res.type, res.location);
    });

    buildPaginationControls(filteredUniList.length);
}


//para sa every university card
function renderUniCard(uni) {
    const card = document.createElement('div');
    card.className = 'uniInfoContainer';
    
    card.innerHTML = `
        <div class="uniTopRow">
            <p class="uniName">${uni.name}</p>
            
        </div>
        <div class="uniBottomRow">
            <p class="uniType">Type: <strong>${uni.type}</strong></p>
            <p class="uniLocation">Location: <strong>${uni.displayLocation}</strong></p>
            <div class="uniButtonGroup">
                <button class="web-btn">visit website</button>
                <button class="map-btn">see on maps</button>               
            </div>

        </div>
    `;

    //para sa visit website tsaka view on map
    card.querySelector('.web-btn').onclick = async function() {
        let url = await search(uni.name, uni.displayLocation);
        window.open(url);
    };

    card.querySelector('.map-btn').onclick = function() {
        const query = uni.name + ", " + uni.displayLocation;
        window.open("https://www.google.com/maps/search/" + query);
    };

    uniDisplay.appendChild(card);
}

//sa page number selector
function buildPaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) {
        return;
    }

    function createButton(label, targetPage, isActive, isDisabled) {
        const btn = document.createElement("button");
        btn.textContent = label;
        
        if (isActive === true) {
            btn.className = "pag-btn active";
        } else {
            btn.className = "pag-btn";
        }

        btn.disabled = isDisabled;

        btn.onclick = function() {
            currentPage = targetPage;
            renderPagedResults();
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "smooth" 
            });
        };
        
        paginationDisplay.appendChild(btn);
    }

    let isAtStart = false;
    if (currentPage === 1) { isAtStart = true; }
    createButton("START", 1, false, isAtStart);

    for (let i = 1; i <= totalPages; i++) {
        if (i >= currentPage - 2 && i <= currentPage + 2) {
            let isActive = false;
            if (i === currentPage) { isActive = true; }
            createButton(i, i, isActive, false);
        }
    }

    let isAtEnd = false;
    if (currentPage === totalPages) { isAtEnd = true; }
    createButton("END", totalPages, false, isAtEnd);
}


//taga clear ng filter (SA SELECTION PA LANG GUMAGANA HINDI KO MAPAGANA YUNG clear SA SEARCH)

function clearAllFilters() {
    const searchInput = document.getElementById("querry");
    if (searchInput !== null) {
        searchInput.value = "";
    }

    regionsContainer.selectedIndex = 0;

    provinceContainer.innerHTML = '<option value="">Select Province</option>';
    provinceContainer.selectedIndex = 0;

    filteredUniList = Object.values(allUni).flat().map(function(uni) {
        return { ...uni, displayLocation: uni.location };
    });

    finalizeResults();
}

const clearLink = document.querySelector(".clear");

if (clearLink !== null) {
    clearLink.onclick = function(event) {
        event.preventDefault(); 
        
        clearAllFilters();
    };
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
            uniUrl = data.data.webPages.value[0].url
            return true
        }

        return data.data.webPages.value.some(url =>{
            const regex = new RegExp(`\\b${key}\\b`, "i");
            if(regex.test(url.url)){
                uniUrl = url.url
                return true
            }
        })

        }); 

    return uniUrl
}

document.getElementById("searchButt").addEventListener("click", () =>{
    searchUniversity(true);
});

if (filter != null) {
    searchUniversity(false);
}