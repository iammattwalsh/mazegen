class Maze {
    constructor (width, height = 0, mazeSeed = '') {
        this.dirs = [1,2,4,8]
        this.moveX = ['',0,1,'',0,'','','',-1]
        this.moveY = ['',-1,0,'',1,'','','',0]
        this.opposite = ['',4,8,'',1,'','','',2]
        if (mazeSeed === '') {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            for (let i = 0; i < 16; i++) {
                mazeSeed += chars.charAt(Math.floor(Math.random() * chars.length))
            }
        }
        this.mazeSeed = mazeSeed
        this.rng = new Math.seedrandom(mazeSeed)
        if (width > 75) {
            width = 75
        }
        if (height > 75) {
            height = 75
        } else if (height === 0) {
            height = width
        }
        this.width = width
        this.height = height
        this.mazeArray = []
        this.genBlank()
        this.posStart = [Math.floor(this.rng() * this.width),Math.floor(this.rng() * this.height)]
        this.recursiveCarve(this.posStart)
    }
    genBlank () {
        for (let y = 0; y < this.height; y++) {
            let thisRow = []
            for (let x = 0; x < this.width; x++) {
                thisRow.push(0)
            }
            this.mazeArray.push(thisRow)
        }
    }
    recursiveCarve (posCur) {
        let cellDirs = [...this.dirs]
            .map(val => ({val, sort: this.rng()}))
            .sort((a,b) => a.sort - b.sort)
            .map(({val}) => val)
        cellDirs.forEach(dir => {
            let posNext = [posCur[0] + this.moveX[dir], posCur[1] + this.moveY[dir]]
            if ((0 <= posNext[0] && posNext[0] < this.width) && (0 <= posNext[1] && posNext[1] < this.height) && (this.mazeArray[posNext[1]][posNext[0]] === 0)) {
                if (this.mazeArray[posNext[1]][posNext[0]] === 0 && this.mazeArray[posCur[1]][posCur[0]] + dir < 15) {
                    this.mazeArray[posCur[1]][posCur[0]] += dir
                    this.mazeArray[posNext[1]][posNext[0]] += this.opposite[dir]
                    this.recursiveCarve(posNext)
                }
            }
        })
    }
    // displayMaze () {
    //     const gridHolder = document.getElementById('gridholder')
    //     gridHolder.style.gridTemplateColumns = `repeat(${this.width}, 40px)`
    //     gridHolder.style.gridTemplateRows = `repeat(${this.height}, 40px)`
    //     this.mazeArray.forEach(row => {
    //         row.forEach(tile => {
    //             let newTile = document.createElementNS('http://www.w3.org/2000/svg','svg')
    //             if (tile >= 8) {
    //                 tile -= 8
    //                 const lineW = document.createElementNS('http://www.w3.org/2000/svg','line')
    //                 lineW.setAttribute('x1', 20)
    //                 lineW.setAttribute('y1', 20)
    //                 lineW.setAttribute('x2', 0)
    //                 lineW.setAttribute('y2', 20)
    //                 newTile.appendChild(lineW)
    //             }
    //             if (tile >= 4) {
    //                 tile -= 4
    //                 const lineS = document.createElementNS('http://www.w3.org/2000/svg','line')
    //                 lineS.setAttribute('x1', 20)
    //                 lineS.setAttribute('y1', 20)
    //                 lineS.setAttribute('x2', 20)
    //                 lineS.setAttribute('y2', 40)
    //                 newTile.appendChild(lineS)
    //             }
    //             if (tile >= 2) {
    //                 tile -= 2
    //                 const lineE = document.createElementNS('http://www.w3.org/2000/svg','line')
    //                 lineE.setAttribute('x1', 20)
    //                 lineE.setAttribute('y1', 20)
    //                 lineE.setAttribute('x2', 40)
    //                 lineE.setAttribute('y2', 20)
    //                 newTile.appendChild(lineE)
    //             }
    //             if (tile >= 1) {
    //                 const lineN = document.createElementNS('http://www.w3.org/2000/svg','line')
    //                 lineN.setAttribute('x1', 20)
    //                 lineN.setAttribute('y1', 20)
    //                 lineN.setAttribute('x2', 20)
    //                 lineN.setAttribute('y2', 0)
    //                 newTile.appendChild(lineN)
    //             }
    //             if (newTile.childElementCount === 1) {
    //                 const center = document.createElementNS('http://www.w3.org/2000/svg','circle')
    //                 center.setAttribute('cx', 20)
    //                 center.setAttribute('cy', 20)
    //                 center.setAttribute('r', 5)
    //                 newTile.appendChild(center)
    //             }
    //             let rot = Math.floor(this.rng() * 4) * 90
    //             newTile.style.transform = `rotate(${rot}deg)`
    //             newTile.addEventListener('click', _ => {
    //                 rot += 90
    //                 newTile.style.transform = `rotate(${rot}deg)`
    //             })
    //             newTile.addEventListener('contextmenu', e => {
    //                 e.preventDefault()
    //                 rot -= 90
    //                 newTile.style.transform = `rotate(${rot}deg)`
    //             })
    //             gridHolder.appendChild(newTile)
    //         })
    //     })
    // }
    displayMazeNew () {
        const gridHolder = document.getElementById('gridholder')
        gridHolder.style.gridTemplateColumns = `repeat(${this.width}, 40px)`
        gridHolder.style.gridTemplateRows = `repeat(${this.height}, 40px)`
        this.mazeArray.forEach(row => {
            row.forEach(tile => {
                let newTile = document.createElementNS('http://www.w3.org/2000/svg','svg')
                const tileBG = document.createElementNS('http://www.w3.org/2000/svg','rect')
                tileBG.setAttribute('width','40px')
                tileBG.setAttribute('height','40px')
                tileBG.setAttribute('class','tilebg')
                newTile.appendChild(tileBG)



                const tileValEnd = [1,2,4,8]
                const tileValStraight = [5,10]
                const tileValCorner = [3,6,12,9]
                const tileValT = [7,14,13,11]
                let rotMult

                if (tileValEnd.includes(tile)) {
                    rotMult = tileValEnd.indexOf(tile)
                    // console.log(rotMult)

                    const pathFill = document.createElementNS('http://www.w3.org/2000/svg','path')
                    pathFill.setAttribute('d','M25 0 L25 10 L30 10 L30 30 L10 30 L10 10 L15 10 L15 0 L25 0')
                    pathFill.setAttribute('class','pathfill')
                    newTile.appendChild(pathFill)

                    const pathStroke = document.createElementNS('http://www.w3.org/2000/svg','path')
                    pathStroke.setAttribute('d','M25 0 L25 10 L30 10 L30 30 L10 30 L10 10 L15 10 L15 0')
                    pathStroke.setAttribute('class','pathstroke')
                    newTile.appendChild(pathStroke)
                    newTile.style.transform = `rotate(${rotMult * 90}deg)`
                } else if (tileValStraight.includes(tile)) {
                    rotMult = tileValStraight.indexOf(tile)
                    // console.log(rotMult)

                    const pathFill = document.createElementNS('http://www.w3.org/2000/svg','path')
                    pathFill.setAttribute('class','pathfill')
                    pathFill.setAttribute('d','M25 0 L25 40 L15 40 L15 0 L25 0')
                    newTile.appendChild(pathFill)

                    const pathStroke1 = document.createElementNS('http://www.w3.org/2000/svg','path')
                    pathStroke1.setAttribute('class','pathstroke')
                    pathStroke1.setAttribute('d','M25 0 L25 40')
                    newTile.appendChild(pathStroke1)
                    const pathStroke2 = document.createElementNS('http://www.w3.org/2000/svg','path')
                    pathStroke2.setAttribute('class','pathstroke')
                    pathStroke2.setAttribute('d','M15 0 L15 40')
                    newTile.appendChild(pathStroke2)

                    newTile.style.transform = `rotate(${rotMult * 90}deg)`
                } else if (tileValCorner.includes(tile)) {
                    rotMult = tileValCorner.indexOf(tile)
                    // console.log(rotMult)

                    const pathFill = document.createElementNS('http://www.w3.org/2000/svg','path')
                    pathFill.setAttribute('d','M25 0 L25 15 L40 15 L40 25 L15 25 L15 0 L25 0')
                    pathFill.setAttribute('class','pathfill')
                    newTile.appendChild(pathFill)

                    const pathStroke1 = document.createElementNS('http://www.w3.org/2000/svg','path')
                    pathStroke1.setAttribute('class','pathstroke')
                    pathStroke1.setAttribute('d','M25 0 L25 15 L40 15')
                    newTile.appendChild(pathStroke1)
                    const pathStroke2 = document.createElementNS('http://www.w3.org/2000/svg','path')
                    pathStroke2.setAttribute('class','pathstroke')
                    pathStroke2.setAttribute('d','M15 0 L15 25 L40 25')
                    newTile.appendChild(pathStroke2)

                    newTile.style.transform = `rotate(${rotMult * 90}deg)`
                } else if (tileValT.includes(tile)) {
                    rotMult = tileValT.indexOf(tile)
                    // console.log(rotMult)

                    const pathFill = document.createElementNS('http://www.w3.org/2000/svg','path')
                    pathFill.setAttribute('d','M25 0 L25 15 L40 15 L40 25 L25 25 L25 40 L15 40 L15 0 L25 0')
                    pathFill.setAttribute('class','pathfill')
                    newTile.appendChild(pathFill)

                    const pathStroke1 = document.createElementNS('http://www.w3.org/2000/svg','path')
                    pathStroke1.setAttribute('class','pathstroke')
                    pathStroke1.setAttribute('d','M15 0 L15 40')
                    newTile.appendChild(pathStroke1)
                    const pathStroke2 = document.createElementNS('http://www.w3.org/2000/svg','path')
                    pathStroke2.setAttribute('class','pathstroke')
                    pathStroke2.setAttribute('d','M25 0 L25 15 L40 15')
                    newTile.appendChild(pathStroke2)
                    const pathStroke3 = document.createElementNS('http://www.w3.org/2000/svg','path')
                    pathStroke3.setAttribute('class','pathstroke')
                    pathStroke3.setAttribute('d','M40 25 L25 25 L25 40')
                    newTile.appendChild(pathStroke3)

                    newTile.style.transform = `rotate(${rotMult * 90}deg)`
                }
                let rot = rotMult * 90
                // let rot = Math.floor(this.rng() * 4) * 90
                // newTile.style.transform = `rotate(${rot}deg)`
                newTile.addEventListener('click', _ => {
                    rot += 90
                    newTile.style.transform = `rotate(${rot}deg)`
                })
                newTile.addEventListener('contextmenu', e => {
                    e.preventDefault()
                    rot -= 90
                    newTile.style.transform = `rotate(${rot}deg)`
                })

                gridHolder.appendChild(newTile)
            })
        })
    }
}

