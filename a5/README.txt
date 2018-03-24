name:      Ziyang Jin
student #: 34893140
cs id:     f4a0b

NOTES:

Press "R" to explode the water ball in the middle.
Press "C" to change the picture on the ball with the picture on the wall.
(sometimes the keystore does not respond properly; try a few times)

The fireball and the middle water ball code, which uses perlin noise, is originated from an online tutorial https://www.clicktorelease.com/blog/vertex-displacement-noise-3d-webgl-glsl-three-js/

The ball in the middle, the mirror, the armadillo, and also all water drops if you hit "R", do mirror reflection correctly on all 6 faces of the sky box.

The middle bottom ball uses envmapMaterial to satisfy the grading requirement for reflection only 1 face of the skybox. It can also exchange the harry potter image with the image on the wall behind by pressing "C".

The spinning floor has a unique shader that rotates the texture map coordinates over time, so it is rotating. Correctly implementing this is not as easy as it seems.

