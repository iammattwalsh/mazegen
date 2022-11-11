class Maze {
    constructor (width, height = 0, mazeSeed = '') {
        this.dirs = [1,2,4,8]
        this.moveX = ['',0,1,'',0,'','','',-1]
        this.moveY = ['',-1,0,'',1,'','','',0]
        this.opposite = ['',4,8,'',1,'','','',2]
        // generates a random seed if none provided
        if (mazeSeed === '') {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            for (let i = 0; i < 16; i++) {
                mazeSeed += chars.charAt(Math.floor(Math.random() * chars.length))
            }
        }
        this.mazeSeed = mazeSeed
        // uses external method to add seeded randomization and sets to variable
        this.rng = new Math.seedrandom(mazeSeed)
        // puts upper bound on dimensions to avoid stack overflows (NEEDS ADJUSTMENT AS OVERFLOWS CAN STILL OCCUR AT 75x75)
        if (width > 75) {
            width = 75
        }
        // also sets height to match width if only one dimension given
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
        // generates blank grid to be filled with tiles
        this.genBlank()
        // sets starting position using seeded randomization
        this.posStart = [Math.floor(this.rng() * this.width),Math.floor(this.rng() * this.height)]
        // calls recursiveCarve method to generate tiles to fill grid
        this.recursiveCarve(this.posStart)
        this.connectedTiles = []
        this.connectedTilesAreLoop = false
        this.sourceTile
        this.connectedTilesToSource = []
        this.connectedTilesToSourceAreLoop = false
    }
    genBlank () {
        // generates array of arrays based on width & height
        for (let y = 0; y < this.height; y++) {
            let thisRow = []
            for (let x = 0; x < this.width; x++) {
                thisRow.push(0)
            }
            this.mazeArray.push(thisRow)
        }
    }
    recursiveCarve (posCur) {
        // makes a shuffled copy of dirs array
        let cellDirs = [...this.dirs]
            .map(val => ({val, sort: this.rng()}))
            .sort((a,b) => a.sort - b.sort)
            .map(({val}) => val)
        // iterates over available directions
        cellDirs.forEach(dir => {
            // sets next tile to run method against
            let posNext = [posCur[0] + this.moveX[dir], posCur[1] + this.moveY[dir]]
            // ensures the next tile is within bounds and has not yet been visited
            if ((0 <= posNext[0] && posNext[0] < this.width) && (0 <= posNext[1] && posNext[1] < this.height) && (this.mazeArray[posNext[1]][posNext[0]] === 0)) {
                // limits number of connections per tile to a maximum of 3
                if (this.mazeArray[posCur[1]][posCur[0]] + dir < 15) {
                    // changes value of current and next tiles if a connection is valid
                    this.mazeArray[posCur[1]][posCur[0]] += dir
                    this.mazeArray[posNext[1]][posNext[0]] += this.opposite[dir]
                    // runs recursiveCarve against the next tile
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
                // creates new tiles, builds them, adds them to the tile object, and adds the tile object to its row array within tileArray
                let thisTile = new Tile(tile,this)
                let thisTileBuilt = thisTile.build()
                thisTile.element = thisTileBuilt
                thisRow.push(thisTile)
                thisTile.indices = [this.mazeArray.indexOf(row), thisRow.indexOf(thisTile)]
                // adds clockwise rotation of unlocked tiles when left-clicked
                thisTileBuilt.addEventListener('click', e => {
                    // limits operation to unlocked tiles, and only when the ctrl key is not pressed
                    if (!thisTile.lock && !e.ctrlKey) {
                        // adjusts rotation internally and visually
                        thisTile.rotCurrent += 1
                        thisTile.rotUpdate()
                        thisTileBuilt.style.transform = `rotate(${thisTile.rotCurrent * 90}deg)`
                        // checks to see if the current tile is connected to the source tile
                        this.findConnectedRun(this.sourceTile, true)
                        // checks to see if the maze is complete
                        this.checkMaze()
                    }
                })
                // same as above but for counter-clockwise rotation when right-clicked
                thisTileBuilt.addEventListener('contextmenu', e => {
                    e.preventDefault()
                    if (!thisTile.lock && !e.ctrlKey) {
                        thisTile.rotCurrent -= 1
                        thisTile.rotUpdate()
                        thisTileBuilt.style.transform = `rotate(${thisTile.rotCurrent * 90}deg)`
                        this.findConnectedRun(this.sourceTile, true)
                        this.checkMaze()
                    }
                })
                // allows tile to be locked/unlocked and sets that status to a variable for use in the next event listener
                thisTileBuilt.addEventListener('mousedown', e => {
                    // limits operation to when the ctrl key is pressed and the maze is incomplete
                    if (e.ctrlKey && !this.complete) {
                        thisTile.lock = !thisTile.lock
                        lockTarget = thisTile.lock
                        // adjusts style to show lock status
                        if (thisTile.lock) {
                            thisTileBuilt.getElementsByTagName('rect')[0].classList.add('lock')
                        } else {
                            thisTileBuilt.getElementsByTagName('rect')[0].classList.remove('lock')
                        }
                        // checks if any locked tiles are blocked by this tile being locked
                        this.checkTileBlock()
                    }
                })
                // adds press-and-hold locking/unlocking to above event listener and adds shift-hover to show run of tiles connected to the tile currently hovered
                thisTileBuilt.addEventListener('mouseenter', e => {
                    // sets browser focus to tile being hovered
                    thisTileBuilt.focus()
                    // check if the mouse is right or left clicked, ctrl key is pressed, and the maze is incomplete when hovered
                    if ((e.buttons === 1 || e.buttons === 2) && e.ctrlKey && !this.complete) {
                        // uses variable set above to assign lock status
                        thisTile.lock = lockTarget
                        // adjusts style to show lock status
                        if (thisTile.lock) {
                            thisTileBuilt.getElementsByTagName('rect')[0].classList.add('lock')
                        } else {
                            thisTileBuilt.getElementsByTagName('rect')[0].classList.remove('lock')
                        }
                        // checks if any locked tiles are blocked by this tile being locked
                        this.checkTileBlock()
                    // if the shift key is pressed, run findConnectedRun instead
                    } else if (e.shiftKey) {
                        this.findConnectedRun(thisTile)
                    }
                })
                // run findConnectedRun against the currently hovered tile (set to focus in above method)
                thisTileBuilt.addEventListener('keydown', e => {
                    if (e.shiftKey) {
                        this.findConnectedRun(thisTile)
                    }
                })
                // adds tile to DOM
                gridHolder.appendChild(thisTileBuilt)
            })
            // adds tile to tileArray
            this.tileArray.push(thisRow)
        })
        // sets sourceTile based on starting coordinates and highlights all tiles connected to it
        this.sourceTile = this.tileArray[this.posStart[0]][this.posStart[1]]
        this.findConnectedRun(this.sourceTile, true)
    }
    checkMaze () {
        let countCorrect = 0
        // iterates through all tiles to check their rotation against the solution
        this.tileArray.forEach(row => {
            row.forEach(tile => {
                // sets tile's rotation to temporary variable and adjusts it to be within bounds (0-3)
                let rotCurrent = tile.rotCurrent
                while (rotCurrent > 3) {
                    rotCurrent -= 4
                }
                while (rotCurrent < 0) {
                    rotCurrent += 4
                }
                // allows a straight tile to be viewed as correct if it is rotated 180deg from the solution
                if (tile.type === 'straight') {
                    rotCurrent %= 2
                }
                // iterate counter if the tile is correct
                if (tile.rotCorrect === rotCurrent) {
                    countCorrect++
                }
            })
        })
        // sets the maze to complete if the number of correct tiles is equal to the total number of tiles
        if (countCorrect === (this.width * this.height)) {
            this.complete = true
            // locks all tiles and adjusts them visually when the maze is complete
            this.clearConnected()
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
        this.tileArray.forEach(row => {
            row.forEach(tile => {
                // sets variable for number of blocked directions
                let blockedCount = 0
                // puts adjacent tile indices in array
                let adjTilesIndices = [
                    [tile.indices[0], tile.indices[1] - 1],
                    [tile.indices[0] + 1, tile.indices[1]],
                    [tile.indices[0], tile.indices[1] + 1],
                    [tile.indices[0] - 1, tile.indices[1]],
                ]
                for (let dig = 0; dig < 4; dig ++) {
                    // sets variable for index of matching direction on adjacent tile
                    let adjDig = dig - 2 < 0 ? dig + 2 : dig - 2
                    // increments blockedCount if the direction is open & the tile is locked & the adjacent tile is out of bounds
                    if (tile.binCurrent[dig] == 1 && tile.lock && (adjTilesIndices[dig][0] < 0 || adjTilesIndices[dig][0] >= this.height || adjTilesIndices[dig][1] < 0 || adjTilesIndices[dig][1] >= this.width)) {
                        blockedCount++
                    // increments blockedCount if the direction is open & the tile is locked & the adjacent tile does not have a matching opening & the adjacent tile is locked
                    } else if (tile.binCurrent[dig] == 1 && tile.lock && this.tileArray[adjTilesIndices[dig][0]][adjTilesIndices[dig][1]].binCurrent[adjDig] != 1 && this.tileArray[adjTilesIndices[dig][0]][adjTilesIndices[dig][1]].lock) {
                        blockedCount++
                    }
                    // sets tile to blocked and add blocked class if blockedCount indicates at least 1 block
                    if (blockedCount > 0) {
                        tile.blocked = true
                        tile.element.getElementsByTagName('rect')[0].classList.add('blocked')
                    // sets tile to unblocked and remove blocked class if blockedCount indicates no blocks
                    } else {
                        tile.blocked = false
                        tile.element.getElementsByTagName('rect')[0].classList.remove('blocked')
                    }
                }
            })
        })
    }
    findConnectedRun (tile, sourceMode = false) {
        // clears current array and style
        this.clearConnected(sourceMode)
        // runs findConnected to build array of connected tiles
        this.findConnected(tile, sourceMode)
        // checks which mode the method is run in and applies appropriate classes
        if (sourceMode) {
            this.connectedTilesToSource.forEach(tile => {
                if (this.connectedTilesToSourceAreLoop) {
                    tile.element.getElementsByClassName('pathfill')[0].classList.add('loop')
                } else {
                    tile.element.getElementsByClassName('pathfill')[0].classList.add('complete')
                }
            })
        } else {
            this.connectedTiles.forEach(tile => {
                if (!this.complete) {
                    if (this.connectedTilesAreLoop) {
                        tile.element.getElementsByClassName('pathfill')[0].classList.add('loop')
                    } else {
                        tile.element.getElementsByClassName('pathfill')[0].classList.add('highlighted')
                    }
                }
            })
        }
    }
    clearConnected (sourceMode) {
        // checks which mode the method is run in and removes appropriate classes
        if (sourceMode) {
            this.connectedTilesToSourceAreLoop = false
            this.connectedTilesToSource.forEach(tile => {
                tile.element.getElementsByClassName('pathfill')[0].classList.remove('loop')
                tile.element.getElementsByClassName('pathfill')[0].classList.remove('complete')
            })
            this.connectedTilesToSource = [this.sourceTile]
        } else {
            this.connectedTilesAreLoop = false
            this.connectedTiles.forEach(tile => {
                tile.element.getElementsByClassName('pathfill')[0].classList.remove('highlighted')
                tile.element.getElementsByClassName('pathfill')[0].classList.remove('loop')
            })
            this.connectedTiles = []
        }
    }
    findConnected (tile, sourceMode, prevDig = null) {
        // makes array of coordinates of adjacent tiles
        let adjTilesIndices = [
            [tile.indices[0], tile.indices[1] - 1],
            [tile.indices[0] + 1, tile.indices[1]],
            [tile.indices[0], tile.indices[1] + 1],
            [tile.indices[0] - 1, tile.indices[1]],
        ]
        // pushes tiles to appropriate array based on the mode method is run in
        if (sourceMode) {
            if (!this.connectedTilesToSource.includes(tile)) {
                this.connectedTilesToSource.push(tile)
            }
        } else {
            if (!this.connectedTiles.includes(tile)) {
                this.connectedTiles.push(tile)
            }
        }
        // iterates through all sides of the tile
        for (let dig = 0; dig < 4; dig++) {
            // assigns variable for opposite side to use on adjacent tile
            let adjDig = dig - 2 < 0 ? dig + 2 : dig - 2
            // checks to see if there is an open connection on this side of the tile, the adjacent tile is within bounds, and this connection has not already been checked
            if (tile.binCurrent[dig] == 1 && adjTilesIndices[dig][0] >= 0 && adjTilesIndices[dig][0] < this.height && adjTilesIndices[dig][1] >= 0 && adjTilesIndices[dig][1] < this.width && prevDig != dig) {
                // assigns the adjacent tile to a variable
                let nextTile = this.tileArray[adjTilesIndices[dig][0]][adjTilesIndices[dig][1]]
                // checks to see if there is a matching open connection on the adjacent tile
                if (nextTile.binCurrent[adjDig] == 1) {
                    // choose which variables to check/adjust based on the mode the method is run in
                    if (sourceMode) {
                        // runs method against the next connected tile if it is not already in the array
                        if (!this.connectedTilesToSource.includes(nextTile)) {
                            this.findConnected(nextTile, sourceMode, adjDig)
                        } else {
                            // flags a loop if the tile is already in the array
                            this.connectedTilesToSourceAreLoop = true
                        }
                    } else {
                        if (!this.connectedTiles.includes(nextTile)) {
                            this.findConnected(nextTile, sourceMode, adjDig)
                        } else {
                            this.connectedTilesAreLoop = true
                        }
                    }
                }
            }
        }
    }
}

class Tile {
    constructor (tileVal, maze) {
        // sets arrays that contain values corresponding to different tile types
        const tileValEnd = [1,2,4,8]
        const tileValStraight = [5,10]
        const tileValCorner = [3,6,12,9]
        const tileValT = [7,14,13,11]
        this.tileVal = tileVal
        // checks/saves what type the tile is, saves the correct rotation, and assigns the recipe method corresponding to tile type
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
        // sets a starting rotation using seeded randomization
        this.rotCurrent = Math.floor(maze.rng() * 4)
        this.lock = false
        this.blocked = false
        this.element
        this.indices
        // converts tilVal to binary for use in checking connections
        this.binCorrect = this.tileVal.toString(2).padStart(4,'0')
        this.rotDiff
        this.binCurrent
        this.rotUpdate()
    }
    build () {
        // builds and returns a tile using the base recipe and the recipe chosen above
        let newTile = this.recipeBase()
        this.paths.forEach(path => {
            newTile.appendChild(path)
        })
        return newTile
    }
    rotUpdate () {
        // sets variable for difference between current and correct rotation
        this.rotDiff = this.rotCurrent - this.rotCorrect
        while (this.rotDiff > 3) {
            this.rotDiff -= 4
        }
        while (this.rotDiff < 0) {
            this.rotDiff += 4
        }
        // converts current tileVal factoring rotation to binary for use in checking connections
        this.binCurrent = this.binCorrect.slice(this.rotDiff) + this.binCorrect.slice(0,this.rotDiff)
    }
    recipeBase () {
        let newTile = document.createElementNS('http://www.w3.org/2000/svg','svg')
        newTile.setAttribute('tabindex','0')
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

// // generates a maze using 1 argument (width)
// // height will automatically match width and seed will be randomly generated
// let example1 = new Maze(10)

// // generates a maze using 2 arguments (width, height)
// // seed will be randomly generated
// let example2 = new Maze(10,10)

// // generates a maze using all 3 arguments
// let example3 = new Maze(10,10,'seed string')

let testMaze = new Maze(5)
testMaze.displayMaze()
console.log(testMaze.mazeSeed)