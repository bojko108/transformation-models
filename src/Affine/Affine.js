import Transformation from '../Transformation';
import { solveLeastSquares } from '../utils/matrix';

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
    this._validatePoint(point);
    return this.__transform(point, this._forwardParameters);
  }
  /**
   * Transforms a point from target to source
   * @public
   * @param {!Array.<Number>} point - array of coordinates - [Northing, Easting]
   * @return {Array.<Number>}
   */
  inverse(point) {
    this._validatePoint(point);
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
    if (sourcePoints.length < 3) {
      throw new Error('Number of points must be at least 3!');
    }

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
