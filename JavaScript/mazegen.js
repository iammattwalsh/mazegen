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
        this.tileArray = []
        this.complete = false
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
    displayMaze () {
        const gridHolder = document.getElementById('gridholder')
        gridHolder.style.gridTemplateColumns = `repeat(${this.width}, 40px)`
        gridHolder.style.gridTemplateRows = `repeat(${this.height}, 40px)`
        let lockTarget
        this.mazeArray.forEach(row => {
            let thisRow = []
            row.forEach(tile => {
                let thisTile = new Tile(tile,this)
                let thisTileBuilt = thisTile.build()
                thisTile.element = thisTileBuilt
                thisRow.push(thisTile)
                thisTileBuilt.addEventListener('click', e => {
                    if (!thisTile.lock && !e.ctrlKey) {
                        thisTile.rotCurrent += 1
                        // thisTile.rotDiff = thisTile.rotCurrent - thisTile.rotCorrect
                        thisTile.rotUpdate()
                        thisTileBuilt.style.transform = `rotate(${thisTile.rotCurrent * 90}deg)`
                        this.checkMaze()
                    }
                })
                thisTileBuilt.addEventListener('contextmenu', e => {
                    e.preventDefault()
                    if (!thisTile.lock && !e.ctrlKey) {
                        thisTile.rotCurrent -= 1
                        // thisTile.rotDiff = thisTile.rotCurrent - thisTile.rotCorrect
                        thisTile.rotUpdate()
                        thisTileBuilt.style.transform = `rotate(${thisTile.rotCurrent * 90}deg)`
                        this.checkMaze()
                    }
                })
                thisTileBuilt.addEventListener('mousedown', e => {
                    if (e.ctrlKey && !this.complete) {
                        thisTile.lock = !thisTile.lock
                        lockTarget = thisTile.lock
                        if (thisTile.lock) {
                            thisTileBuilt.getElementsByTagName('rect')[0].setAttribute('class','lock')
                        } else {
                            thisTileBuilt.getElementsByTagName('rect')[0].removeAttribute('class','lock')
                        }
                    }
                })
                thisTileBuilt.addEventListener('mouseenter', e => {
                    if ((e.buttons === 1 || e.buttons === 2) && e.ctrlKey && !this.complete) {
                        thisTile.lock = lockTarget
                        if (thisTile.lock) {
                            thisTileBuilt.getElementsByTagName('rect')[0].setAttribute('class','lock')
                        } else {
                            thisTile.getElementsByTagName('rect')[0].removeAttribute('class','lock')
                        }
                    }
                })
                gridHolder.appendChild(thisTileBuilt)
            })
            this.tileArray.push(thisRow)
        })
    }
    checkMaze () {
        let countCorrect = 0
        this.tileArray.forEach(row => {
            row.forEach(tile => {
                let rotCurrent = tile.rotCurrent
                while (rotCurrent > 3) {
                    rotCurrent -= 4
                }
                while (rotCurrent < 0) {
                    rotCurrent += 4
                }
                if (tile.type === 'straight') {
                    rotCurrent %= 2
                }
                if (tile.rotCorrect === rotCurrent) {
                    countCorrect++
                }
            })
        })
        // console.log(countCorrect)
        if (countCorrect === (this.width * this.height)) {
            console.log('complete')
            this.complete = true
            this.tileArray.forEach(row => {
                row.forEach(tile => {
                    tile.lock = true
                })
                Array.from(document.getElementsByClassName('pathfill')).forEach(el => {
                    el.style.fill = 'deepskyblue'
                })
            })
        } else {
            console.log('incomplete')
        }
    }
    test () {
        console.log(this.tileArray[0][0])
        console.log(this.tileArray[1][0])
        // console.log(this.tileArray[0][0].binCurrent[1])
        // console.log(this.tileArray[1][0].binCurrent[3])

        

        // if (this.tileArray[0][0].binCurrent[1] == 1 && this.tileArray[1][0].binCurrent[(1-2 < 0 ? 1-2+4 : 1-2)] != 1) {
        //     console.log('boop')
        // }

        for (let row = 0; row < this.height; row ++) {
            for (let col = 0; col < this.width; col++) {
                for (let dig = 0; dig < 4; dig ++) {
                    let adjDig = dig - 2 < 0 ? dig + 2 : dig - 2
                    if (this.tileArray[row][col].binCurrent[dig] == 1 && this.tileArray[row + 1][col].binCurrent[adjDig] != 1) {
                        ////
                        console.log(`row: ${row} col: ${col}`)
                        console.log(dig)
                        console.log(adjDig)
                        console.log(this.tileArray[row][col].binCurrent[dig])
                        console.log(this.tileArray[row + 1][col].binCurrent[adjDig])
                        ////
                        console.log('blocked')
                    } else if (this.tileArray[row][col].binCurrent[dig] == 1) {
                        ////
                        console.log(`row: ${row} col: ${col}`)
                        console.log(dig)
                        console.log(adjDig)
                        console.log(this.tileArray[row][col].binCurrent[dig])
                        console.log(this.tileArray[row + 1][col].binCurrent[adjDig])
                        ////
                        console.log('not blocked')
                    }
                }
            }

        }

        //2Y5luZVZa4pdYOjr
    }
}

