/** 
 * transformation-models - v2.0.0
 * description: 2D Affine, Helmert, Polynomial and TPS transformations for use in geodesy
 * author: bojko108 <bojko108@gmail.com>
 * 
 * github: https://github.com/bojko108/transformation-models
 */
    
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class Transformation {
  constructor() {
    this._sourcePoints = [];
    this._targetPoints = [];
    this._forwardParameters = {};
    this._inverseParameters = {};
  }
  _initialize(sourcePoints, targetPoints) {
    if (sourcePoints && targetPoints) {
      this.calculate(sourcePoints, targetPoints);
    }
  }
  get sourcePoints() {
    return this._sourcePoints;
  }
  get targetPoints() {
    return this._targetPoints;
  }
  get forwardParameters() {
    return this._forwardParameters;
  }
  set forwardParameters(parameters = {}) {
    this._forwardParameters = parameters;
  }
  get inverseParameters() {
    return this._inverseParameters;
  }
  set inverseParameters(parameters = {}) {
    this._inverseParameters = parameters;
  }
  calculate(sourcePoints, targetPoints) {
    this._validateControlPoints(sourcePoints, targetPoints);
    this._sourcePoints = sourcePoints;
    this._targetPoints = targetPoints;
    this._forwardParameters = this._calculateParameters(sourcePoints, targetPoints);
    this._inverseParameters = this._calculateParameters(targetPoints, sourcePoints);
  }
  forward(point) {
    return this._apply(point, this._forwardParameters);
  }
  inverse(point) {
    return this._apply(point, this._inverseParameters);
  }
  _validateControlPoints(sourcePoints, targetPoints) {
    if (!Array.isArray(sourcePoints) || !Array.isArray(targetPoints)) {
      throw new Error('Source and target points must be arrays!');
    }
    if (sourcePoints.length !== targetPoints.length) {
      throw new Error('Number of points do not match!');
    }
    sourcePoints.forEach(point => this._validatePoint(point));
    targetPoints.forEach(point => this._validatePoint(point));
  }
  _validatePoint(point) {
    if (!Array.isArray(point) || point.length !== 2) {
      throw new Error('Point must be a 2D coordinate pair!');
    }
    if (!Number.isFinite(point[0]) || !Number.isFinite(point[1])) {
      throw new Error('Point coordinates must be finite numbers!');
    }
  }
  _requireMinimumPointCount(points, minimum) {
    if (points.length < minimum) {
      throw new Error(`Number of points must be at least ${minimum}!`);
    }
  }
  _apply(point, parameters) {
    this._validatePoint(point);
    if (this._isEmptyParameters(parameters)) {
      return point;
    }
    return this._transform(point, parameters);
  }
  _isEmptyParameters(parameters) {
    return Object.keys(parameters).length === 0 && parameters.constructor === Object;
  }
}

function fromZeros(rows = 0, cols = 0) {
  let matrix = [];
  for (let row = 0; row < rows; row++) {
    matrix[row] = [];
    for (let col = 0; col < cols; col++) {
      matrix[row][col] = 0;
    }
  }
  return matrix;
}
function invertMatrix(matrix) {
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
function transposeMatrix(matrix) {
  const result = fromZeros(matrix[0].length, matrix.length);
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[0].length; col++) {
      result[col][row] = matrix[row][col];
    }
  }
  return result;
}
function multiplyMatrices(left, right) {
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
function multiplyMatrixVector(matrix, vector) {
  let result = new Array(matrix.length).fill(0);
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < vector.length; col++) {
      result[row] += matrix[row][col] * vector[col];
    }
  }
  return result;
}
function solveLeastSquares(designMatrix, observations) {
  const transposed = transposeMatrix(designMatrix);
  const normalMatrix = multiplyMatrices(transposed, designMatrix);
  const rightSide = multiplyMatrixVector(transposed, observations);
  const inverse = invertMatrix(normalMatrix);
  return multiplyMatrixVector(inverse, rightSide);
}

