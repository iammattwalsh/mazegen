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
                        thisTile.rotUpdate()
                        thisTileBuilt.style.transform = `rotate(${thisTile.rotCurrent * 90}deg)`
                        this.checkMaze()
                    }
                })
                thisTileBuilt.addEventListener('contextmenu', e => {
                    e.preventDefault()
                    if (!thisTile.lock && !e.ctrlKey) {
                        thisTile.rotCurrent -= 1
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
                            thisTileBuilt.getElementsByTagName('rect')[0].classList.add('lock')
                        } else {
                            thisTileBuilt.getElementsByTagName('rect')[0].classList.remove('lock')
                        }
                        this.checkTileBlock()
                    }
                })
                thisTileBuilt.addEventListener('mouseenter', e => {
                    if ((e.buttons === 1 || e.buttons === 2) && e.ctrlKey && !this.complete) {
                        thisTile.lock = lockTarget
                        if (thisTile.lock) {
                            thisTileBuilt.getElementsByTagName('rect')[0].classList.add('lock')
                        } else {
                            thisTile.getElementsByTagName('rect')[0].classList.remove('lock')
                        }
                        this.checkTileBlock()
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
        if (countCorrect === (this.width * this.height)) {
            this.complete = true
            this.tileArray.forEach(row => {
                row.forEach(tile => {
                    tile.lock = true
                })
                Array.from(document.getElementsByClassName('pathfill')).forEach(el => {
                    el.classList.add('complete')
                })
                Array.from(document.getElementsByClassName('tilebg')).forEach(el => {
                    el.classList.remove('lock')
                })
            })
        }
    }
    checkTileBlock () {
        // loop through rows
        for (let row = 0; row < this.height; row ++) {
            // loop through columns in row
            for (let col = 0; col < this.width; col++) {
                // set current tile to variable
                let thisTile = this.tileArray[row][col]
                // variable for number of blocked directions
                let blockCount = 0
                // put adjacent tile indices in array
                let adjTiles = [[row, col -1],[row + 1, col],[row, col + 1],[row - 1, col]]
                // loop through sides of tile to find openings
                for (let dig = 0; dig < 4; dig ++) {
                    // set variable for index of matching direction on adjacent tile
                    let adjDig = dig - 2 < 0 ? dig + 2 : dig - 2
                    // if the direction is open & the tile is locked & the adjacent tile is out of bounds, increment blockCount
                    if (thisTile.binCurrent[dig] == 1 && thisTile.lock && (adjTiles[dig][0] < 0 || adjTiles[dig][0] >= this.height || adjTiles[dig][1] < 0 || adjTiles[dig][1] >= this.width)) {
                        blockCount++
                    // if the direction is open & the tile is locked & the adjacent tile does not have a matching opening & the adjacent tile is locked, increment blockCount
                    } else if (thisTile.binCurrent[dig] == 1 && thisTile.lock && this.tileArray[adjTiles[dig][0]][adjTiles[dig][1]].binCurrent[adjDig] != 1 && this.tileArray[adjTiles[dig][0]][adjTiles[dig][1]].lock) {
                        blockCount++
                    }
                    // set tile to blocked and add blocked class if blockCount indicates at least 1 block
                    if (blockCount > 0) {
                        thisTile.blocked = true
                        thisTile.element.getElementsByTagName('rect')[0].classList.add('blocked')
                    // set tile to unblocked and remove blocked class if blockCount indicates no blocks
                    } else {
                        thisTile.blocked = false
                        thisTile.element.getElementsByTagName('rect')[0].classList.remove('blocked')
                    }
                }
            }
        }
    }
    findConnected () {
        // highlight connected sets of tiles - i.e. hover over tile holding button (shift?) and all connected tiles are highlighted
        // may also be used for findLoops() method

        // current plan:
        // make array of connected tiles
        // add event listener to each connected tile
        // mouseover with shiftkey to highlight

    }
    findLoops () {
        // highlight connected loops - i.e. four corner tiles connected to each other to form a square loop

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
        this.blocked = false
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