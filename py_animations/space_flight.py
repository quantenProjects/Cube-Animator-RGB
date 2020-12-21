#!/bin/env python3

import argparse
import random

import py_animations


def space_flight(size:tuple[int, int, int], frame_count:int, directions:list[str] = None) -> py_animations.Animation:
    print(directions)
    if directions is None:
        directions = ["c"]
    a = py_animations.Animation(size)
    current_direction = directions[0]
    rrr = random.randrange
    for frame_id in range(frame_count):
        a.append(a[-1].copy())
        if current_direction == "c":
            a[-1].scroll_in_cube(wrap_color=py_animations.Voxel(0,0,0))
            a[-1][0][rrr(size[1])][rrr(size[2])][rrr(py_animations.Voxel.COLOR_COUNT)] = 1
        elif current_direction == "C":
            a[-1].scroll_in_cube(reverse=True, wrap_color=py_animations.Voxel(0,0,0))
            a[-1][-1][rrr(size[1])][rrr(size[2])][rrr(py_animations.Voxel.COLOR_COUNT)] = 1
        elif current_direction == "l":
            a[-1].scroll_in_layer(wrap_color=py_animations.Voxel(0,0,0))
            a[-1][rrr(size[1])][0][rrr(size[2])][rrr(py_animations.Voxel.COLOR_COUNT)] = 1
        elif current_direction == "L":
            a[-1].scroll_in_layer(reverse=True, wrap_color=py_animations.Voxel(0, 0, 0))
            a[-1][rrr(size[1])][-1][rrr(size[2])][rrr(py_animations.Voxel.COLOR_COUNT)] = 1
        elif current_direction == "r":
            a[-1].scroll_in_row(wrap_color=py_animations.Voxel(0,0,0))
            a[-1][rrr(size[1])][rrr(size[2])][0][rrr(py_animations.Voxel.COLOR_COUNT)] = 1
        elif current_direction == "R":
            a[-1].scroll_in_row(reverse=True, wrap_color=py_animations.Voxel(0,0,0))
            a[-1][rrr(size[1])][rrr(size[2])][-1][rrr(py_animations.Voxel.COLOR_COUNT)] = 1
        if random.random() > 0.9:
            current_direction = random.choice(directions)
    return a


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("frame_count",type=int)
    parser.add_argument("size",help="Dimensions, e.g. 8x8x8")
    parser.add_argument("filename")
    parser.add_argument("-s","--seed", type=int)
    args = parser.parse_args()
    if args.seed is not None:
        random.seed(args.seed)
    size = tuple(map(int, args.size.split("x")))
    animation = space_flight(size, args.frame_count, directions=list("cClLrR"))
    with open(args.filename, "wb") as target_file:
        target_file.write(animation.convert_to_binary())