class Affine extends Transformation {
  constructor(sourcePoints, targetPoints) {
    super();
    this._initialize(sourcePoints, targetPoints);
  }
  toWorldFile(saveInverseParameters = false) {
    const parameters = saveInverseParameters ? this._inverseParameters : this._forwardParameters;
    return `${parameters.A}\n${parameters.D}\n${parameters.B}\n${parameters.E}\n${parameters.C}\n${parameters.F}\n`;
  }
  _transform(point, parameters) {
    const x = parameters.A * point[0] + parameters.B * point[1] + parameters.C;
    const y = parameters.D * point[0] + parameters.E * point[1] + parameters.F;
    return [x, y];
  }
  _calculateParameters(sourcePoints, targetPoints) {
    this._requireMinimumPointCount(sourcePoints, 3);
    const designMatrix = sourcePoints.map(point => [point[0], point[1], 1]);
    const xCoefficients = solveLeastSquares(designMatrix, targetPoints.map(point => point[0]));
    const yCoefficients = solveLeastSquares(designMatrix, targetPoints.map(point => point[1]));
    return {
      A: xCoefficients[0],
      B: xCoefficients[1],
      C: xCoefficients[2],
      D: yCoefficients[0],
      E: yCoefficients[1],
      F: yCoefficients[2]
    };
  }
}

class Helmert extends Transformation {
  constructor(sourcePoints, targetPoints) {
    super();
    this._initialize(sourcePoints, targetPoints);
  }
  _transform(point, parameters) {
    const x = parameters.tx + parameters.scaleCos * point[0] - parameters.scaleSin * point[1];
    const y = parameters.ty + parameters.scaleSin * point[0] + parameters.scaleCos * point[1];
    return [x, y];
  }
  _calculateParameters(sourcePoints, targetPoints) {
    this._requireMinimumPointCount(sourcePoints, 2);
    let designMatrix = [];
    let observations = [];
    for (let i = 0; i < sourcePoints.length; i++) {
      const x = sourcePoints[i][0];
      const y = sourcePoints[i][1];
      const targetX = targetPoints[i][0];
      const targetY = targetPoints[i][1];
      designMatrix.push([1, 0, x, -y]);
      observations.push(targetX);
      designMatrix.push([0, 1, y, x]);
      observations.push(targetY);
    }
    const coefficients = solveLeastSquares(designMatrix, observations);
    const scaleCos = coefficients[2];
    const scaleSin = coefficients[3];
    return {
      tx: coefficients[0],
      ty: coefficients[1],
      scaleCos,
      scaleSin,
      scale: Math.sqrt(scaleCos * scaleCos + scaleSin * scaleSin),
      rotation: Math.atan2(scaleSin, scaleCos)
    };
  }
}

