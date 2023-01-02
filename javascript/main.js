const rules = {
    up: {
        above: ["right", "down", "left"],
        right: ["down", "left", "up"],
        below: ["blank", "down"],
        left: ["down", "right", "up"]
    },
    right: {
        above: ["down", "left", "right"],
        right: ["up", "left", "down"],
        below: ["left", "up", "right"],
        left: ["blank", "left"]
    },
    down: {
        above: ["blank", "up"],
        right: ["left", "up", "down"],
        below: ["left", "right", "up"],
        left: ["right", "up", "down"]
    },
    left: {
        above: ["down", "right", "left"],
        right: ["blank", "right"],
        below: ["up", "right", "left"],
        left: ["right", "down", "up"]
    },
    blank: {
        above: ["up", "blank"],
        right: ["right", "blank"],
        below: ["down", "blank"],
        left: ["left", "blank"]
    }
}


class Tile{
    
    constructor(id, neighbors, states, canvasWidth, canvasHeight){
        this.id = id
        this.neighbors = neighbors
        this.states = states
        this.collapsed = false
        this.canvasWidth = canvasWidth
        this.canvasHeight = canvasHeight

    }

    draw(ctx){
        if(this.collapsed){
            const img = new Image()


            img.addEventListener(
                "load",
                () => {
                    let sideLength;

                    if(this.canvasHeight > this.canvasWidth){
                        sideLength = Math.floor(500 / this.canvasHeight)
                    } else {
                        sideLength = Math.floor(500 / this.canvasWidth)
                    }

                    ctx.drawImage(img, (this.id % this.canvasWidth) * sideLength, Math.floor(this.id / this.canvasWidth) * sideLength, sideLength, sideLength)
                },
                false)
            

            img.src = "pipes/" + this.states[0] + ".png"

        }        
       
    }

}
let counter = 0
class Wave{

    constructor(){
        const width = parseInt(document.getElementById("width").value)
        const height = parseInt(document.getElementById("height").value)

        this.wave = new Array(width * height)
        
        
        for(let i = 0; i < this.wave.length; i++){
            const neighbors = [null, null, null, null] // top right bottom left


            if((Math.floor(i / width) - 1) >= 0){
                neighbors[0] = (i - width)
            }

            if((i + 1) % width != 0){
                neighbors[1] = (i + 1)
            }

            if((Math.floor(i / width) + 1) < height){
                neighbors[2] = (i + width)
            }

            if(i % width != 0){
                neighbors[3] = (i - 1)
            }

            this.wave[i] = new Tile(i, neighbors, ["up", "right", "down", "left", "blank"], width, height)
        }

    }

    draw(ctx){
        this.wave.forEach((element) => {
            element.draw(ctx)
        });
    }

    collapse(){
        const nonCollapsed = this.wave.filter((element) => {return !element.collapsed})

        if(nonCollapsed.length == 0){
            return false
        }
        let minimumTiles = [nonCollapsed[0]] 

        for(let i = 1; i < nonCollapsed.length; i++){   
            let current = nonCollapsed[i] 
            let best =  minimumTiles[0]

            if (current.states.length < best.states.length){
                minimumTiles = [current]
            } else if (current.states.length == best.states.length){
                minimumTiles.push(current)
            }
        }


       if(minimumTiles[0].states.length == 0){
            console.log("restart")
            main()
        } else {
            let min = minimumTiles[Math.floor(Math.random() * minimumTiles.length)]

            const states = min.states
            min.states = [states[Math.floor(Math.random() * states.length)]]
            min.collapsed = true
            counter = 0
            this.propagate([min], ["noWhere"], [])
           
            return true
        }

    }

    

    propagate(toVisit, comingFrom, edgesUsed){

        function getNode(id, graph){
            
            // for(let i = 0; i < graph.length; i++){
            //     if (graph[i].id == id){
            //         return graph[i]
            //     }
            // }
            // return false

            
          return graph[id]
        }

        function getNeighbors(id, graph){
            const neighbors = []

            getNode(id, graph).neighbors.forEach((neighbor) => {
                if(neighbor != null){
                    neighbors.push(getNode(neighbor, graph))
                }
            })

            return neighbors
        }


        if(toVisit.length == 0){
            return
        } else {
            const node = toVisit[0]
            const neighbors = getNeighbors(node.id, this.wave)

            if(edgesUsed.includes(comingFrom[0] + node.id) || node.isCollapsed){
                this.propagate(toVisit.slice(1), comingFrom.slice(1), edgesUsed)
            } else {
                let allowedImages = []
                const upID = node.neighbors[0]
                const rightID = node.neighbors[1]
                const downID = node.neighbors[2]
                const leftID = node.neighbors[3]
                
                

                if(upID != null){
                    let array = []
                    getNode(upID, this.wave).states.forEach((state) => {                       
                        array = array.concat(rules[state].below)
                    })

                    allowedImages.push(array)
                }
                if(rightID != null){
                    let array = []
                    getNode(rightID, this.wave).states.forEach((state) => {
                        array = array.concat(rules[state].left)
                     
                    })
                    allowedImages.push(array)
                }
                if(downID != null){
                    let array = []
                    getNode(downID, this.wave).states.forEach((state) => {
                        array = array.concat(rules[state].above)
                    })
                    allowedImages.push(array)
                }
                if(leftID != null){
                    let array = []
                    getNode(leftID, this.wave).states.forEach((state) => {
                        array = array.concat(rules[state].right)
                    })
                    allowedImages.push(array)
                }
           

                let realAllowedImages = allowedImages[0].filter((state) => {
                    let neighborAllowsImage = true
                    for(let i = 1; i < allowedImages.length; i++){
                        if(allowedImages[i].includes(state)){
                            neighborAllowsImage = true;
                        }   else {
                            neighborAllowsImage = false;
                            break;
                        }          
                    }
                    return neighborAllowsImage    
                })
                
                    
                node.states = node.states.filter((state) => {return realAllowedImages.includes(state)})

                const newEdgesUsed = edgesUsed.concat([comingFrom[0] + node.id])

                const comingFromArray = new Array(neighbors.length).fill(node.id.toString())
                
                this.propagate(toVisit.slice(1).concat(neighbors), comingFrom.slice(1).concat(comingFromArray), newEdgesUsed)
               
                
            
               
                
            }
        }

    }
}

let wave;


function main(){
    const canvas = document.getElementById("canvas")
    const ctx = canvas.getContext("2d")

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    wave = new Wave()
    window.requestAnimationFrame(step)
}

function step(){
    setTimeout(() => {
    const canvas = document.getElementById("canvas")
    const ctx = canvas.getContext("2d")

    wave.draw(ctx)
    if(wave.collapse()){
        window.requestAnimationFrame(step)
    }

    }, 0)
     
}



