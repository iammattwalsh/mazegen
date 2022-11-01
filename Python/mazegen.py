from random import randint, seed, sample, choices
from string import ascii_letters as letters, digits
from sys import setrecursionlimit

class Maze():
    def __init__(self, width, height = 0, maze_seed = ''):
        """
        Generates a maze from input dimensions and (optionally) a seed string.
        - width (required) determines the width of the maze grid. Maximum 75.
        - height (optional) determines the height of the maze grid. Defaults to equal width. Maximum 75.
        - maze_seed (optional) allows the user to select a seed for repeatable maze generation.
        """
        self.directions = (1,2,4,8)
        self.move_x = ('',0,1,'',0,'','','',-1)
        self.move_y = ('',-1,0,'',1,'','','',0)
        self.opposite = ('',4,8,'',1,'','','',2)
        seed()
        if maze_seed == '':
            maze_seed = ''.join(choices(letters + digits, k=16))
        seed(maze_seed)
        if width > 75:
            width = 75
        if height > 75:
            height = 75
        elif height == 0:
            height = width
        if height * width * 1.6 > 1000:
            setrecursionlimit(int(height * width * 1.6))
        self.dims = (width, height)
        self.maze_list = []
        self.gen_blank()
        self.position_start = [randint(0, self.dims[0] - 1), randint(0, self.dims[1] - 1)]
        self.recursive_carve(self.position_start)
        setrecursionlimit(1000)
    
    def gen_blank(self):
        """
        Generates a list of lists representing a blank grid using input dimensions.
        """
        for y in range(self.dims[1]):
            this_row = []
            for x in range(self.dims[0]):
                this_row.append(0)
            self.maze_list.append(this_row)
    
    def recursive_carve(self,position_cur):
        """
        Recursively generates a maze from a blank grid by carving out walls when possible.
        """
        cell_directions = sample(self.directions,len(self.directions))
        for direction in cell_directions:
            position_next = [position_cur[0] + self.move_x[direction], position_cur[1] + self.move_y[direction]]
            if 0 <= position_next[0] < self.dims[0] and 0 <= position_next[1] < self.dims[1] and self.maze_list[position_next[1]][position_next[0]] == 0:
                self.maze_list[position_cur[1]][position_cur[0]] += direction
                self.maze_list[position_next[1]][position_next[0]] += self.opposite[direction]
                self.recursive_carve(position_next)
    
    def __str__(self):
        """
        Displays maze in terminal using underscores and pipes.
        Each tile is 2 chars wide and 1 char tall.
        ONLY INTENDED FOR TESTING PURPOSES.
        """
        def check_dir(tile):
            dirs = []
            if tile - 8 >= 0:
                dirs.append('W')
                tile -= 8
            if tile - 4 >= 0:
                dirs.append('S')
                tile -= 4
            if tile - 2 >= 0:
                dirs.append('E')
                tile -= 2
            if tile -1 >= 0:
                dirs.append('N')
            return dirs
        
        maze_string = ''
        first_row = ' __'
        for x in range(self.dims[0] - 1):
            first_row += '___'
        maze_string += first_row + '\n'
        for y in range(self.dims[1]):
            this_row = '|'
            for x in range(self.dims[0]):
                tile = self.maze_list[y][x]
                if 'S' in check_dir(tile):
                    this_row += '  '
                else:
                    this_row += '__'
                if 'S' in check_dir(tile) and 'E' in check_dir(tile):
                    this_row += ' '
                elif 'E' in check_dir(tile):
                    this_row += '_'
                else:
                    this_row += '|'
            maze_string += this_row + '\n'
        return maze_string

if __name__ == '__main__':
    # width = int(input('Enter maze width: '))
    # height = int(input('Enter maze height: '))
    # maze_seed = input('Enter seed: ')

    # hardcoded variables for testing
    width = 25
    height = 25
    maze_seed = 'a'

    # Maze generated using all available arguments
    maze_1 = Maze(width,height,maze_seed)
    print(maze_1.maze_list)
    print(maze_1)

    # Maze generated using just width and height, seed will be randomly generated
    maze_2 = Maze(width,height)
    print(maze_2.maze_list)
    print(maze_2)

    # Maze generated using only width, height will match width, seed will be randomly generated
    maze_3 = Maze(width)
    print(maze_3.maze_list)
    print(maze_3)