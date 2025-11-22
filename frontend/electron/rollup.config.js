import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import nodeResolve from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"

export default [
  {
    input: "src/preload.ts",
    output: {
      file: "dist/preload.js",
      format: "cjs",
    },
    external: ["electron"],
    plugins: [nodeResolve({ preferBuiltins: true }), commonjs(), typescript()],
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "cjs",
    },
    external: ["electron"],
    plugins: [
      json(),
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      typescript(),
    ],
  },
]
