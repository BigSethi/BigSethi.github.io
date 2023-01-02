function setTileset(){
    console.log("boom")
    let tilesets = {
        demo: ["blank", "down", "left", "right", "up"],
        mountains: ["blank", "down", "left", "right", "up"],
        pipes: ["blank", "down", "left", "right", "up"],
        polka: ["blank", "down", "left", "right", "up"],
        rail: ["tile0", "tile1", "tile2", "tile3", "tile4", "tile5", "tile6"],
        roads: ["blank", "down", "left", "right", "up"]
    }

    tilesetName = document.getElementById("presets").value
    console.log(tilesetName)
    tileset = tilesets[tilesetName]
    console.log(tileset)

    let parent = document.getElementById("pictures")

    while(parent.firstChild){
        parent.removeChild(parent.firstChild)
    }

    tileset.forEach(element => {
        let elem = document.createElement("img")
        elem.src = "tilesets/" + tilesetName + "/" + element + ".png"
        elem.setAttribute("width", "100")
        elem.setAttribute("height", "100")
        
        parent.appendChild(elem)
    });

    let JSONString = fetch("rules/" + tilesetName + ".json").then(response => response.json()).then(data => data)

    document.getElementById("rules").innerText = JSONString

    rules = JSON.parse(JSONString)

}