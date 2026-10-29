// [ a b c ]
// [ d e f ]
// [ g h i ]
//
const arr = [
  [1, 2, 3],
  [4, 15, 6],
  [7, 8, 9]
];

function matrix(arr){
  return arr[0][0] * (arr[1][1] * arr[2][2] - arr[1][2] * arr[2][1])
  - arr[0][1] * (arr[1][0] * arr[2][2] - arr[1][2] * arr[2][0])
  + arr[0][2] * (arr[1][0] * arr[2][1] - arr[1][1] * arr[2][0])
}

const start = performance.now();
for (let i = 0; i < 1000000; i++) {
  matrix(arr);
}
const end = performance.now()

const memory = process.memoryUsage().heapUsed / 1024 / 1024;

console.log("memory:", memory.toFixed(2), "MB")
console.log("time:", end - start.toFixed(5), "ms")
