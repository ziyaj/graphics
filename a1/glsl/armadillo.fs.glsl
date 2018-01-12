// Create shared variable. The value is given as the interpolation between normals computed in the vertex shader
varying vec3 interpolatedNormal;

void main() {
    // Set final rendered color according to the surface normal
  vec3 N = normalize(interpolatedNormal);
  vec3 L = vec3(0.0, 0.0, -1.0);
  float i = dot(N, L);
  gl_FragColor = vec4(i, i, i, 1.0);
  // shade all pixels of the Armadillo green
  // gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
}
