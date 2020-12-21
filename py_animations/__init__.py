#!/bin/env python3


class Voxel(list):
    C2I = {"r": 0, "g": 1, "b": 2}
    I2C = ["r", "g", "b"]
    COLOR_COUNT = 3

    def __init__(self, red: float = 0, green: float = 0, blue: float = 0, voxel=None):
        super().__init__()
        self.append(red)
        self.append(green)
        self.append(blue)
        if voxel is not None:
            self.set_like(voxel)

    def swap_colors(self, a: str, b: str):
        tmp = self[self.C2I[a]]
        self[self.C2I[a]] = self[self.C2I[b]]
        self[self.C2I[b]] = tmp

    def set_like(self, voxel):
        self.set(voxel[0], voxel[1], voxel[2])

    def set(self, red: float, green: float, blue: float):
        self[0] = red
        self[1] = green
        self[2] = blue

    def set_all_colors(self, value: float):
        self.set(value, value, value)

    @property
    def white(self) -> bool:
        return self == [1, 1, 1]

    @white.setter
    def white(self, set_to_white: bool):
        if set_to_white:
            self.set_all_colors(1)

    @property
    def black(self) -> bool:
        return self == [0, 0, 0]

    @black.setter
    def black(self, set_to_black: bool):
        if set_to_black:
            self.set_all_colors(0)

    def copy(self):
        return Voxel(voxel=self)


class Row(list):

    def __init__(self, voxel_count: int = None, voxel: Voxel = None, row=None):
        super().__init__()
        if voxel_count is not None:
            if voxel is None:
                voxel = Voxel()
            for i in range(voxel_count):
                self.append(voxel.copy())
        elif row is not None:
            for voxel in row:
                self.append(voxel.copy())
        else:
            raise ValueError("Either voxel_count or row must be passed!")

    def set_all(self, red: float, green: float, blue: float):
        for voxel in self:
            voxel.set(red, green, blue)

    def set_all_like(self, like_voxel: Voxel):
        for voxel in self:
            voxel.set_like(like_voxel)

    def scroll_in_row(self, reverse: bool = False, wrap_color: Voxel = None):
        if reverse:
            tmp = self[0]
            for i in range(len(self) - 1):
                self[i] = self[i + 1]
            if wrap_color is None:
                self[-1] = tmp
            else:
                self[-1] = self[-1].copy()
                self[-1].set_like(wrap_color)
        else:
            tmp = self[-1]
            for i in range(len(self) - 1, 0, -1):
                self[i] = self[i - 1]
            if wrap_color is None:
                self[0] = tmp
            else:
                self[0] = self[0].copy()
                self[0].set_like(wrap_color)

    def copy(self):
        return Row(row=self)


class Layer(list):

    def __init__(self, row_count: int = None, row: Row = None, layer=None):
        super().__init__()
        if row_count is not None and row is not None:
            for i in range(row_count):
                self.append(row.copy())
        elif layer is not None:
            for row in layer:
                self.append(row.copy())
        else:
            raise ValueError("Either row_count or layer must be passed!")

    def set_all(self, red: float, green: float, blue: float):
        for row in self:
            row.set_all(red, green, blue)

    def set_all_like(self, like_voxel: Voxel):
        for row in self:
            row.set_all_like(like_voxel)

    def scroll_in_row(self, reverse: bool = False, wrap_color: Voxel = None):
        for row in self:
            row.scroll_in_row(reverse, wrap_color)

    def scroll_in_layer(self, reverse: bool = False, wrap_color: Voxel = None):
        if reverse:
            tmp = self[0]
            for i in range(len(self) - 1):
                self[i] = self[i + 1]
            if wrap_color is None:
                self[-1] = tmp
            else:
                self[-1] = self[-1].copy()
                self[-1].set_all_like(wrap_color)
        else:
            tmp = self[-1]
            for i in range(len(self) - 1, 0, -1):
                self[i] = self[i - 1]
            if wrap_color is None:
                self[0] = tmp
            else:
                self[0] = self[0].copy()
                self[0].set_all_like(wrap_color)

    def copy(self):
        return Layer(layer=self)


class Cube(list):

    def __init__(self, size: tuple[int, int, int] = None, cube=None):
        super().__init__()
        if size is not None:
            if len(size) != 3:
                raise ValueError("Sorry, only for universes with 3 space dimensions!")
            row = Row(size[0])
            layer = Layer(size[1], row)
            for i in range(size[2]):
                self.append(layer.copy())
        elif cube is not None:
            for layer in cube:
                self.append(layer.copy())

    def set_all(self, red: float, green: float, blue: float):
        for layer in self:
            layer.set_all(red, green, blue)

    def set_all_like(self, like_voxel: Voxel):
        for layer in self:
            layer.set_all_like(like_voxel)

    def scroll_in_cube(self, reverse: bool = False, wrap_color: Voxel = None):
        if reverse:
            tmp = self[0]
            for i in range(len(self) - 1):
                self[i] = self[i + 1]
            if wrap_color is None:
                self[-1] = tmp
            else:
                self[-1] = self[-1].copy()
                self[-1].set_all_like(wrap_color)
        else:
            tmp = self[-1]
            for i in range(len(self) - 1, 0, -1):
                self[i] = self[i - 1]
            if wrap_color is None:
                self[0] = tmp
            else:
                self[0] = self[0].copy()
                self[0].set_all_like(wrap_color)

    def scroll_in_layer(self, reverse: bool = False, wrap_color: Voxel = None):
        for layer in self:
            layer.scroll_in_layer(reverse, wrap_color)

    def scroll_in_row(self, reverse: bool = False, wrap_color: Voxel = None):
        for layer in self:
            layer.scroll_in_row(reverse, wrap_color)

    def copy(self):
        return Cube(cube=self)


class Animation(list):

    def __init__(self, size: tuple[int, int, int]):
        super().__init__()
        self.append(Cube(size))
        self.size = size

    def convert_to_binary(self, color_order: str = None, threshold: float = 0.5) -> bytearray:
        if color_order is None:
            color_order = "bgr"
        color_order_index = [Voxel.C2I[color] for color in color_order]
        data = bytearray()
        bit_index = 7
        current_byte = 0
        for cube in self:
            for layer in cube:
                for color in color_order_index:
                    for row in layer:
                        for voxel in row:
                            current_byte |= (voxel[color] > threshold) << bit_index
                            if bit_index == 0:
                                data.append(current_byte)
                                current_byte = 0
                                bit_index = 8
                            bit_index -= 1
        if bit_index != 7:
            data.append(current_byte)
        return data
