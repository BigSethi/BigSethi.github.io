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
    
    constructor(id, neighbors, states){
        this.id = id
        this.neighbors = neighbors
        this.states = states
        this.collapsed = false

    }

    draw(ctx){
        const img = new Image()

        img.addEventListener(
            "load",
            () => {
                ctx.drawImage(img, (this.id % 5) * 100, Math.floor(this.id / 5) * 100)
            },
            false
        )
        if(this.collapsed){
            img.src = "pipes/" + this.states[0] + ".png"
        } 
    }

}
let counter = 0
class Wave{

    constructor(){
        this.wave = new Array(25)
        
        for(let i = 0; i < this.wave.length; i++){
            const neighbors = [null, null, null, null] // top right bottom left


            if((Math.floor(i / 5) - 1) >= 0){
                neighbors[0] = (i - 5)
            }

            if((i + 1) % 5 != 0){
                neighbors[1] = (i + 1)
            }

            if((Math.floor(i / 5) + 1) < 5){
                neighbors[2] = (i + 5)
            }

            if(i % 5 != 0){
                neighbors[3] = (i - 1)
            }

            this.wave[i] = new Tile(i, neighbors, ["up", "right", "down", "left", "blank"])
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
        let min = nonCollapsed[0]
        for(let i = 0; i < nonCollapsed.length; i++){          
            if (nonCollapsed[i].states.length < min.states.length){
                min = nonCollapsed[i]
            }
        }


       if(min.states.length == 0){
            console.log("restart")
            main()
        } else {
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
            for(let i = 0; i < graph.length; i++){
                if (graph[i].id == id){
                    return graph[i]
                }
            }
            return false
        }

        function getNeighbors(id, graph){
            const neighbors = []

            getNode(id, graph).neighbors.forEach((neighbor) => {
                if(neighbor){
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

            if(edgesUsed.includes(comingFrom[0] + node.id)){
                this.propagate(toVisit.slice(1), comingFrom.slice(1), edgesUsed)
            }
          else if(node.collapsed){
                    const comingFromArray = new Array(neighbors.length).fill(node.id.toString())
                    const newEdgesUsed = edgesUsed.concat([comingFrom[0] + node.id])
                    this.propagate(toVisit.slice(1).concat(neighbors), comingFrom.slice(1).concat(comingFromArray), newEdgesUsed)
          }
             else {
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
            
                const comingFromArray = new Array(neighbors.length).fill(node.id.toString())
                const newEdgesUsed = edgesUsed.concat([comingFrom[0] + node.id])
                
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
    step()
}

function step(){
    setTimeout(() => {
    const canvas = document.getElementById("canvas")
    const ctx = canvas.getContext("2d")

    wave.draw(ctx)
    if(wave.collapse()){
        window.requestAnimationFrame(step)
    }

    }, 300)
     
}



