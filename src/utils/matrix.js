/**
 * Creates a new empty matrix with elements equal to 0.
 * @param {Number} [rows=0]
 * @param {Number} [cols=0]
 * @return {Array.<Number>}
 */
export function fromZeros(rows = 0, cols = 0) {
  let matrix = [];

  for (let row = 0; row < rows; row++) {
    matrix[row] = [];
    for (let col = 0; col < cols; col++) {
      matrix[row][col] = 0;
    }
  }

  return matrix;
}

/**
 * Returns the inverse matrix of `matrix`.
 * @param {!Array.<Number>} matrix
 * @see http://blog.acipo.com/matrix-inversion-in-javascript/
 * @return {Array.<Number>}
 */
export function invertMatrix(matrix) {
  if (matrix.length !== matrix[0].length) {
    throw new Error('Matrix must be square!');
  }

  let row = 0;
  let swapRow = 0;
  let col = 0;
  let element = 0;
  const size = matrix.length;
  let identity = [];
  let copy = [];

  for (row = 0; row < size; row++) {
    identity[identity.length] = [];
    copy[copy.length] = [];

    for (col = 0; col < size; col++) {
      identity[row][col] = row === col ? 1 : 0;
      copy[row][col] = matrix[row][col];
    }
  }

  for (row = 0; row < size; row++) {
    element = copy[row][row];

    if (element === 0) {
      for (swapRow = row + 1; swapRow < size; swapRow++) {
        if (copy[swapRow][row] !== 0) {
          for (col = 0; col < size; col++) {
            let temp = copy[row][col];
            copy[row][col] = copy[swapRow][col];
            copy[swapRow][col] = temp;

            temp = identity[row][col];
            identity[row][col] = identity[swapRow][col];
            identity[swapRow][col] = temp;
          }

          break;
        }
      }

      element = copy[row][row];

      if (element === 0) {
        throw new Error('Matrix is singular and cannot be inverted!');
      }
    }

    for (col = 0; col < size; col++) {
      copy[row][col] /= element;
      identity[row][col] /= element;
    }

    for (swapRow = 0; swapRow < size; swapRow++) {
      if (swapRow === row) {
        continue;
      }

      element = copy[swapRow][row];

      for (col = 0; col < size; col++) {
        copy[swapRow][col] -= element * copy[row][col];
        identity[swapRow][col] -= element * identity[row][col];
      }
    }
  }

  return identity;
}

/**
 * Transposes a matrix.
 * @param {!Array.<Number>} matrix
 * @return {Array.<Number>}
 */
export function transposeMatrix(matrix) {
  const result = fromZeros(matrix[0].length, matrix.length);

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[0].length; col++) {
      result[col][row] = matrix[row][col];
    }
  }

  return result;
}

/**
 * Multiplies two matrices.
 * @param {!Array.<Number>} left
 * @param {!Array.<Number>} right
 * @return {Array.<Number>}
 */
export function multiplyMatrices(left, right) {
  const result = fromZeros(left.length, right[0].length);

  for (let row = 0; row < left.length; row++) {
    for (let col = 0; col < right[0].length; col++) {
      for (let index = 0; index < right.length; index++) {
        result[row][col] += left[row][index] * right[index][col];
      }
    }
  }

  return result;
}

/**
 * Multiplies a matrix and vector.
 * @param {!Array.<Number>} matrix
 * @param {!Array.<Number>} vector
 * @return {Array.<Number>}
 */
export function multiplyMatrixVector(matrix, vector) {
  let result = new Array(matrix.length).fill(0);

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < vector.length; col++) {
      result[row] += matrix[row][col] * vector[col];
    }
  }

  return result;
}

/**
 * Solves a least-squares system using the normal equations.
 * @param {!Array.<Number>} designMatrix
 * @param {!Array.<Number>} observations
 * @return {Array.<Number>}
 */
export function solveLeastSquares(designMatrix, observations) {
  const transposed = transposeMatrix(designMatrix);
  const normalMatrix = multiplyMatrices(transposed, designMatrix);
  const rightSide = multiplyMatrixVector(transposed, observations);
  const inverse = invertMatrix(normalMatrix);

  return multiplyMatrixVector(inverse, rightSide);
}
