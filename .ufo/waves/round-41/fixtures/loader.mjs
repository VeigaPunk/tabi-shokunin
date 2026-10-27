// ESM loader injection fixture: NODE_OPTIONS=--experimental-loader <this file>
// is a second loader-boundary vector the env gate must refuse.
export async function resolve(specifier, context, next) { return next(specifier, context); }
export async function load(url, context, next) { return next(url, context); }
