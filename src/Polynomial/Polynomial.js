import Transformation from '../Transformation';
import { solveLeastSquares } from '../utils/matrix';

/**
 * Class for creating a 2D polynomial transformation.
 */
export default class Polynomial extends Transformation {
  /**
   * Creates a polynomial transformation.
   * @param {Array.<Number>} [sourcePoints=[]] - array of points - [Northing, Easting]
   * @param {Array.<Number>} [targetPoints=[]] - array of points - [Northing, Easting]
   * @param {Number} [order=2] - polynomial order
   */
  constructor(sourcePoints, targetPoints, order = 2) {
    super();

    this.order = order;

    if (sourcePoints && targetPoints) {
      this.calculate(sourcePoints, targetPoints);
    }
  }
  /**
   * Get polynomial order.
   * @public
   * @return {Number}
   */
  get order() {
    return this._order;
  }
  /**
   * Set polynomial order.
   * @public
   * @param {Number} value
   */
  set order(value) {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error('Polynomial order must be an integer greater than 0!');
    }

    this._order = value;
  }
  /**
   * Transforms a point from source to target.
   * @public
   * @param {!Array.<Number>} point - array of coordinates - [Northing, Easting]
   * @return {Array.<Number>}
   */
  forward(point) {
    this._validatePoint(point);
    return this.__transform(point, this._forwardParameters);
  }
  /**
   * Transforms a point from target to source.
   * @public
   * @param {!Array.<Number>} point - array of coordinates - [Northing, Easting]
   * @return {Array.<Number>}
   */
  inverse(point) {
    this._validatePoint(point);
    return this.__transform(point, this._inverseParameters);
  }
  /**
   * Transforms a point.
   * @private
   * @param {!Array.<Number>} point
   * @param {!Object.<String,*>} parameters
   * @return {Array.<Number>}
   */
  __transform(point, parameters) {
    const basis = this.__buildBasis(point, parameters.order);

    return [
      this.__dotProduct(basis, parameters.xCoefficients),
      this.__dotProduct(basis, parameters.yCoefficients)
    ];
  }
  /**
   * Calculates polynomial transformation parameters.
   * @private
   * @param {!Array.<Number>} sourcePoints
   * @param {!Array.<Number>} targetPoints
   * @return {Object.<String,*>}
   */
  __calculateParameters(sourcePoints, targetPoints) {
    const coefficientCount = ((this.order + 1) * (this.order + 2)) / 2;

    if (sourcePoints.length < coefficientCount) {
      throw new Error(`Number of points must be at least ${coefficientCount}!`);
    }

    const designMatrix = sourcePoints.map(point => this.__buildBasis(point, this.order));
    const xCoefficients = solveLeastSquares(designMatrix, targetPoints.map(point => point[0]));
    const yCoefficients = solveLeastSquares(designMatrix, targetPoints.map(point => point[1]));

    return {
      order: this.order,
      xCoefficients,
      yCoefficients
    };
  }
  /**
   * Builds polynomial basis terms up to the requested order.
   * @private
   * @param {!Array.<Number>} point
   * @param {!Number} order
   * @return {Array.<Number>}
   */
  __buildBasis(point, order) {
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
  /**
   * Calculates the dot product between two vectors.
   * @private
   * @param {!Array.<Number>} left
   * @param {!Array.<Number>} right
   * @return {Number}
   */
  __dotProduct(left, right) {
    let sum = 0;

    for (let i = 0; i < left.length; i++) {
      sum += left[i] * right[i];
    }

    return sum;
  }
}