// class Tile {
//     constructor (tileVal) {
//         const tileValEnd = [1,2,4,8]
//         const tileValStraight = [5,10]
//         const tileValCorner = [3,6,12,9]
//         const tileValT = [7,14,13,11]
//         if (tileValEnd.includes(tileVal)) {
//             this.type = 'end'
//             this.rotCorrect = tileValEnd.indexOf(tileVal)
//         } else if (tileValStraight.includes(tileVal)) {
//             this.type = 'straight'
//             this.rotCorrect = tileValStraight.indexOf(tileVal)
//         } else if (tileValCorner.includes(tileVal)) {
//             this.type = 'corner'
//             this.rotCorrect = tileValCorner.indexOf(tileVal)
//         } else if (tileValT.includes(tileVal)) {
//             this.type = 't'
//             this.rotCorrect = tileValT.indexOf(tileVal)
//         }
//         this.rotCurrent = Math.floor(Maze.rng() * 4) * 90
//     }
//     make () {

//     }
// }

// let x = new Maze(25,25,0)
let y = new Maze(10)
// let z = new Maze(75,75)

// console.log(x.mazeArray)
// console.log(y.mazeArray)
// console.log(z.mazeArray)

// x.displayMaze()
y.displayMazeNew()
console.log(y.mazeSeed)


// tNTPxUGb12vCRnez -- seed that previously contained 4-way intersection