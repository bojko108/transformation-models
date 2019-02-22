import Transformation from '../Transformation';

/**
 * Class for creating Affine transformation
 */
export default class Affine extends Transformation {
   /**
   * Creates an Affine transformation
   * @param {Array.<Number>} [sourcePoints=[]] - array of points - [Northing, Easting]
   * @param {Array.<Number>} [targetPoints=[]] - array of points - [Northing, Easting]
   */
  constructor(sourcePoints, targetPoints) {
    super();

    if (sourcePoints && targetPoints) {
      this.calculate(sourcePoints, targetPoints);
    }
  }
  /**
   * Transforms a point from source to target
   * @public
   * @param {!Array.<Number>} point - array of coordinates - [Northing, Easting]
   * @return {Array.<Number>}
   */
  forward(point) {
    return this.__transform(point, this._forwardParameters);
  }
  /**
   * Transforms a point from target to source
   * @public
   * @param {!Array.<Number>} point - array of coordinates - [Northing, Easting]
   * @return {Array.<Number>}
   */
  inverse(point) {
    return this.__transform(point, this._inverseParameters);
  }
  /**
   * Get transformation parameters in the form of a World file
   * @public
   * @see https://en.wikipedia.org/wiki/World_file
   * @param {Boolean} [saveInverseParameters] - by default it will save the forward parameters
   */
  toWorldFile(saveInverseParameters = false) {
    const parameters = saveInverseParameters ? this._inverseParameters : this._forwardParameters;
    return `${parameters.A}\n${parameters.D}\n${parameters.B}\n${parameters.E}\n${parameters.C}\n${parameters.F}\n`;
  }
  /**
   * Transforms a point
   * @private
   * @param {!Array.<Number>} point - array of coordinates - [Northing, Easting] 
   * @param {!Object.<String,*>} parameters - Affine transformation parameters
   * @return {Array.<Number>}
   */
  __transform(point, parameters) {
    const x = parameters.A * point[0] + parameters.B * point[1] + parameters.C;
    const y = parameters.D * point[0] + parameters.E * point[1] + parameters.F;
    return [x, y];
  }
  /**
   * Calculates Affine transformation parameters based on passed source and target points
   * @private
   * @param {!Array.<Number>} sourcePoints - array of points - [Northing, Easting]
   * @param {!Array.<Number>} targetPoints - array of points - [Northing, Easting]
   * @return {Object.<String,*>}
   */
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
