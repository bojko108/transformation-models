import Transformation from '../Transformation';
import { solveLeastSquares } from '../utils/matrix';

/**
 * Class for creating a 2D Helmert transformation.
 */
export default class Helmert extends Transformation {
  /**
   * Creates a Helmert transformation.
   * @param {Array.<Number>} [sourcePoints=[]] - array of points - [Northing, Easting]
   * @param {Array.<Number>} [targetPoints=[]] - array of points - [Northing, Easting]
   */
  constructor(sourcePoints, targetPoints) {
    super();
    this._initialize(sourcePoints, targetPoints);
  }
  /**
   * Transforms a point.
   * @private
   * @param {!Array.<Number>} point
   * @param {!Object.<String,*>} parameters
   * @return {Array.<Number>}
   */
  _transform(point, parameters) {
    const x = parameters.tx + parameters.scaleCos * point[0] - parameters.scaleSin * point[1];
    const y = parameters.ty + parameters.scaleSin * point[0] + parameters.scaleCos * point[1];

    return [x, y];
  }
  /**
   * Calculates Helmert transformation parameters.
   * @private
   * @param {!Array.<Number>} sourcePoints
   * @param {!Array.<Number>} targetPoints
   * @return {Object.<String,*>}
   */
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
