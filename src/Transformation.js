/**
 * Base Class for creating a transformation
 */
export default class Transformation {
  /**
   * Creates a transformation
   */
  constructor() {
    /**
     * Source points array - [Northing, Easting]
     * @private
     * @type {Array.<Number>}
     */
    this._sourcePoints = [];
    /**
     * Target points array - [Northing, Easting]
     * @private
     * @type {Array.<Number>}
     */
    this._targetPoints = [];
    /**
     * Forward transformation parameters - used for transforming from source to target
     * @private
     * @type {Object.<String,*>}
     */
    this._forwardParameters = {};
    /**
     * Inverse transformation parameters - used for transforming from target to source
     * @private
     * @type {Object.<String,*>}
     */
    this._inverseParameters = {};
  }
  /**
   * Initializes the transformation with control points when provided.
   * @protected
   * @param {Array.<Number>} [sourcePoints]
   * @param {Array.<Number>} [targetPoints]
   * @return {undefined}
   */
  _initialize(sourcePoints, targetPoints) {
    if (sourcePoints && targetPoints) {
      this.calculate(sourcePoints, targetPoints);
    }
  }
  /**
   * Get source points array
   * @public
   * @readonly
   * @return {Array.<Number>}
   */
  get sourcePoints() {
    return this._sourcePoints;
  }
  /**
   * Get target points array
   * @public
   * @readonly
   * @return {Array.<Number>}
   */
  get targetPoints() {
    return this._targetPoints;
  }
  /**
   * Get forward transformation parameters
   * @public
   * @return {Object.<String,*>}
   */
  get forwardParameters() {
    return this._forwardParameters;
  }
  /**
   * Set forward transformation parameters
   * @public
   * @param {Object.<String,*>} [parameters={}]
   */
  set forwardParameters(parameters = {}) {
    this._forwardParameters = parameters;
  }
  /**
   * Get inverse transformation parameters
   * @public
   * @return {Object.<String,*>}
   */
  get inverseParameters() {
    return this._inverseParameters;
  }
  /**
   * Set inverse transformation parameters
   * @public
   * @param {Object.<String,*>} [parameters={}]
   */
  set inverseParameters(parameters = {}) {
    this._inverseParameters = parameters;
  }
  /**
   * Calculates forward and inverse parameters based on passed source and target points
   * @public
   * @param {!Array.<Number>} sourcePoints - array of points - [Northing, Easting]
   * @param {!Array.<Number>} targetPoints - array of points - [Northing, Easting]
   * @return {undefined}
   */
  calculate(sourcePoints, targetPoints) {
    this._validateControlPoints(sourcePoints, targetPoints);

    this._sourcePoints = sourcePoints;
    this._targetPoints = targetPoints;

    this._forwardParameters = this._calculateParameters(sourcePoints, targetPoints);
    this._inverseParameters = this._calculateParameters(targetPoints, sourcePoints);
  }
  /**
   * Transforms a point from source to target.
   * @public
   * @param {!Array.<Number>} point
   * @return {Array.<Number>}
   */
  forward(point) {
    return this._apply(point, this._forwardParameters);
  }
  /**
   * Transforms a point from target to source.
   * @public
   * @param {!Array.<Number>} point
   * @return {Array.<Number>}
   */
  inverse(point) {
    return this._apply(point, this._inverseParameters);
  }
  /**
   * Calculates forward RMS error on the fitted control points.
   * @public
   * @return {Object.<String,Number>}
   */
  forwardRMSError() {
    return this._calculateRMSError(this._sourcePoints, this._targetPoints, this._forwardParameters);
  }
  /**
   * Calculates inverse RMS error on the fitted control points.
   * @public
   * @return {Object.<String,Number>}
   */
  inverseRMSError() {
    return this._calculateRMSError(this._targetPoints, this._sourcePoints, this._inverseParameters);
  }
  /**
   * Validate control point arrays.
   * @protected
   * @param {!Array.<Number>} sourcePoints
   * @param {!Array.<Number>} targetPoints
   * @return {undefined}
   */
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
  /**
   * Validate a 2D point.
   * @protected
   * @param {!Array.<Number>} point
   * @return {undefined}
   */
  _validatePoint(point) {
    if (!Array.isArray(point) || point.length !== 2) {
      throw new Error('Point must be a 2D coordinate pair!');
    }

    if (!Number.isFinite(point[0]) || !Number.isFinite(point[1])) {
      throw new Error('Point coordinates must be finite numbers!');
    }
  }
  /**
   * Ensures the transformation has enough control points.
   * @protected
   * @param {!Array.<Number>} points
   * @param {!Number} minimum
   * @return {undefined}
   */
  _requireMinimumPointCount(points, minimum) {
    if (points.length < minimum) {
      throw new Error(`Number of points must be at least ${minimum}!`);
    }
  }
  /**
   * Applies the given parameter set to a point.
   * @protected
   * @param {!Array.<Number>} point
   * @param {!Object.<String,*>} parameters
   * @return {Array.<Number>}
   */
  _apply(point, parameters) {
    this._validatePoint(point);

    if (this._isEmptyParameters(parameters)) {
      return point;
    }

    return this._transform(point, parameters);
  }
  /**
   * Checks whether a parameter object is empty.
   * @protected
   * @param {Object.<String,*>} parameters
   * @return {Boolean}
   */
  _isEmptyParameters(parameters) {
    return Object.keys(parameters).length === 0 && parameters.constructor === Object;
  }
  /**
   * Calculates RMS error for a parameter set and control-point pairs.
   * @protected
   * @param {!Array.<Number>} sourcePoints
   * @param {!Array.<Number>} targetPoints
   * @param {!Object.<String,*>} parameters
   * @return {Object.<String,Number>}
   */
  _calculateRMSError(sourcePoints, targetPoints, parameters) {
    if (sourcePoints.length === 0 || targetPoints.length === 0 || this._isEmptyParameters(parameters)) {
      return { x: 0, y: 0, total: 0 };
    }

    let sumSquaredX = 0;
    let sumSquaredY = 0;

    for (let i = 0; i < sourcePoints.length; i++) {
      const transformedPoint = this._transform(sourcePoints[i], parameters);
      const deltaX = transformedPoint[0] - targetPoints[i][0];
      const deltaY = transformedPoint[1] - targetPoints[i][1];

      sumSquaredX += deltaX * deltaX;
      sumSquaredY += deltaY * deltaY;
    }

    const pointCount = sourcePoints.length;
    const rmsX = Math.sqrt(sumSquaredX / pointCount);
    const rmsY = Math.sqrt(sumSquaredY / pointCount);

    return {
      x: rmsX,
      y: rmsY,
      total: Math.sqrt((sumSquaredX + sumSquaredY) / pointCount)
    };
  }
}
