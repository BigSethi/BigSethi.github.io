let wave;
let tilesetName;
let tileset = []
let rules = {}
let uploadedImages = {}
let uploadedRules = "{}"
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
let seedMap = null;
let generatedImages = {}


class Tile{
    
    constructor(id, neighbors, edges, states, canvasWidth, canvasHeight){
        this.id = id
        this.neighbors = neighbors
        this.states = states
        this.edges = edges 
        this.collapsed = false
        this.canvasWidth = canvasWidth
        this.canvasHeight = canvasHeight

    }

    draw(ctx){
        if(this.collapsed){
            let sideLength;
            let x;
            let y;
    
            if(this.canvasHeight > this.canvasWidth){
                sideLength = Math.floor(500 / this.canvasHeight)
            } else {
                sideLength = Math.floor(500 / this.canvasWidth)
            }

            x = (this.id % this.canvasWidth) * sideLength
            y = Math.floor(this.id / this.canvasWidth) * sideLength


            if(tilesetName == "custom"){
                ctx.drawImage(uploadedImages[this.states[0]], x, y, sideLength, sideLength)
                
            } else if(tilesetName == "seed map"){
                ctx.drawImage(generatedImages[this.states[0]], x, y, sideLength, sideLength)
            } else {
                const img = new Image()

                img.addEventListener(
                    "load",
                    () => {
                       
                        ctx.drawImage(img, x, y, sideLength, sideLength)
                    },
                    false)
                
    
                img.src = "tilesets/" + tilesetName + "/" + this.states[0]
            }
            

        }        
       
    }

}
class Wave{

    constructor(){
        const width = parseInt(document.getElementById("width").value)
        const height = parseInt(document.getElementById("height").value)
        this.contradiction = false

        this.wave = new Array(width * height)
        
        
        for(let i = 0; i < this.wave.length; i++){
            const neighbors = [] // top right bottom left
            const edges = []


            if((Math.floor(i / width) - 1) >= 0){
                neighbors.push(i - width)
                edges.push("above")
            }

            if((i + 1) % width != 0){
                neighbors.push(i + 1)
                edges.push("right")
            }

            if((Math.floor(i / width) + 1) < height){
                neighbors.push(i + width)
                edges.push("below")
            }

            if(i % width != 0){
                neighbors.push(i - 1)
                edges.push("left")
            }

            this.wave[i] = new Tile(i, neighbors, edges, tileset, width, height)
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
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            wave = new Wave()
            window.requestAnimationFrame(step)
            return false
        } else {
            let min = minimumTiles[Math.floor(Math.random() * minimumTiles.length)]

            const states = min.states
            min.states = [states[Math.floor(Math.random() * states.length)]]
            min.collapsed = true
            this.propagate([min], ["noWhere"], [null], [])
           
            return true
        }

    }

    

    propagate(toVisit, comingFrom, edges, edgesUsed){

        function getNode(id, graph){
            if(id == "noWhere"){
                return "noWhere"
            } else {
                return graph[id]
            }
          
        }

        function getNeighbors(id, graph){
            return graph[id].neighbors.map((id) => graph[id])
        }


        if(toVisit.length == 0){
            return
        } else {
            const node = toVisit[0]
            const neighbors = getNeighbors(node.id, this.wave)
            const incomingEdge = edges[0]
            const lastNode = getNode(comingFrom[0], this.wave)

            if(lastNode == "noWhere"){

                const newEdgesUsed = edgesUsed.concat([comingFrom[0] + node.id])
                const comingFromArray = new Array(neighbors.length).fill(node.id)
                
                this.propagate(toVisit.slice(1).concat(neighbors), 
                    comingFrom.slice(1).concat(comingFromArray), 
                    edges.slice(1).concat(node.edges), 
                    newEdgesUsed)
            }
            else if(edgesUsed.includes(comingFrom[0].toString() + node.id) || node.collapsed){
                const newEdgesUsed = edgesUsed.concat([comingFrom[0].toString() + node.id])
                this.propagate(toVisit.slice(1), comingFrom.slice(1), edges.slice(1), newEdgesUsed)
            } 
            else {
                let allowedImages = []


                lastNode.states.forEach((state) => {
                    allowedImages = allowedImages.concat(rules[state][incomingEdge])
                })

                let previousAllowedStates = node.states.length
                node.states = node.states.filter((state) => {return allowedImages.includes(state)})

                const newEdgesUsed = edgesUsed.concat([comingFrom[0].toString() + node.id])

                if(previousAllowedStates != node.states.length){ 
                    const comingFromArray = new Array(neighbors.length).fill(node.id)
                    
                    this.propagate(toVisit.slice(1).concat(neighbors), 
                        comingFrom.slice(1).concat(comingFromArray), 
                        edges.slice(1).concat(node.edges), 
                        newEdgesUsed)
                } else {
                    this.propagate(toVisit.slice(1), comingFrom.slice(1), edges.slice(1), newEdgesUsed)
                }
                
               
                
            }
        }

    }
}



// function main(){

//     window.requestAnimationFrame(() => {
    
//         ctx.clearRect(0, 0, canvas.width, canvas.height)
    
//         wave = new Wave()
//         step()
//     })
// }

wave = new Wave()
function step(){
    setTimeout(() => {
    
    wave.draw(ctx)
    if(wave.collapse()){
        window.requestAnimationFrame(step)
    }

    }, 0)
     
}



