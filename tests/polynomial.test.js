import { Polynomial } from '../src/main';
import { assert } from 'chai';

describe('Test Polynomial Transformation', () => {
  const DELTA = 0.000001;
  const xCoefficients = [100, 1.25, -0.7, 0.02, 0.005, -0.01];
  const yCoefficients = [-50, 0.6, 1.4, -0.015, 0.01, 0.025];

  function transform(point) {
    const x = point[0];
    const y = point[1];
    const basis = [1, x, y, x * x, x * y, y * y];

    return [
      basis.reduce((sum, term, index) => sum + term * xCoefficients[index], 0),
      basis.reduce((sum, term, index) => sum + term * yCoefficients[index], 0)
    ];
  }

  const sourcePoints = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2]
  ];
  const targetPoints = sourcePoints.map(transform);

  const polynomial = new Polynomial(sourcePoints, targetPoints, 2);

  it('should transform forward', () => {
    const point = [1.5, 0.5];
    const expected = transform(point);
    const result = polynomial.forward(point);

    assert.closeTo(result[0], expected[0], DELTA);
    assert.closeTo(result[1], expected[1], DELTA);
  });

  it('should transform inverse for control points', () => {
    const sourcePoint = sourcePoints[4];
    const targetPoint = targetPoints[4];
    const result = polynomial.inverse(targetPoint);

    assert.closeTo(result[0], sourcePoint[0], DELTA);
    assert.closeTo(result[1], sourcePoint[1], DELTA);
  });
});
