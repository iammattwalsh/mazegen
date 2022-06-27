"""

Notes - 

direction list: 
0 - up/north
1 - right/east
2 - down/south
3 - left/west

tile list:
0 - blank (not generated)
1 - up
2 - right
3 - down
4 - left
5 - up + down
6 - right + left
7 - up + right
8 - right + down
9 - down + left
10 - left + up
11 - up + right + down
12 - right + down + left
13 - down + left + up
14 - left + up + right

includes down:
3
5
8
9
11
12
13

includes right:
2
6
7
8
11
12
14

(if 4-way):
15 - up + right + down + left

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
            # empty cell for each column (represented by '0')
            this_row.append(0)
        # add to maze list
        maze_list.append(this_row)
    return maze_list

def gen_maze(maze_list):
    start = (randint(0, len(maze_list) - 1), randint(0, len(maze_list[0]) - 1))

    ...

def show_maze(maze_list):
    # list of ints that represent missing walls down or left respectively
    down_list = [3,5,8,9,11,12,13]
    right_list = [2,6,7,8,11,12,14]
    # empty strings for maze and first row
    maze_string = ''
    first_row = ''
    # add top border and add to maze_string
    for x in range(len(maze_list[0])):
        first_row += ' __'
    maze_string += first_row + '\n'
    # iterate through rows
    for y in range(len(maze_list)):
        # add left wall to each row
        this_row = '|'
        # iterate through columns
        for x in range(len(maze_list[y])):
            # assign current cell to variable for simpler reading
            cell = maze_list[y][x]
            # add spaces if the cell has no bottom wall
            if cell in down_list:
                this_row += '  '
            # add bottom wall otherwise
            else:
                this_row += '__'
            # add space if cell is missing both bottom and right walls
            if cell in down_list and cell in right_list:
                this_row += ' '
            # add small bottom wall if cell is only missing right wall
            elif cell in right_list:
                this_row += '_'
            # add pip if cell has right wall
            else:
                this_row += '|'
        # add row and new line to maze_string
        maze_string += this_row + '\n'
    return maze_string


# starting grid size
width = 10
height = 10

# test vars
# width = 4
# height = 4
# maze_list = [[8,3,0,0],[0,2,0,0],[0,2,0,0],[0,2,0,0],]

maze_list = gen_blank(width,height)
print(show_maze(maze_list))



# print("""
#  __ __ __ __ __ __ __ __ __ __
# |__|__|__|__|__|__|__|__|__|__|
# |__|__|__|__|__|__|__|__|__|__|
# |__|__|__|__|__|__|__|__|__|__|
# |__|__|__|__|__|__|__|__|__|__|
# |__|__|__|__|__|__|__|__|__|__|
# |__|__|__|__|__|__|__|__|__|__|
# |__|__|__|__|__|__|__|__|__|__|
# |__|__|__|__|__|__|__|__|__|__|
# |__|__|__|__|__|__|__|__|__|__|
# |__|__|__|__|__|__|__|__|__|__|
# """)