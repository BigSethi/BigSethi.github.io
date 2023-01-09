

function setTileset(){

    let parent = document.getElementById("pictures")

    while(parent.firstChild){
        parent.removeChild(parent.firstChild)
    }

    tilesetName = document.getElementById("presets").value

    if(tilesetName == "custom"){
        Object.values(uploadedImages).forEach(img => {
            img.setAttribute("id", "tile")
            img.setAttribute("width", "100")
            img.setAttribute("height", "100")

            parent.appendChild(img)
        })

        document.getElementById("rules").innerText = uploadedRules
        console.log(uploadedRules)
        rules = JSON.parse(uploadedRules)
    } else if(tilesetName == "seed map"){
        Object.values(generatedImages).forEach(img => {
            img.setAttribute("id", "tile")
            img.setAttribute("width", "100")
            img.setAttribute("height", "100")

            parent.appendChild(img)
        })

        document.getElementById("rules").innerText = JSON.stringify(rules)

    } else {
        let tilesets = {
            demo: ["blank.png", "down.png", "left.png", "right.png", "up.png"],
            mountains: ["blank.png", "down.png", "left.png", "right.png", "up.png"],
            pipes: ["blank.png", "down.png", "left.png", "right.png", "up.png"],
            polka: ["blank.png", "down.png", "left.png", "right.png", "up.png"],
            rail: ["tile0.png", "tile1.png", "tile2.png", "tile3.png", "tile4.png", "tile5.png", "tile6.png"],
            roads: ["blank.png", "down.png", "left.png", "right.png", "up.png"]
        }
    
       
        tileset = tilesets[tilesetName]
    
       
        tileset.forEach(element => {
            let elem = document.createElement("img")
            elem.src = "tilesets/" + tilesetName + "/" + element
            elem.setAttribute("id", "tile")
            elem.setAttribute("width", "100")
            elem.setAttribute("height", "100")
            
            parent.appendChild(elem)
        });
    
    
        fetch("rules/" + tilesetName + ".json").then(response => response.text()).then(data => {
            document.getElementById("rules").innerText = data
            rules = JSON.parse(data)
    
        })
    }
    
   
}

function setUpUploads() {
    const pictureUpload = document.getElementById("tiles-upload")
    pictureUpload.addEventListener("change", 
        () => {
            const presets = document.getElementById("presets")
            presets.value = "custom"
            tileset = []

            for(let i = 0; i < pictureUpload.files.length; i++){
                const file = pictureUpload.files[i]
                const img = new Image()

                const reader = new FileReader()
                reader.onload = (e) => {img.src = e.target.result}
                reader.readAsDataURL(file)

                tileset.push(file.name)
                uploadedImages[file.name] = img
                
            }

            setTileset()
        },
        false 
    )

    const rulesUpload = document.getElementById("rules-upload")
    rulesUpload.addEventListener("change",
        () => {
            const presets = document.getElementById("presets")
            presets.value = "custom"

            const file = rulesUpload.files[0]
            const reader = new FileReader()
            reader.onload = (e) => {
                uploadedRules = e.target.result
                setTileset()
            }
            reader.readAsText(file)

           
        }, 
        false
        )
    const seedMapUpload = document.getElementById("seed-map-upload")
    seedMapUpload.addEventListener("change", 
        () => {
            const presets = document.getElementById("presets")
            presets.value = "seed map"

            const file = seedMapUpload.files[0]

            seedMap = new Image()
            const reader = new FileReader()
            reader.onload = (e) => {
                seedMap.src = e.target.result 
            }
            reader.readAsDataURL(file)

            tileset = []
            rules = {}
            generatedImages = {}
            setTileset()
        }, 
        false)

    const buildTilesetButton = document.getElementById("build-tileset")
    buildTilesetButton.addEventListener("click", 
        () => {
            if(seedMap != null){
                rules = {}
                tileset = []
                const key = {}
                const canvas = document.createElement("canvas")
                canvas.setAttribute("width", "100")
                canvas.setAttribute("height", "100")

                const ctx = canvas.getContext("2d")

                const seedHeight= parseInt(document.getElementById("seed-height").value)
                const seedWidth = parseInt(document.getElementById("seed-width").value)

                const tileArray = new Array(seedHeight)
                let counter = 0
                for(let i = 0; i < tileArray.length; i++){
                    const row = new Array(seedWidth)
                    for(let j = 0; j < row.length; j++){
                        const tileWidth = seedMap.width / seedWidth
                        const tileHeight = seedMap.height / seedHeight

                        ctx.clearRect(0, 0, canvas.width, canvas.height)
                        ctx.drawImage(seedMap, j*tileWidth, i*tileHeight, tileWidth, tileHeight, 0, 0, canvas.width, canvas.height)

                        let img = new Image()
                        const data = canvas.toDataURL()
                        img.src = data

                        if(!Object.keys(key).includes(data)){
                            key[data] = "tile" + counter
                            tileset.push("tile" + counter)
                            counter++
                        }   
                        generatedImages[key[data]] = img

                        row[j] = key[data]
                    }
                    tileArray[i] = row 
                }
                console.log(generatedImages)
                console.log(tileArray)

                for(let i = 0; i < tileArray.length; i++){
                    for(let j = 0; j < tileArray[0].length; j++){
                        const tile = tileArray[i][j]
                        if(!rules[tile]){
                            rules[tile] = {
                                above: [],
                                right: [],
                                below: [],
                                left: []
                            }
                        }

                        console.log(rules)

                        if(i != 0){
                            const above = tileArray[i-1][j]
                            if(!rules[tile].above.includes(above)){
                                rules[tile].above.push(above)
                            }
                        }
                        if(j != tileArray[0].length - 1){
                            const right = tileArray[i][j+1]
                            if(!rules[tile].right.includes(right)) {
                                rules[tile].right.push(right)
                            }
                        }
                        if(i != tileArray.length - 1){
                            const below = tileArray[i + 1][j]
                            if(!rules[tile].below.includes(below)) {
                                rules[tile].below.push(below)
                            }
                        }
                        if(j != 0){
                            const left = tileArray[i][j-1]
                            if(!rules[tile].left.includes(left)) {
                                rules[tile].left.push(left)
                            }
                        }
                    }
                }
                console.log("hey")

                setTileset()

            } else {
                alert("A seed map has not been uploaded. Either use a premade tileset, upload a custom one with your own rules, or upload a seed map and let the algorithm generate a tileset")
            }
          
        },
        false
        )
    const downloadButton = document.getElementById("download")
    downloadButton.addEventListener("click", 
        (e) => {
            const link = document.createElement("a")
            link.setAttribute("href", canvas.toDataURL())
            link.setAttribute("download", "map.png")
            link.click()
        }, 
        false
    )

    const pictureUploadButton = document.getElementById("tiles-upload-button")
    const rulesUploadButton = document.getElementById("rules-upload-button")
    const seedMapUploadButton = document.getElementById("seed-map-upload-button")
    
    pictureUploadButton.addEventListener("click", 
        (e) => {
            pictureUpload.click()
        },
        false
    )

    rulesUploadButton.addEventListener("click", 
        (e) => {
            rulesUpload.click()
        },
        false
    )

    seedMapUploadButton.addEventListener("click", 
        (e) => {
            seedMapUpload.click()
        },
        false
    )

    

}

function setUpBuild(){
    const build = document.getElementById("build")

    build.onclick = (e) => {
        wave = new Wave()
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        window.requestAnimationFrame(step)
    }
}
