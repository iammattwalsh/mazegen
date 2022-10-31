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

        // adding in dimensional limits, but they may not be necessary
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
        // this.dims = (width, height) // saving each dim as its own attribute seems better - will delete if okay
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
            // console.log(this.mazeArray[posNext[1]][posNext[0]])
            console.log(`x: ${posNext[0]} y: ${posNext[1]}`)
            // console.log(0 <= posNext[0] < this.width)
            console.log(0 <= posNext[1] && posNext[1] < this.height)

            console.log(0 <= posNext[1])
            console.log(posNext[1] < this.height)

            console.log(this.mazeArray[posNext[1]][posNext[0]] === 0)
            if ((0 <= posNext[0] && posNext[0] < this.width) && (0 <= posNext[1] && posNext[1] < this.height) && (this.mazeArray[posNext[1]][posNext[0]] === 0)) {
                if (this.mazeArray[posNext[1]][posNext[0]] === 0) {
                    this.mazeArray[posCur[1]][posCur[0]] += dir
                    this.mazeArray[posNext[1]][posNext[0]] += this.opposite[dir]
                    this.recursiveCarve(posNext)
                }
            }
        })
    }
}

let x = new Maze(25,25,0)

// let y = new Maze(10)

// console.log(x.mazeArray)
// console.log(y.mazeArray)