class Polynomial extends Transformation {
  constructor(sourcePoints, targetPoints, order = 2) {
    super();
    this.order = order;
    this._initialize(sourcePoints, targetPoints);
  }
  get order() {
    return this._order;
  }
  set order(value) {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error('Polynomial order must be an integer greater than 0!');
    }
    this._order = value;
  }
  _transform(point, parameters) {
    const normalizedPoint = this._normalizePoint(point, parameters.normalization);
    const basis = this._buildBasis(normalizedPoint, parameters.order);
    return [
      this._dotProduct(basis, parameters.xCoefficients),
      this._dotProduct(basis, parameters.yCoefficients)
    ];
  }
  _calculateParameters(sourcePoints, targetPoints) {
    const coefficientCount = ((this.order + 1) * (this.order + 2)) / 2;
    this._requireMinimumPointCount(sourcePoints, coefficientCount);
    const normalization = this._createNormalization(sourcePoints);
    const designMatrix = sourcePoints.map(point => {
      const normalizedPoint = this._normalizePoint(point, normalization);
      return this._buildBasis(normalizedPoint, this.order);
    });
    const xCoefficients = solveLeastSquares(designMatrix, targetPoints.map(point => point[0]));
    const yCoefficients = solveLeastSquares(designMatrix, targetPoints.map(point => point[1]));
    return {
      order: this.order,
      normalization,
      xCoefficients,
      yCoefficients
    };
  }
  _createNormalization(points) {
    const centroid = points.reduce(
      (result, point) => [result[0] + point[0], result[1] + point[1]],
      [0, 0]
    ).map(value => value / points.length);
    let maxDistance = 0;
    for (let i = 0; i < points.length; i++) {
      const dx = points[i][0] - centroid[0];
      const dy = points[i][1] - centroid[1];
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > maxDistance) {
        maxDistance = distance;
      }
    }
    return {
      xOffset: centroid[0],
      yOffset: centroid[1],
      scale: maxDistance === 0 ? 1 : maxDistance
    };
  }
  _normalizePoint(point, normalization) {
    return [
      (point[0] - normalization.xOffset) / normalization.scale,
      (point[1] - normalization.yOffset) / normalization.scale
    ];
  }
  _buildBasis(point, order) {
    let basis = [];
    const x = point[0];
    const y = point[1];
    for (let degree = 0; degree <= order; degree++) {
      for (let xDegree = degree; xDegree >= 0; xDegree--) {
        const yDegree = degree - xDegree;
        basis.push(Math.pow(x, xDegree) * Math.pow(y, yDegree));
      }
    }
    return basis;
  }
  _dotProduct(left, right) {
    let sum = 0;
    for (let i = 0; i < left.length; i++) {
      sum += left[i] * right[i];
    }
    return sum;
  }
}

class TPS extends Transformation {
  constructor(sourcePoints, targetPoints) {
    super();
    this._initialize(sourcePoints, targetPoints);
  }
  _transform(point, parameters) {
    let Xo = parameters.Xc[0] + parameters.Xc[1] * point[0] + parameters.Xc[2] * point[1],
      Yo = parameters.Yc[0] + parameters.Yc[1] * point[0] + parameters.Yc[2] * point[1];
    for (let r = 0; r < parameters.m; r++) {
      const tmp = this._kernelFunction(point[0], point[1], parameters.sourcePoints[r][0], parameters.sourcePoints[r][1]);
      Xo += parameters.Xc[r + 3] * tmp;
      Yo += parameters.Yc[r + 3] * tmp;
    }
    return [Xo, Yo];
  }
  _calculateParameters(sourcePoints, targetPoints) {
    const m = sourcePoints.length;
    let A = fromZeros(m + 3, m + 3);
    for (let i = 0; i < m; i++) {
      A[0][3 + i] = 1;
      A[1][3 + i] = sourcePoints[i][0];
      A[2][3 + i] = sourcePoints[i][1];
      A[3 + i][0] = 1;
      A[3 + i][1] = sourcePoints[i][0];
      A[3 + i][2] = sourcePoints[i][1];
    }
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < m; c++) {
        A[r + 3][c + 3] = this._kernelFunction(sourcePoints[r][0], sourcePoints[r][1], sourcePoints[c][0], sourcePoints[c][1]);
        A[c + 3][r + 3] = A[r + 3][c + 3];
      }
    }
    const invA = invertMatrix(A);
    let Xc = new Float64Array(m + 3),
      Yc = new Float64Array(m + 3);
    for (let r = 0; r < m + 3; r++) {
      for (let c = 0; c < m; c++) {
        Xc[r] += invA[r][c + 3] * targetPoints[c][0];
        Yc[r] += invA[r][c + 3] * targetPoints[c][1];
      }
    }
    return { m, Xc, Yc, sourcePoints };
  }
  _kernelFunction(x1, y1, x2, y2) {
    if (x1 == x2 && y1 == y2) return 0;
    const dist = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    return dist * Math.log(dist);
  }
}

exports.Affine = Affine;
exports.Helmert = Helmert;
exports.Polynomial = Polynomial;
exports.TPS = TPS;
