from random import randint, seed, sample

# width = int(input('Enter maze width: '))
# height = int(input('Enter maze height: '))
# maze_seed = input('Enter seed: ')
# seed(maze_seed)

# hardcoded variables for testing
width = 10
height = 10
seed('a')

# list and dictionaries for easier reference
directions = [
    'N',
    'E',
    'S',
    'W',
]
move_x = {
    'N': 0,
    'E': 1,
    'S': 0,
    'W': -1,
}
move_y = {
    'N': -1,
    'E': 0,
    'S': 1,
    'W': 0,
}
opposite = {
    'N': 'S',
    'E': 'W',
    'S': 'N',
    'W': 'E',
}

def gen_blank(width,height):
    # empty list to hold maze
    maze_list = []
    # iterate through rows
    for y in range(height):
        # empty list to hold each row
        this_row = []
        # iterate through columns
        for x in range(width):
            # empty tile for each column as empty list
            this_row.append([])
        # add to maze list
        maze_list.append(this_row)
    return maze_list

def choose_start(width,height):
    # generate (x,y) starting coordinate
    start_x, start_y = randint(0, width - 1), randint(0, height - 1)
    return start_x, start_y

def show_maze(maze_list,width,height):
    # empty strings for maze and first row
    maze_string = ''
    first_row = ' __'
    # add top border and add to maze_string
    for x in range(width - 1):
        first_row += '___'
    maze_string += first_row + '\n'
    # iterate through rows
    for y in range(height):
        # add W wall to each row
        this_row = '|'
        # iterate through columns
        for x in range(width):
            # assign current tile to variable for simpler reading
            tile = maze_list[y][x]
            # add spaces if the tile has no bottom wall
            if 'S' in tile:
                this_row += '  '
            # add bottom wall otherwise
            else:
                this_row += '__'
            # add space if tile is missing both bottom and E walls
            if 'S' in tile and 'E' in tile:
                this_row += ' '
            # add small bottom wall if tile is only missing E wall
            elif 'E' in tile:
                this_row += '_'
            # add pip if tile has E wall
            else:
                this_row += '|'
        # add row and new line to maze_string
        maze_string += this_row + '\n'
    return maze_string

def carve_from(current_x,current_y,maze_list):
    # copy shuffled directions list to a new list
    cell_directions = sample(directions,len(directions))
    # iterate through all 4 directions
    for direction in cell_directions:
        # assign coordinates of next cell to variables
        next_x, next_y = current_x + move_x[direction], current_y + move_y[direction]
        # check if cell is within bounds and unvisited
        if 0 <= next_x < width and 0 <= next_y < height and maze_list[next_y][next_x] == []:
            # append movement direction to current cell and opposite direction to next cell if valid
            maze_list[current_y][current_x].append(direction)
            maze_list[next_y][next_x].append(opposite[direction])
            # run function on next cell
            carve_from(next_x,next_y,maze_list)

def test(maze_list,width,height):
    width_3d, height_3d = (width * 4) + 2, (height * 4) + 2
    print(width_3d, height_3d)

    
    ...

maze_list = gen_blank(width,height)
start_x, start_y = choose_start(width,height)
carve_from(start_x,start_y,maze_list)
print(show_maze(maze_list,width,height))


test(maze_list,width,height)