class Tile {
    constructor (tileVal, maze) {
        const tileValEnd = [1,2,4,8]
        const tileValStraight = [5,10]
        const tileValCorner = [3,6,12,9]
        const tileValT = [7,14,13,11]
        this.tileVal = tileVal
        if (tileValEnd.includes(this.tileVal)) {
            this.type = 'end'
            this.rotCorrect = tileValEnd.indexOf(this.tileVal)
            this.paths = this.recipeEnd()
        } else if (tileValStraight.includes(this.tileVal)) {
            this.type = 'straight'
            this.rotCorrect = tileValStraight.indexOf(this.tileVal)
            this.paths = this.recipeStraight()
        } else if (tileValCorner.includes(this.tileVal)) {
            this.type = 'corner'
            this.rotCorrect = tileValCorner.indexOf(this.tileVal)
            this.paths = this.recipeCorner()
        } else if (tileValT.includes(this.tileVal)) {
            this.type = 't'
            this.rotCorrect = tileValT.indexOf(this.tileVal)
            this.paths = this.recipeT()
        }
        this.rotCurrent = Math.floor(maze.rng() * 4)
        this.lock = false
        this.element
        this.binCorrect
        this.rotDiff
        this.binCurrent
        this.rotUpdate()
    }
    build () {
        let newTile = this.recipeBasic()
        this.paths.forEach(path => {
            newTile.appendChild(path)
        })
        return newTile
    }
    rotUpdate () {
        this.rotDiff = this.rotCurrent - this.rotCorrect
        while (this.rotDiff > 3) {
            this.rotDiff -= 4
        }
        while (this.rotDiff < 0) {
            this.rotDiff += 4
        }
        this.binCorrect = this.tileVal.toString(2).padStart(4,'0')
        this.binCurrent = this.binCorrect.slice(this.rotDiff) + this.binCorrect.slice(0,this.rotDiff)
    }
    recipeBasic () {
        let newTile = document.createElementNS('http://www.w3.org/2000/svg','svg')
        const tileBG = document.createElementNS('http://www.w3.org/2000/svg','rect')
        tileBG.setAttribute('width','40px')
        tileBG.setAttribute('height','40px')
        tileBG.setAttribute('class','tilebg')
        newTile.appendChild(tileBG)
        newTile.style.transform = `rotate(${this.rotCurrent * 90}deg)`
        return newTile
    }
    recipeEnd () {
        const pathFill = document.createElementNS('http://www.w3.org/2000/svg','path')
        pathFill.setAttribute('d','M25 0 L25 10 L30 10 L30 30 L10 30 L10 10 L15 10 L15 0 L25 0')
        pathFill.setAttribute('class','pathfill')
        const pathStroke = document.createElementNS('http://www.w3.org/2000/svg','path')
        pathStroke.setAttribute('d','M25 0 L25 10 L30 10 L30 30 L10 30 L10 10 L15 10 L15 0')
        pathStroke.setAttribute('class','pathstroke')
        return [pathFill, pathStroke]
    }
    recipeStraight () {
        const pathFill = document.createElementNS('http://www.w3.org/2000/svg','path')
        pathFill.setAttribute('class','pathfill')
        pathFill.setAttribute('d','M25 0 L25 40 L15 40 L15 0 L25 0')
        const pathStroke1 = document.createElementNS('http://www.w3.org/2000/svg','path')
        pathStroke1.setAttribute('class','pathstroke')
        pathStroke1.setAttribute('d','M25 0 L25 40')
        const pathStroke2 = document.createElementNS('http://www.w3.org/2000/svg','path')
        pathStroke2.setAttribute('class','pathstroke')
        pathStroke2.setAttribute('d','M15 0 L15 40')
        return [pathFill, pathStroke1, pathStroke2]
    }
    recipeCorner () {
        const pathFill = document.createElementNS('http://www.w3.org/2000/svg','path')
        pathFill.setAttribute('d','M25 0 L25 15 L40 15 L40 25 L15 25 L15 0 L25 0')
        pathFill.setAttribute('class','pathfill')
        const pathStroke1 = document.createElementNS('http://www.w3.org/2000/svg','path')
        pathStroke1.setAttribute('class','pathstroke')
        pathStroke1.setAttribute('d','M25 0 L25 15 L40 15')
        const pathStroke2 = document.createElementNS('http://www.w3.org/2000/svg','path')
        pathStroke2.setAttribute('class','pathstroke')
        pathStroke2.setAttribute('d','M15 0 L15 25 L40 25')
        return [pathFill, pathStroke1, pathStroke2]
    }
    recipeT () {
        const pathFill = document.createElementNS('http://www.w3.org/2000/svg','path')
        pathFill.setAttribute('d','M25 0 L25 15 L40 15 L40 25 L25 25 L25 40 L15 40 L15 0 L25 0')
        pathFill.setAttribute('class','pathfill')
        const pathStroke1 = document.createElementNS('http://www.w3.org/2000/svg','path')
        pathStroke1.setAttribute('class','pathstroke')
        pathStroke1.setAttribute('d','M15 0 L15 40')
        const pathStroke2 = document.createElementNS('http://www.w3.org/2000/svg','path')
        pathStroke2.setAttribute('class','pathstroke')
        pathStroke2.setAttribute('d','M25 0 L25 15 L40 15')
        const pathStroke3 = document.createElementNS('http://www.w3.org/2000/svg','path')
        pathStroke3.setAttribute('class','pathstroke')
        pathStroke3.setAttribute('d','M40 25 L25 25 L25 40')
        return [pathFill, pathStroke1, pathStroke2, pathStroke3]
    }
}

// let x = new Maze(25,25,0)
// let y = new Maze(10)
// let z = new Maze(75,75)

// console.log(x.mazeArray)
// console.log(y.mazeArray)
// console.log(z.mazeArray)

// x.displayMaze()
// y.displayMaze()
// z.displayMaze()

let testMaze = new Maze(5,5,'2Y5luZVZa4pdYOjr')
testMaze.displayMaze()
console.log(testMaze.mazeSeed)
// console.log(testMaze.mazeArray)

// need ability to highlight connected sets of tiles - i.e. hover over tile holding button (shift?) and all connected tiles are highlighted
// need ability to highlight tiles locked in invalid positions - not incorrect positions, but invalid e.g. an opening touching a wall
// need ability to highlight connected loops - i.e. four corner tiles connected to each other to form a square loop