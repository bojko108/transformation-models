import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import fs from 'fs';

let details = JSON.parse(fs.readFileSync('package.json', 'utf8')),
  description = `/** 
 * ${details.name} - v${details.version}
 * description: ${details.description}
 * author: ${details.author}
 * 
 * github: ${details.repository.url.replace('.git', '')}
 */
    `;

export default {
  input: 'src/main.js',
  output: [
    {
      name: details.name,
      banner: description,
      file: `dist/${details.name}.js`,
      format: 'cjs'
    }
  ],
  plugins: [nodeResolve(), commonjs(), cleanup()]
};
