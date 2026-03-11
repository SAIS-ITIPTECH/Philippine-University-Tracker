export async function search(name, loc) {
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