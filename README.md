# Transformation Models

`transformation-models` provides 2D coordinate transformations for geodetic and mapping workflows.

Currently supported:

- `Affine`
- `Helmert`
- `Polynomial`
- `TPS` (Thin Plate Spline)

## Install

Install with NPM:

```bash
npm install transformation-models
```

Or with Yarn:

```bash
yarn add transformation-models
```

Then import the methods you need:

```js
import { Affine, Helmert, Polynomial, TPS } from 'transformation-models';
```

## Common Usage

All transformation classes share the same basic API:

```js
const transformation = new Affine(sourcePoints, targetPoints);

transformation.forward([4734064.359, 8615839.411]);
transformation.inverse([4732974.629, 492880.087]);
```

- `sourcePoints` and `targetPoints` are arrays of 2D coordinates in the form `[Northing, Easting]`
- `forward(point)` transforms from source to target
- `inverse(point)` transforms from target to source

## Transformation Types

### Affine

An affine transformation models translation, rotation, scale, and shear. It preserves straight lines and collinearity.

Requires at least `3` control points.

```js
import { Affine } from 'transformation-models';

const affine = new Affine(sourcePoints, targetPoints);

const result = affine.forward([4734064.359, 8615839.411]);
// [4732974.629, 492880.087]
```

`Affine` also supports exporting parameters as a world file:

```js
const worldFile = affine.toWorldFile();
```

### Helmert

A 2D Helmert transformation is a 4-parameter similarity transform. It models translation, uniform scale, and rotation, while preserving shape locally better than a general affine transform.

Requires at least `2` control points.

```js
import { Helmert } from 'transformation-models';

const helmert = new Helmert(sourcePoints, targetPoints);

const result = helmert.forward([4734064.359, 8615839.411]);
```

Available fitted parameters include:

- `tx`
- `ty`
- `scale`
- `rotation`

### Polynomial

A polynomial transformation fits a global polynomial surface between the control point sets. Higher orders can model broader non-linear distortions better than affine or Helmert transforms.

```js
import { Polynomial } from 'transformation-models';

const polynomial = new Polynomial(sourcePoints, targetPoints, 2);

const result = polynomial.forward([4734064.359, 8615839.411]);
```

Notes:

- order `1` behaves like a first-order polynomial transform and is equivalent to affine
- order `2` and above can model non-linear distortion
- minimum number of control points is `(order + 1) * (order + 2) / 2`
- forward and inverse parameters are fitted separately from the control points

### TPS

Thin Plate Spline (TPS) can model local deformations very well, but it does not preserve collinearity.

```js
import { TPS } from 'transformation-models';

const tps = new TPS(sourcePoints, targetPoints);

const result = tps.forward([4734064.359, 8615839.411]);
```

TPS is usually a good fit when local warping is more important than preserving the geometric properties of a global linear model.

## Example Control Points

```js
const sourcePoints = [
  [4734563.812, 8602649.049],
  [4725349.627, 8610759.665],
  [4723443.326, 8616104.954],
  [4721845.431, 8622312.598],
  [4720159.801, 8603248.973],
  [4718040.498, 8608875.072],
  [4716553.179, 8620405.969],
  [4724628.766, 8631596.47],
  [4724538.865, 8629857.48],
  [4751688.217, 8617662.209],
  [4746994.861, 8621675.591],
  [4746480.919, 8608375.672],
  [4741551.591, 8615165.917],
  [4734308.135, 8616623.423],
  [4744231.665, 8630246.732],
  [4736133.859, 8630921.615],
  [4732346.726, 8627234.144]
];

const targetPoints = [
  [4733708.335, 479703.427],
  [4724353.409, 487647.473],
  [4722352.973, 492956.916],
  [4720645.585, 499133.77],
  [4719298.709, 480047.397],
  [4717080.395, 485633.91],
  [4715389.251, 497134.073],
  [4723263.059, 508463.146],
  [4723204.053, 506723.307],
  [4750559.251, 495015.878],
  [4745796.219, 498944.058],
  [4745519.337, 485640.022],
  [4740470.969, 492340.007],
  [4733204.376, 493668.131],
  [4742881.509, 507462.453],
  [4734775.168, 507992.948],
  [4731055.189, 504239.725]
];
```

## License

`transformation-models` is licensed under the [MIT License](https://github.com/bojko108/transformation-models/tree/master/LICENSE).
