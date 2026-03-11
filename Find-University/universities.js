const regionsContainer = document.getElementById("regionsContainer");
const provinceContainer = document.getElementById("provinceContainer");
import { search } from "../SearchAPI/search.js";

let regions = JSON.parse(localStorage.getItem("regions"));
let provinces = JSON.parse(localStorage.getItem("provinces"));
let cities = JSON.parse(localStorage.getItem("cities"));
let munuiciplaities = JSON.parse(localStorage.getItem("munuiciplaities"));
let allUni = JSON.parse(localStorage.getItem("allUni"));
let filter = localStorage.getItem("filter")
console.log(1)

buildRegions();

// hinsdi na buttons gagawin nya, option na sa regions selection
function buildRegions() {
    console.log(1)
    regionsContainer.innerHTML = '<option value="">Select Region </option>';

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

let currentPage = 1;
const itemsPerPage = 8;
let filteredUniList = []; // This will hold all matching unis before slicing

// Modify your getUniUnderRegion function
function getUniUnderRegion(regionCode, municipalities, province) {
    filteredUniList = []; // Reset the master list
    
    municipalities.forEach(muni => {
        if (allUni[regionCode]) {
            allUni[regionCode].forEach((content) => {
                const regex = new RegExp(`\\b${muni}\\b`, "i");
                if (regex.test(content.location)) {
                    // Apply filtering logic
                    if (filter === "none" || filter === content.type.toLowerCase()) {
                        // Store uni with its calculated location for display
                        const displayLocation = province ? `${muni}, ${province}` : muni;
                        filteredUniList.push({ ...content, displayLocation });
                    }
                }
            });
        }
    });

    // Sort the entire list once
    filteredUniList = uniSort(filteredUniList);
    
    // Reset to page 1 and render
    currentPage = 1;
    renderPagedResults();
}

function renderPagedResults() {
    const uniDisplay = document.getElementById("universities");
    const paginationDisplay = document.getElementById("pagination");
    uniDisplay.innerHTML = "";
    paginationDisplay.innerHTML = "";

    if (filteredUniList.length === 0) {
        uniDisplay.innerHTML = "<p>No universities found.</p>";
        return;
    }

    // Calculate Slice
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = filteredUniList.slice(start, end);

    // Display the 10 items
    paginatedItems.forEach(res => {
        displayUni(uniDisplay, res.name, res.type, res.displayLocation);
    });

    paginatedItems.forEach(res => {
        displayResults(uniDisplay, res.name, res.type, res.displayLocation);
    });


    buildPaginationControls(filteredUniList.length);
}

function buildPaginationControls(totalItems) {
    const paginationDisplay = document.getElementById("pagination");
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return;

    const createBtn = (label, targetPage, active = false, disabled = false) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.className = `pag-btn ${active ? 'active' : ''}`;
        if (disabled) btn.disabled = true;
        btn.addEventListener("click", () => {
            currentPage = targetPage;
            renderPagedResults();
            document.getElementById("universities").scrollTop = 0;
        });
        return btn;
    };

    // START & PREV
    paginationDisplay.appendChild(createBtn("START", 1, false, currentPage === 1));
    paginationDisplay.appendChild(createBtn("PREV", currentPage - 1, false, currentPage === 1));

    // Page Numbers (Showing a max of 5 numbers for cleanliness)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    for (let i = startPage; i <= endPage; i++) {
        paginationDisplay.appendChild(createBtn(i, i, i === currentPage));
    }

    // NEXT & END
    paginationDisplay.appendChild(createBtn("NEXT", currentPage + 1, false, currentPage === totalPages));
    paginationDisplay.appendChild(createBtn("END", totalPages, false, currentPage === totalPages));
}

//displayer sa div universities ng universities 
//NAKA FORMAT MAG SABI PO IF MAY IAADD TEYKYU

function displayUni(uniDisplay, name, type, location) {

    let uniInfo = document.createElement('div');
    uniInfo.className = 'uniInfoContainer';
    uniDisplay.appendChild(uniInfo);

    let topRow = document.createElement('div');
    topRow.className = 'uniTopRow';

    let uniName = document.createElement('p');
    uniName.className = 'uniName';
    uniName.innerHTML = `${name}`;

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

    let uniType = document.createElement('p');
    uniType.className = 'uniType';
    uniType.innerHTML = `Type: <strong>${type}</strong>`;

    let uniLocation = document.createElement('p');
    uniLocation.className = 'uniLocation';
    uniLocation.innerHTML = `Location: <strong>${location}</strong>`;

    bottomRow.append(uniType, uniLocation);

    uniInfo.append(topRow, bottomRow);
}


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



function displayResults(results, name, location){
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


        bottomRow.append(uniType, uniLocation);

        uniInfo.append(topRow, bottomRow);
    });
}