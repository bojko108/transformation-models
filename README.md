# Transformation Models

The library can be used for calculating transformation parameters using 2D Affine or Thin Plate Spline (TPS) transformations.

## Install

You can install it with NPM (`npm install transformation-models`) or Yarn (`yarn add transformation-models`) and then:

```js
import { Affine, TPS } from 'transformation-models';
```

### Affine transformation example

Allows scaling, rotation and translation only and preserves collinearity.

```js
import { Affine } from 'transformation-models';

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

const affine = new Affine(sourcePoints, targetPoints);

affine.forward([4734064.359, 8615839.411]);
// result is: [4732974.629, 492880.087]

affine.inverse([4732974.629, 492880.087]);
// result is: [4734064.359, 8615839.411]
```

### TPS transformation example

Can introduce local deformations in the data, but does not preserves collinearity.

```js
import { TPS } from 'transformation-models';

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

const tps = new TPS(sourcePoints, targetPoints);

tps.forward([4734064.359, 8615839.411]);
// result is: [4732974.629, 492880.087]

tps.inverse([4732974.629, 492880.087]);
// result is: [4734064.359, 8615839.411]
```

## License

transformation-models is [MIT](https://github.com/bojko108/transformation-models/tree/master/LICENSE) License @ bojko108
