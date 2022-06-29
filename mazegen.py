"""

Notes - 

direction list: 
0 - North
1 - East
2 - South
3 - West

tile list:
0 - blank (not generated)
1 - N
2 - E
3 - S
4 - W
5 - N + S
6 - E + W
7 - N + E
8 - E + S
9 - S + W
10 - W + N
11 - N + E + S
12 - E + S + W
13 - S + W + N
14 - W + N + E

includes S:
3
5
8
9
11
12
13

includes E:
2
6
7
8
11
12
14

(if 4-way):
15 - N + E + S + W

blank:
 __ __ __ __ __ __ __ __ __ __
|__|__|__|__|__|__|__|__|__|__|
|__|__|__|__|__|__|__|__|__|__|
|__|__|__|__|__|__|__|__|__|__|
|__|__|__|__|__|__|__|__|__|__|
|__|__|__|__|__|__|__|__|__|__|
|__|__|__|__|__|__|__|__|__|__|
|__|__|__|__|__|__|__|__|__|__|
|__|__|__|__|__|__|__|__|__|__|
|__|__|__|__|__|__|__|__|__|__|
|__|__|__|__|__|__|__|__|__|__|

"""

from random import choice, randint

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

def gen_maze_parent(maze_list,width,height):
    # generate (x,y) starting coordinate
    start = (randint(0, width - 1), randint(0, height - 1))
    return start
    ...

def gen_maze_child(maze_list,width,height,position):
    # add tiles that are N, E, S, & W to list
    all_tiles = [
        # N
        (position[0], position[1] - 1),
        # E
        (position[0] + 1, position[1]),
        # S
        (position[0], position[1] + 1),
        # W
        (position[0] - 1, position[1]),
    ]
    open_tiles = []
    # remove invalid tiles
    for tile in all_tiles:
        # print(f'tile[1]::: {tile[1]} - tile[0]::: {tile[0]}')
        # print(f'maze_list[tile[1]][tile[0]]::: {maze_list[tile[1]][tile[0]]}')
        
        if tile[0] >= 0 and tile[0] < width:
            if tile[1] >= 0 and tile[1] < height:
                if maze_list[tile[1]][tile[0]] == []:
                    open_tiles.append(tile)




        # # remove tiles that are out of bounds on x axis
        # if tile[0] < 0 or tile[0] == width:
        #     open_tiles.pop(open_tiles.index(tile))
        # # remove tiles that are out of bounds on y axis
        # elif tile[1] < 0 or tile[1] == height:
        #     open_tiles.pop(open_tiles.index(tile))
        # # remove tiles that are already generated
        # elif maze_list[tile[1]][tile[0]] != []:
        #     open_tiles.pop(open_tiles.index(tile))


    # # remove invalid tiles
    # for tile in open_tiles:
    #     print(f'tile[1]::: {tile[1]} - tile[0]::: {tile[0]}')
    #     print(f'maze_list[tile[1]][tile[0]]::: {maze_list[tile[1]][tile[0]]}')
    #     # remove tiles that are out of bounds on x axis
    #     if tile[0] < 0 or tile[0] == width:
    #         open_tiles.pop(open_tiles.index(tile))
    #     # remove tiles that are out of bounds on y axis
    #     elif tile[1] < 0 or tile[1] == height:
    #         open_tiles.pop(open_tiles.index(tile))
    #     # remove tiles that are already generated
    #     elif maze_list[tile[1]][tile[0]] != []:
    #         open_tiles.pop(open_tiles.index(tile))
    # choose next move or back


    if finish_check(maze_list):
        if len(open_tiles) > 0:
            next_move = choice(open_tiles)
            print(f'next_move::: {next_move}')
            if next_move[1] < position[1]:
                maze_list[position[1]][position[0]].append('N')
                # maze_list[position[1] - 1][position[0]].append('S')
                if position[1] - 1 > 0:
                    maze_list[position[1] - 1][position[0]].append('S')
                print('N')
            elif next_move[0] > position[0]:
                maze_list[position[1]][position[0]].append('E')
                # maze_list[position[1]][position[0] + 1].append('W')
                if position[0] + 1 < width:
                    maze_list[position[1]][position[0] + 1].append('W')
                print('E')
            elif next_move[1] > position[1]:
                maze_list[position[1]][position[0]].append('S')
                # maze_list[position[1] + 1][position[0]].append('N')
                if position[1] + 1 < height:
                    maze_list[position[1] + 1][position[0]].append('N')
                print('S')
            elif next_move[0] < position[0]:
                maze_list[position[1]][position[0]].append('W')
                # maze_list[position[1]][position[0] - 1].append('E')
                if position[0] - 1 > 0:
                    maze_list[position[1]][position[0] - 1].append('E')
                print('W')
            print(show_maze(maze_list,width,height))
            print('forward')
            gen_maze_child(maze_list,width,height,next_move)
        else:
            print(show_maze(maze_list,width,height))
            print('back')
            gen_maze_child(maze_list,width,height,position)

    # return maze_list

def finish_check(maze_list):
    for row in maze_list:
        if [] in row:
            return True
    return False

def show_maze(maze_list,width,height):
    # empty strings for maze and first row
    maze_string = ''
    first_row = ''
    # add top border and add to maze_string
    for x in range(width):
        first_row += ' __'
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


# starting grid size
width = 10
height = 10

maze_list = gen_blank(width,height)
print(show_maze(maze_list,width,height))
print('start')
start = gen_maze_parent(maze_list,width,height)
print(start)
print('next tiles')
# print(gen_maze_child(maze_list,width,height,start))

# print(maze_list)

# print(show_maze(gen_maze_child(maze_list,width,height,start),width,height))
gen_maze_child(maze_list,width,height,start)