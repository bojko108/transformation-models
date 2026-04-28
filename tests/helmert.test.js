import { Helmert } from '../src/main';
import { assert } from 'chai';

describe('Test Helmert Transformation', () => {
  const DELTA = 0.000001;
  const scale = 1.00025;
  const rotation = 8 * Math.PI / 180;
  const scaleCos = scale * Math.cos(rotation);
  const scaleSin = scale * Math.sin(rotation);
  const tx = 345.67;
  const ty = -128.45;

  function transform(point) {
    return [
      tx + scaleCos * point[0] - scaleSin * point[1],
      ty + scaleSin * point[0] + scaleCos * point[1]
    ];
  }

  const sourcePoints = [
    [1000, 2000],
    [1500, 2500],
    [2000, 2200],
    [2600, 2800]
  ];
  const targetPoints = sourcePoints.map(transform);

  const helmert = new Helmert(sourcePoints, targetPoints);

  it('should transform forward', () => {
    const point = [1800, 2400];
    const expected = transform(point);
    const result = helmert.forward(point);

    assert.closeTo(result[0], expected[0], DELTA);
    assert.closeTo(result[1], expected[1], DELTA);
  });

  it('should transform inverse', () => {
    const point = [1800, 2400];
    const transformed = transform(point);
    const result = helmert.inverse(transformed);

    assert.closeTo(result[0], point[0], DELTA);
    assert.closeTo(result[1], point[1], DELTA);
  });
});
