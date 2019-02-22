/** 
 * transformation-models - v1.0.2
 * description: 2D Affine and TPS transformations for use in geodesy
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
    this._sourcePoints = sourcePoints;
    this._targetPoints = targetPoints;
    this._forwardParameters = this.__calculateParameters(sourcePoints, targetPoints);
    this._inverseParameters = this.__calculateParameters(targetPoints, sourcePoints);
  }
}

class Affine extends Transformation {
  constructor(sourcePoints, targetPoints) {
    super();
    if (sourcePoints && targetPoints) {
      this.calculate(sourcePoints, targetPoints);
    }
  }
  forward(point) {
    return this.__transform(point, this._forwardParameters);
  }
  inverse(point) {
    return this.__transform(point, this._inverseParameters);
  }
  toWorldFile(saveInverseParameters = false) {
    const parameters = saveInverseParameters ? this._inverseParameters : this._forwardParameters;
    return `${parameters.A}\n${parameters.D}\n${parameters.B}\n${parameters.E}\n${parameters.C}\n${parameters.F}\n`;
  }
  __transform(point, parameters) {
    const x = parameters.A * point[0] + parameters.B * point[1] + parameters.C;
    const y = parameters.D * point[0] + parameters.E * point[1] + parameters.F;
    return [x, y];
  }
  __calculateParameters(sourcePoints, targetPoints) {
    const numberPoints = sourcePoints.length;
    if (numberPoints < 3) throw 'Number of points must be at least 3!';
    if (sourcePoints.length !== targetPoints.length) throw 'Number of points do not mach!';
    let parameters = {};
    let i;
    let sp = [];
    for (i = 0; i < numberPoints; i++) {
      sp[i] = sourcePoints[i].slice(0);
    }
    let tp = [];
    for (i = 0; i < numberPoints; i++) {
      tp[i] = targetPoints[i].slice(0);
    }
    i = 0;
    let xcg, ycg, xcl, ycl;
    let a1, b1, a2, b2, c1, c2;
    xcg = ycg = xcl = ycl = a1 = b1 = a2 = b2 = c1 = c2 = 0;
    for (i = 0; i < numberPoints; i++) {
      xcg = xcg + tp[i][0];
      ycg = ycg + tp[i][1];
      xcl = xcl + sp[i][0];
      ycl = ycl + sp[i][1];
    }
    xcg /= numberPoints;
    ycg /= numberPoints;
    xcl /= numberPoints;
    ycl /= numberPoints;
    for (i = 0; i < numberPoints; i++) {
      tp[i][0] -= xcg;
      tp[i][1] -= ycg;
      sp[i][0] -= xcl;
      sp[i][1] -= ycl;
    }
    let x1 = 0;
    let y1 = 0;
    let x2 = 0;
    let y2 = 0;
    let x3 = 0;
    let y3 = 0;
    let x4 = 0;
    let n1 = 0;
    for (i = 0; i < numberPoints; i++) {
      x1 += sp[i][0] * tp[i][0];
      y1 += sp[i][1] * tp[i][0];
      x2 += sp[i][0] * sp[i][0];
      y2 += sp[i][1] * tp[i][1];
      x3 += sp[i][0] * tp[i][1];
      y3 += sp[i][1] * sp[i][1];
      x4 += sp[i][0] * sp[i][1];
    }
    a1 = x1 * y3 - y1 * x4;
    b1 = y1 * x2 - x1 * x4;
    a2 = y2 * x2 - x3 * x4;
    b2 = x3 * y3 - y2 * x4;
    n1 = x2 * y3 - x4 * x4;
    a1 /= n1;
    b1 /= n1;
    a2 /= n1;
    b2 /= n1;
    c1 = xcg - a1 * xcl - b1 * ycl;
    c2 = ycg - a2 * ycl - b2 * xcl;
    parameters.A = a1;
    parameters.B = b1;
    parameters.C = c1;
    parameters.D = b2;
    parameters.E = a2;
    parameters.F = c2;
    return parameters;
  }
}

function fromZeros(rows = 0, cols = 0) {
  let A = [];
  for (let i = 0; i < rows; i++) {
    A[i] = [];
    for (let j = 0; j < cols; j++) A[i][j] = 0;
  }
  return A;
}
function invertMatrix(M) {
  if (M.length !== M[0].length) {
    return;
  }
  let i = 0,
    ii = 0,
    j = 0,
    dim = M.length,
    e = 0;
  let I = [],
    C = [];
  for (i = 0; i < dim; i += 1) {
    I[I.length] = [];
    C[C.length] = [];
    for (j = 0; j < dim; j += 1) {
      if (i == j) {
        I[i][j] = 1;
      } else {
        I[i][j] = 0;
      }
      C[i][j] = M[i][j];
    }
  }
  for (i = 0; i < dim; i += 1) {
    e = C[i][i];
    if (e == 0) {
      for (ii = i + 1; ii < dim; ii += 1) {
        if (C[ii][i] != 0) {
          for (j = 0; j < dim; j++) {
            e = C[i][j];
            C[i][j] = C[ii][j];
            C[ii][j] = e;
            e = I[i][j];
            I[i][j] = I[ii][j];
            I[ii][j] = e;
          }
          break;
        }
      }
      e = C[i][i];
      if (e == 0) {
        return;
      }
    }
    for (j = 0; j < dim; j++) {
      C[i][j] = C[i][j] / e;
      I[i][j] = I[i][j] / e;
    }
    for (ii = 0; ii < dim; ii++) {
      if (ii == i) {
        continue;
      }
      e = C[ii][i];
      for (j = 0; j < dim; j++) {
        C[ii][j] -= e * C[i][j];
        I[ii][j] -= e * I[i][j];
      }
    }
  }
  return I;
}

class TPS extends Transformation {
  constructor(sourcePoints, targetPoints) {
    super();
    if (sourcePoints && targetPoints) {
      this.calculate(sourcePoints, targetPoints);
    }
  }
  forward(point) {
    return this.__isEmpty(this._forwardParameters) ? point : this.__transform(point, this._forwardParameters);
  }
  inverse(point) {
    return this.__isEmpty(this._forwardParameters) ? point : this.__transform(point, this._inverseParameters);
  }
  __transform(point, parameters) {
    let Xo = parameters.Xc[0] + parameters.Xc[1] * point[0] + parameters.Xc[2] * point[1],
      Yo = parameters.Yc[0] + parameters.Yc[1] * point[0] + parameters.Yc[2] * point[1];
    for (let r = 0; r < parameters.m; r++) {
      const tmp = this.__kernelFunction(point[0], point[1], parameters.sourcePoints[r][0], parameters.sourcePoints[r][1]);
      Xo += parameters.Xc[r + 3] * tmp;
      Yo += parameters.Yc[r + 3] * tmp;
    }
    return [Xo, Yo];
  }
  __calculateParameters(sourcePoints, targetPoints) {
    if (sourcePoints.length !== targetPoints.length) throw 'Number of points do not mach!';
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
        A[r + 3][c + 3] = this.__kernelFunction(sourcePoints[r][0], sourcePoints[r][1], sourcePoints[c][0], sourcePoints[c][1]);
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
  __kernelFunction(x1, y1, x2, y2) {
    if (x1 == x2 && y1 == y2) return 0;
    const dist = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    return dist * Math.log(dist);
  }
  __isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }
}

exports.Affine = Affine;
exports.TPS = TPS;
