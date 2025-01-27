import Transformation from '../Transformation';

/**
 * Class for creating Polynomial transformation
 */
export default class Polynomial extends Transformation {
  /**
   * Creates an Affine transformation
   * @param {Array.<Number>} [sourcePoints=[]] - array of points - [Northing, Easting]
   * @param {Array.<Number>} [targetPoints=[]] - array of points - [Northing, Easting]
   * @param {Number} [order=3]
   */
  constructor(sourcePoints, targetPoints, order = 3) {
    super();

    if (sourcePoints && targetPoints) {
      this.calculate(sourcePoints, targetPoints);
    }

    this._order = order;
    this._minPoints = 0;
    if (this._order == 1) this._minPoints = 4;
    else if (this._order == 2) this._minPoints = 10;
    else if (this._order == 3) this._minPoints = 20;
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

    if (numberPoints < this._minPoints) throw `Number of points must be at least ${this._minPoints}!`;
    if (sourcePoints.length !== targetPoints.length) throw 'Number of points do not mach!';

    if (numberPoints === this._minPoints) {
      this.__calculateWithExactPoints(sourcePoints, targetPoints);
    } else {
      this.__calculateWithMorePoints(sourcePoints, targetPoints);
    }
  }
  __calculateWithExactPoints(sourcePoints, targetPoints) {
    let pntNow,
      curRow = 1,
      j;

    let M = { n: 0, v: [] };

    M.n == sourcePoints.length + 1;

    for (pntNow = 0; pntNow < sourcePoints.length; pntNow++) {
      for (j = 1; j < M.n; j++) {
        https://github.com/GRASS-GIS/grass-ci/blob/306e35cefb14e2603d488c581d34713e3c8af040/vector/v.rectify/crs3d.c
        M.v[curRow][j] = this.__term(j, sourcePoints[i][1], sourcePoints[i][0], sourcePoints[i][2]);
      }
    }
  }
  __calculateWithMorePoints(sourcePoints, targetPoints) {}

  __term(term, e, n, z) {
    switch (term) {
      /* 1st order */
      case 1:
        return 1.0;
      case 2:
        return e;
      case 3:
        return n;
      case 4:
        return z;
      /* 2nd order */
      case 5:
        return e * e;
      case 6:
        return e * n;
      case 7:
        return e * z;
      case 8:
        return n * n;
      case 9:
        return n * z;
      case 10:
        return z * z;
      /* 3rd order */
      case 11:
        return e * e * e;
      case 12:
        return e * e * n;
      case 13:
        return e * e * z;
      case 14:
        return e * n * n;
      case 15:
        return e * n * z;
      case 16:
        return e * z * z;
      case 17:
        return n * n * n;
      case 18:
        return n * n * z;
      case 19:
        return n * z * z;
      case 20:
        return z * z * z;
    }

    return 0.0;
  }
}
