

function setTileset(){

    let parent = document.getElementById("pictures")

    while(parent.firstChild){
        parent.removeChild(parent.firstChild)
    }

    tilesetName = document.getElementById("presets").value

    if(tilesetName != "custom"){
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
    } else {
        Object.values(uploadedImages).forEach(img => {
            img.setAttribute("id", "tile")
            img.setAttribute("width", "100")
            img.setAttribute("height", "100")

            parent.appendChild(img)
        })

        document.getElementById("rules").innerText = uploadedRules
        console.log(uploadedRules)
        rules = JSON.parse(uploadedRules)
    }
    
   

}

function setUpUploads() {
    const pictureUpload = document.getElementById("tiles-upload")
    pictureUpload.addEventListener("change", 
        () => {
            const presets = document.getElementById("presets")
            presets.value = "custom"

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

    const pictureUploadButton = document.getElementById("tiles-upload-button")
    const rulesUploadButton = document.getElementById("rules-upload-button")
    
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

}

function setUpBuild(){
    const build = document.getElementById("build")
    
    build.onclick = (e) => {
        wave = new Wave()
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        window.requestAnimationFrame(step)
    }
}
