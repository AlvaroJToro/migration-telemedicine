const questions = [
  { oldIds: [1], code: 1 },
  { oldIds: [2, 24, 93, 182, 247, 248, 439, 440, 321, 330], code: 24 },
  {
    oldIds: [
      38, 100, 119, 134, 140, 155, 178, 184, 191, 198, 205, 216, 225, 234, 237,
      244, 251, 343, 288, 443, 377, 360, 418, 431, 392, 407, 383,
    ],
    code: 38,
  },
  {
    oldIds: [3, 52, 70, 25, 26, 53, 65, 221],
    code: 5,
  },
  {
    oldIds: [
      17, 40, 48, 59, 78, 99, 120, 135, 141, 170, 179, 185, 192, 199, 206, 217,
      226, 235, 238, 245, 253, 113, 128, 138, 344, 266, 289, 445, 361, 379, 419,
      432, 318, 393, 408,
    ],
    code: 59,
  },
  {
    oldIds: [
      6, 22, 64, 66, 91, 190, 197, 224, 233, 10, 27, 39, 51, 74, 87, 183, 204,
      212, 236, 101, 142, 160, 194, 242, 18, 252, 342, 373, 54, 301, 417, 429,
      444, 359, 265, 391, 406,
    ],
    code: 190,
  },
  {
    oldIds: [
      36, 49, 60, 76, 98, 171, 186, 195, 200, 207, 218, 227, 239, 187, 196, 201,
      219, 350, 349, 381, 362, 380, 420, 310, 394,
    ],
    code: 98,
  },
  {
    oldIds: [
      14, 115, 130, 188, 202, 208, 220, 228, 240, 284, 382, 363, 421, 395,
    ],
    code: 202,
  },
  {
    oldIds: [97, 256, 189, 203, 232, 448, 231, 399, 398],
    code: 232,
  },
  {
    oldIds: [88, 152, 180, 159],
    code: 88,
  },
  {
    oldIds: [83, 249, 169],
    code: 12,
  },
  {
    oldIds: [7, 108, 123, 325, 329],
    code: 108,
  },
  {
    oldIds: [15, 90, 181, 320],
    code: 15,
  },
  {
    oldIds: [4],
    code: 4,
  },
  {
    oldIds: [5],
    code: 5,
  },
  {
    oldIds: [8, 84, 441, 297, 319],
    code: 84,
  },
  {
    oldIds: [9],
    code: 9,
  },
  {
    oldIds: [10],
    code: 10,
  },
  {
    oldIds: [11],
    code: 11,
  },
  {
    oldIds: [12],
    code: 12,
  },
  {
    oldIds: [13],
    code: 13,
  },
  {
    oldIds: [16],
    code: 16,
  },
  {
    oldIds: [19],
    code: 19,
  },
  {
    oldIds: [20],
    code: 20,
  },
  {
    oldIds: [21],
    code: 21,
  },
  {
    oldIds: [23, 50],
    code: 23,
  },
  {
    oldIds: [28],
    code: 28,
  },
  {
    oldIds: [29],
    code: 29,
  },
  {
    oldIds: [30],
    code: 30,
  },
  {
    oldIds: [31],
    code: 31,
  },
  {
    oldIds: [32],
    code: 32,
  },
  {
    oldIds: [33, 257],
    code: 33,
  },
  {
    oldIds: [34, 258],
    code: 34,
  },
  {
    oldIds: [35],
    code: 35,
  },
  {
    oldIds: [37, 275],
    code: 37,
  },
  {
    oldIds: [41],
    code: 41,
  },
  {
    oldIds: [42, 269],
    code: 42,
  },
  {
    oldIds: [43, 270],
    code: 43,
  },
  {
    oldIds: [44, 271],
    code: 44,
  },
  {
    oldIds: [45, 272],
    code: 45,
  },
  {
    oldIds: [46, 267, 273],
    code: 46,
  },
  {
    oldIds: [47, 268, 274],
    code: 47,
  },
  {
    oldIds: [55, 69],
    code: 55,
  },
  {
    oldIds: [57, 72, 263],
    code: 57,
  },
  {
    oldIds: [58, 73, 264],
    code: 73,
  },
  {
    oldIds: [63],
    code: 63,
  },
  {
    oldIds: [67, 259],
    code: 67,
  },
  {
    oldIds: [68],
    code: 68,
  },
  {
    oldIds: [75],
    code: 75,
  },
  {
    oldIds: [77],
    code: 77,
  },
  {
    oldIds: [79, 177, 316],
    code: 79,
  },
  {
    oldIds: [80],
    code: 80,
  },
  {
    oldIds: [81],
    code: 81,
  },
  {
    oldIds: [82],
    code: 82,
  },
  {
    oldIds: [85],
    code: 85,
  },
  {
    oldIds: [86],
    code: 86,
  },
  {
    oldIds: [89],
    code: 89,
  },
  {
    oldIds: [92],
    code: 92,
  },
  {
    oldIds: [94],
    code: 94,
  },
  {
    oldIds: [95],
    code: 95,
  },
  {
    oldIds: [96],
    code: 96,
  },
  {
    oldIds: [102],
    code: 102,
  },
  {
    oldIds: [103],
    code: 103,
  },
  {
    oldIds: [104],
    code: 104,
  },
  {
    oldIds: [105],
    code: 105,
  },
  {
    oldIds: [106],
    code: 106,
  },
  {
    oldIds: [107, 122],
    code: 107,
  },
  {
    oldIds: [109, 124],
    code: 109,
  },
  {
    oldIds: [110, 125],
    code: 110,
  },
  {
    oldIds: [112, 127],
    code: 112,
  },
  {
    oldIds: [114, 129, 283],
    code: 114,
  },
  {
    oldIds: [117, 132, 286],
    code: 117,
  },
  {
    oldIds: [137],
    code: 137,
  },
  {
    oldIds: [139],
    code: 139,
  },
  { oldIds: [146, 161, 302, 291], code: 146 },
  {
    oldIds: [147, 162, 303, 292],
    code: 147,
  },
  {
    oldIds: [148, 163, 293],
    code: 148,
  },
  {
    oldIds: [149, 164, 305, 294],
    code: 149,
  },
  {
    oldIds: [150, 165, 306, 295],
    code: 150,
  },
  {
    oldIds: [151, 166, 307, 296],
    code: 151,
  },
  {
    oldIds: [153, 167, 308, 298],
    code: 167,
  },
  {
    oldIds: [154, 168, 260, 309, 299],
    code: 154,
  },
  {
    oldIds: [26, 300, 317],
    code: 26,
  },
  {
    oldIds: [172, 311],
    code: 172,
  },
  {
    oldIds: [173, 312],
    code: 173,
  },
  {
    oldIds: [174, 313],
    code: 174,
  },
  {
    oldIds: [175, 314],
    code: 175,
  },
  {
    oldIds: [176],
    code: 176,
  },
  {
    oldIds: [193, 345],
    code: 193,
  },
  {
    oldIds: [209, 364],
    code: 209,
  },
  {
    oldIds: [213, 374],
    code: 213,
  },
  {
    oldIds: [214, 375],
    code: 214,
  },
  {
    oldIds: [222, 384],
    code: 222,
  },
  {
    oldIds: [223, 372],
    code: 223,
  },
  {
    oldIds: [230, 397],
    code: 230,
  },
  {
    oldIds: [246, 438],
    code: 246,
  },
  {
    oldIds: [250, 442],
    code: 250,
  },
  {
    oldIds: [254, 446],
    code: 254,
  },
  {
    oldIds: [255, 261, 447],
    code: 255,
  },
  {
    oldIds: [210, 229, 365, 396],
    code: 229,
  },
  {
    oldIds: [211, 241, 366, 422],
    code: 241,
  },
  {
    oldIds: [215, 243, 376, 430],
    code: 215,
  },
];

module.exports = questions;
