
const colors = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1]
]


const triangle = (a, b, c, colorNumber) => {
  const a = [a, b, c]
  a.push(...colors[colorNumber])
  return a
}

const tetraHedron = ( a, b, c, d ) => {
  // tetrahedron with each side using
  // a different color
  triangle( a, c, b, 0 );
  triangle( a, c, d, 1 );
  triangle( a, b, d, 2 );
  triangle( b, c, d, 3 );
}

// Black magic
const mix = ( u, v, s ) => {
  var result = [];
  for ( var i = 0; i < u.length; ++i ) {
    result.push( (1.0 - s) * u[i] + s * v[i] );
  }
  return result;
}

const divideTetrahedron = ( a, b, c, d, count ) => {
  // check for end of recursion
  if ( count-- === 0 )
  tetraHedron( a, b, c, d );

  // find midpoints of sides
  // divide four smaller tetrahedra
  else {
    var ab = mix( a, b, 0.5 );
    var ac = mix( a, c, 0.5 );
    var ad = mix( a, d, 0.5 );
    var bc = mix( b, c, 0.5 );
    var bd = mix( b, d, 0.5 );
    var cd = mix( c, d, 0.5 );

    --count;

    divideTetrahedron(  a, ab, ac, ad, count );
    divideTetrahedron( ab,  b, bc, bd, count );
    divideTetrahedron( ac, bc,  c, cd, count );
    divideTetrahedron( ad, bd, cd,  d, count );
  }
}
const vs = [
  [  0.0000,  0.0000, -1.0000 ],
  [  0.0000,  0.9428,  0.3333 ],
  [ -0.8165, -0.4714,  0.3333 ],
  [  0.8165, -0.4714,  0.3333 ]
]

const pyramid = divideTetrahedron(vs[0], vs[0], vs[0], vs[0], 3)

export {
  pyramid
}
