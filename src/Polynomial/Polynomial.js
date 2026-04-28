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
  /**
   * Creates normalization parameters for the input points.
   * @private
   * @param {!Array.<Number>} points
   * @return {Object.<String,*>}
   */
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
  /**
   * Normalizes a point using centering and scale.
   * @private
   * @param {!Array.<Number>} point
   * @param {!Object.<String,*>} normalization
   * @return {Array.<Number>}
   */
  _normalizePoint(point, normalization) {
    return [
      (point[0] - normalization.xOffset) / normalization.scale,
      (point[1] - normalization.yOffset) / normalization.scale
    ];
  }
  /**
   * Builds polynomial basis terms up to the requested order.
   * @private
   * @param {!Array.<Number>} point
   * @param {!Number} order
   * @return {Array.<Number>}
   */
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
  /**
   * Calculates the dot product between two vectors.
   * @private
   * @param {!Array.<Number>} left
   * @param {!Array.<Number>} right
   * @return {Number}
   */
  _dotProduct(left, right) {
    let sum = 0;

    for (let i = 0; i < left.length; i++) {
      sum += left[i] * right[i];
    }

    return sum;
  }
}
