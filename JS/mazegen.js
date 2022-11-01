class Maze {
    constructor (width, height = 0, maze_seed = '') {
        this.dirs = [1,2,4,8]
        this.moveX = ['',0,1,'',0,'','','',-1]
        this.moveY = ['',-1,0,'',1,'','','',0]
        this.opposite = ['',4,8,'',1,'','','',2]
        if (maze_seed === '') {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            for (let i = 0; i < 16; i++) {
                maze_seed += chars.charAt(Math.floor(Math.random() * chars.length))
            }
        }
        this.rng = new Math.seedrandom(maze_seed)
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
                if (this.mazeArray[posNext[1]][posNext[0]] === 0) {
                    this.mazeArray[posCur[1]][posCur[0]] += dir
                    this.mazeArray[posNext[1]][posNext[0]] += this.opposite[dir]
                    this.recursiveCarve(posNext)
                }
            }
        })
    }
    displayMaze () {
        const gridHolder = document.getElementById('gridholder')
        gridHolder.style.gridTemplateColumns = `repeat(${this.width}, 25px)`
        gridHolder.style.gridTemplateRows = `repeat(${this.height}, 25px)`
        this.mazeArray.forEach(row => {
            row.forEach(tile => {
                let newTile = document.createElementNS('http://www.w3.org/2000/svg','svg')
                if (tile >= 8) {
                    tile -= 8
                    const lineW = document.createElementNS('http://www.w3.org/2000/svg','line')
                    lineW.setAttribute('x1', 13)
                    lineW.setAttribute('y1', 13)
                    lineW.setAttribute('x2', 0)
                    lineW.setAttribute('y2', 13)
                    newTile.appendChild(lineW)
                }
                if (tile >= 4) {
                    tile -= 4
                    const lineS = document.createElementNS('http://www.w3.org/2000/svg','line')
                    lineS.setAttribute('x1', 13)
                    lineS.setAttribute('y1', 13)
                    lineS.setAttribute('x2', 13)
                    lineS.setAttribute('y2', 25)
                    newTile.appendChild(lineS)
                }
                if (tile >= 2) {
                    tile -= 2
                    const lineE = document.createElementNS('http://www.w3.org/2000/svg','line')
                    lineE.setAttribute('x1', 13)
                    lineE.setAttribute('y1', 13)
                    lineE.setAttribute('x2', 25)
                    lineE.setAttribute('y2', 13)
                    newTile.appendChild(lineE)
                }
                if (tile >= 1) {
                    const lineN = document.createElementNS('http://www.w3.org/2000/svg','line')
                    lineN.setAttribute('x1', 13)
                    lineN.setAttribute('y1', 13)
                    lineN.setAttribute('x2', 13)
                    lineN.setAttribute('y2', 0)
                    newTile.appendChild(lineN)
                }
                let rot = Math.floor(this.rng() * 4) * 90
                let rotPlus = rot + 90
                newTile.setAttribute('class', `rot${rot}`)
                newTile.addEventListener('click', _ => {
                    let test = newTile.removeAttribute('class')
                    console.log(test)
                    newTile.setAttribute('class', `rot${rotPlus}`)
                    rot = rotPlus
                    rotPlus = rot < 360 ? rot + 90 : 0
                })
                gridHolder.appendChild(newTile)
            })
        })
    }
}

let x = new Maze(25,25,0)
// let y = new Maze(10)
// let z = new Maze(75,75)

// console.log(x.mazeArray)
// console.log(y.mazeArray)
// console.log(z.mazeArray)

x.displayMaze()