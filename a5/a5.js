/////////////////////////////////////////////////////////////////////////////////////////
//  UBC CPSC 314,  Vjan2018
//  Assignment 5 Template;   compatible with three.js  r90
/////////////////////////////////////////////////////////////////////////////////////////

console.log('hello world');

//  another print example
myvector = new THREE.Vector3(0,1,2);
console.log('myvector =',myvector);

// SETUP RENDERER & SCENE
var canvas = document.getElementById('canvas');
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xd0f0d0); // set background colour
canvas.appendChild(renderer.domElement);
var start = Date.now();
var balls = [];
var rain = false;
var changePic = false;
var choose1 = true;

// SETUP CAMERA
var camera = new THREE.PerspectiveCamera(30,1,0.1,10000); // view angle, aspect ratio, near, far
camera.position.set(0,12,20);
camera.lookAt(0,0,0);
scene.add(camera);

// SETUP ORBIT CONTROLS OF THE CAMERA
var controls = new THREE.OrbitControls(camera);
controls.damping = 0.2;
controls.autoRotate = false;

// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
}

// EVENT LISTENER RESIZE
window.addEventListener('resize',resize);
resize();

//SCROLLBAR FUNCTION DISABLE
window.onscroll = function () {
     window.scrollTo(0,0);
}

/////////////////////////////////////
// ADD LIGHTS  and define a simple material that uses lighting
/////////////////////////////////////

light = new THREE.PointLight(0xffffff);
light.position.set(0,4,4);                           // WCS coords for light
var vcsLight = new THREE.Vector3(0.0,0.0,0.0);       // VCS coords for light

scene.add(light);
ambientLight = new THREE.AmbientLight(0x606060);
scene.add(ambientLight);

var diffuseMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff} );
var basicMaterial = new THREE.MeshBasicMaterial( {color: 0xff0000} );

///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////  SHADERS /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

var textureLoader = new THREE.TextureLoader();
posyTexture = textureLoader.load( "images/posy.jpg" );   // skybox top texture
negyTexture = textureLoader.load( "images/negy.jpg" );   //  load texture map
poszTexture = textureLoader.load( "images/posz.jpg" );   //  load texture map
negzTexture = textureLoader.load( "images/negz.jpg" );   //  load texture map
posxTexture = textureLoader.load( "images/posx.jpg" );   //  load texture map
negxTexture = textureLoader.load( "images/negx.jpg" );   //  load texture map
expoTexture = textureLoader.load( "images/explosion.png" );
potterTexture = textureLoader.load( "images/harrypotter.jpg" );
hp2Texture = textureLoader.load( "images/hp2.jpg" );

////////////////////// (g) CREATIVE SHADER /////////////////////////////
var creativeMaterial = new THREE.ShaderMaterial( {
  uniforms: {
    tExplosion: {
      type: "t",
      value: expoTexture
    },
    time: { // float initialized to 0
      type: "f",
      value: 0.0
    }
  },
    vertexShader: document.getElementById( 'creativeVertShader' ).textContent,
    fragmentShader: document.getElementById( 'creativeFragShader' ).textContent
} );

////////////////////// (g) PERLIN SHADER /////////////////////////////
var perlinMaterial = new THREE.ShaderMaterial( {
  uniforms: {
    lightPosition: { value: new THREE.Vector3(0.0,0.0,-1.0) },
    matrixWorld: { value: new THREE.Matrix4() },
    myTopTexture: {type: 't', value: posyTexture},     // give access to skybox top texture
    myBotTexture: {type: 't', value: negyTexture},     // give access to skybox bot texture
    myFrontTexture: {type: 't', value: poszTexture},     // give access to skybox front texture
    myBackTexture: {type: 't', value: negzTexture},     // give access to skybox back texture
    myLeftTexture: {type: 't', value: posxTexture},     // give access to skybox left texture
    myRightTexture: {type: 't', value: negxTexture},     // give access to skybox right texture
    myColor: { value: new THREE.Vector4(0.8,0.8,0.6,1.0) },
    time: { // float initialized to 0
      type: "f",
      value: 0.0
    }
  },
    vertexShader: document.getElementById( 'creativeVertShader' ).textContent,
    fragmentShader: document.getElementById( 'perlinFragShader' ).textContent
} );

////////////////////// ENVMAP SHADER /////////////////////////////

var envmapMaterial = new THREE.ShaderMaterial( {
  uniforms: {
    lightPosition: { value: new THREE.Vector3(0.0,0.0,-1.0) },
    matrixWorld: { value: new THREE.Matrix4() },
    myTexture: {type: 't', value: posyTexture},     // give access to skybox top texture
    myPotterTexture: {type: 't', value: potterTexture},     // give access to skybox top texture
    myColor: { value: new THREE.Vector4(0.8,0.8,0.6,1.0) }
  },
  vertexShader: document.getElementById( 'myVertShader' ).textContent,
  fragmentShader: document.getElementById( 'envmapFragShader' ).textContent
} );

////////////////////// rain SHADER /////////////////////////////

var rainMaterial = new THREE.ShaderMaterial( {
  uniforms: {
    lightPosition: { value: new THREE.Vector3(0.0,0.0,-1.0) },
    matrixWorld: { value: new THREE.Matrix4() },
    myTopTexture: {type: 't', value: posyTexture},     // give access to skybox top texture
    myBotTexture: {type: 't', value: negyTexture},     // give access to skybox bot texture
    myFrontTexture: {type: 't', value: poszTexture},     // give access to skybox front texture
    myBackTexture: {type: 't', value: negzTexture},     // give access to skybox back texture
    myLeftTexture: {type: 't', value: posxTexture},     // give access to skybox left texture
    myRightTexture: {type: 't', value: negxTexture},     // give access to skybox right texture
    myColor: { value: new THREE.Vector4(0.8,0.8,0.6,1.0) }
  },
  vertexShader: document.getElementById( 'myVertShader' ).textContent,
  fragmentShader: document.getElementById( 'rainFragShader' ).textContent
} );

////////////////////// BUMP SHADER /////////////////////////////

var myBumpMaterial = new THREE.ShaderMaterial( {
        uniforms: {
           lightPosition: {value: new THREE.Vector3(0.0,0.0,-1.0) },
           myColor: { value: new THREE.Vector4(0.0,1.0,0.0,1.0) }
        },
  vertexShader: document.getElementById( 'myVertShader' ).textContent,
  fragmentShader: document.getElementById( 'myBumpShader' ).textContent
} );
myBumpMaterial.uniforms.lightPosition.value.needsUpdate = true;

////////////////////// HOLEY SHADER /////////////////////////////

var holeyMaterial = new THREE.ShaderMaterial( {
        uniforms: {
           lightPosition: {value: new THREE.Vector3(0.0,0.0,-1.0) },
           myColor: { value: new THREE.Vector4(0.5,1.0,1.0,1.0) }
        },
  vertexShader: document.getElementById( 'myVertShader' ).textContent,
  fragmentShader: document.getElementById( 'holeyShader' ).textContent
} );

////////////////////// TOON SHADER /////////////////////////////

var toonMaterial = new THREE.ShaderMaterial( {
        uniforms: {
           lightPosition: {value: new THREE.Vector3(0.0,0.0,-1.0) },
           myColor: { value: new THREE.Vector4(1.0,0.5,0.8,1.0) }
        },
  vertexShader: document.getElementById( 'myVertShader' ).textContent,
  fragmentShader: document.getElementById( 'toonShader' ).textContent
} );

///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////  OBJECTS /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////
// WORLD COORDINATE FRAME
/////////////////////////////////////

var worldFrame = new THREE.AxesHelper(5) ;
scene.add(worldFrame);


/////////////////////////////////////
// Skybox texture
/////////////////////////////////////

var size = 1000;
wallGeometry = new THREE.PlaneBufferGeometry(2*size, 2*size);

posxMaterial = new THREE.MeshBasicMaterial( {map: posxTexture, side:THREE.DoubleSide });
posxWall = new THREE.Mesh(wallGeometry, posxMaterial);   // define the wall object:  geom + shader
posxWall.position.x = -size;
posxWall.rotation.y = Math.PI / 2;
scene.add(posxWall);

////// (b) TODO:  add the other walls of the skybox
negxMaterial = new THREE.MeshBasicMaterial( {map: negxTexture, side:THREE.DoubleSide });
negxWall = new THREE.Mesh(wallGeometry, negxMaterial);   // define the wall object:  geom + shader
negxWall.position.x = size;
negxWall.rotation.y = -Math.PI / 2;
scene.add(negxWall);

posyMaterial = new THREE.MeshBasicMaterial( {map: posyTexture, side:THREE.DoubleSide });
posyWall = new THREE.Mesh(wallGeometry, posyMaterial);   // define the wall object:  geom + shader
posyWall.position.y = size;
posyWall.rotation.x = -Math.PI / 2;
posyWall.rotation.y = Math.PI;
scene.add(posyWall);

negyMaterial = new THREE.MeshBasicMaterial( {map: negyTexture, side:THREE.DoubleSide });
negyWall = new THREE.Mesh(wallGeometry, negyMaterial);   // define the wall object:  geom + shader
negyWall.position.y = -size;
negyWall.rotation.x = -Math.PI / 2;
negyWall.rotation.z = Math.PI;
scene.add(negyWall);

poszMaterial = new THREE.MeshBasicMaterial( {map: poszTexture, side:THREE.DoubleSide });
poszWall = new THREE.Mesh(wallGeometry, poszMaterial);   // define the wall object:  geom + shader
poszWall.position.z = size;
poszWall.rotation.y = Math.PI;
scene.add(poszWall);

negzMaterial = new THREE.MeshBasicMaterial( {map: negzTexture, side:THREE.DoubleSide });
negzWall = new THREE.Mesh(wallGeometry, negzMaterial);   // define the wall object:  geom + shader
negzWall.position.z = -size;
scene.add(negzWall);


/////////////////////////////////////
// FLOOR with texture
/////////////////////////////////////

var textureLoader = new THREE.TextureLoader();
floorTexture = textureLoader.load( "images/floor.jpg" );
floorTexture.magFilter = THREE.NearestFilter;
floorTexture.minFilter = THREE.LinearMipMapLinearFilter; // (a) cool!
var floorMaterial = new THREE.ShaderMaterial( {
  uniforms: {
    lightPosition: { value: new THREE.Vector3(0.0,0.0,-1.0) },
    matrixWorld: { value: new THREE.Matrix4() },
    myTexture: {type: 't', value: floorTexture},     // give access to skybox top texture
    time: { // float initialized to 0
      type: "f",
      value: 0.0
    }
  },
  vertexShader: document.getElementById( 'spinShader' ).textContent,
  fragmentShader: document.getElementById( 'spinFragShader' ).textContent
} );

floorGeometry = new THREE.Geometry();
var v0 = new THREE.Vector3(0,0,0);
var v1 = new THREE.Vector3(20,0,0);
var v2 = new THREE.Vector3(0,20,0);
var v3 = new THREE.Vector3(20,20,0);

floorGeometry.vertices.push(v0);
floorGeometry.vertices.push(v1);
floorGeometry.vertices.push(v2);
floorGeometry.vertices.push(v3);

floorGeometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
floorGeometry.faces.push( new THREE.Face3( 1, 3, 2 ) );
floorGeometry.computeFaceNormals();

floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.x = -10;
floor.position.y = -1.1;
floor.position.z = 10;
floor.rotation.x = - Math.PI / 2;
scene.add(floor);

/////////////////////////////////////
// tv with texture
/////////////////////////////////////
tvGeometry = new THREE.Geometry();
var v0 = new THREE.Vector3(0,0,0);
var v1 = new THREE.Vector3(10,0,0);
var v2 = new THREE.Vector3(0,10,0);
var v3 = new THREE.Vector3(10,10,0);

tvGeometry.vertices.push(v0);
tvGeometry.vertices.push(v1);
tvGeometry.vertices.push(v2);
tvGeometry.vertices.push(v3);

tvGeometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
tvGeometry.faces.push( new THREE.Face3( 1, 3, 2 ) );
tvGeometry.computeFaceNormals();

var tvMaterial = new THREE.ShaderMaterial( {
  uniforms: {
    lightPosition: { value: new THREE.Vector3(0.0,0.0,-1.0) },
    matrixWorld: { value: new THREE.Matrix4() },
    myTexture: {type: 't', value: hp2Texture },     // give access to skybox top texture
  },
  vertexShader: document.getElementById( 'myVertShader' ).textContent,
  fragmentShader: document.getElementById( 'potterFragShader' ).textContent
} );

tv = new THREE.Mesh(tvGeometry, tvMaterial);
tv.position.x = -5;
tv.position.z = -20;

scene.add(tv);

///////////////////////////////////////////////////////////////////////
//   sphere, representing the light
///////////////////////////////////////////////////////////////////////

sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);    // radius, segments, segments
lightSphere = new THREE.Mesh(sphereGeometry, basicMaterial);
lightSphere.position.set(0,4,-5);
lightSphere.position.set(light.position.x, light.position.y, light.position.z);
scene.add(lightSphere);

/////////////////////////////////////////////////////////////////////////
// holey-shaded torus
/////////////////////////////////////////////////////////////////////////

// parameters:   radius of torus, diameter of tube, segments around radius, segments around torus
torusGeometry = new THREE.TorusGeometry( 1.2, 0.4, 10, 20 );
torus1 = new THREE.Mesh( torusGeometry, holeyMaterial);
torus1.position.set(-5, 3.6, -3);   // translation
torus1.rotation.set(0,0,0);     // rotation about x,y,z axes
scene.add( torus1 );

/////////////////////////////////////////////////////////////////////////
// toon-shaded torus
/////////////////////////////////////////////////////////////////////////

// parameters:   radius of torus, diameter of tube, segments around radius, segments around torus
torusGeometry = new THREE.TorusGeometry( 1.6, 0.5, 10, 20 );
torus = new THREE.Mesh( torusGeometry, toonMaterial);
torus.position.set(0, 5, 0);   // translation
torus.rotation.set(0,0,0);     // rotation about x,y,z axes
scene.add( torus );

/////////////////////////////////////
// MIRROR:  square patch on the ground
/////////////////////////////////////

mirrorGeometry = new THREE.PlaneBufferGeometry(4,4);
mirror = new THREE.Mesh(mirrorGeometry, rainMaterial);
mirror.position.x = 4.0;
mirror.position.z = 5.0;
mirror.position.y = -1.0;
mirror.rotation.x = -Math.PI / 2;
scene.add(mirror);

/////////////////////////////////////
//  CUSTOM OBJECT
////////////////////////////////////

var geom = new THREE.Geometry();
var v0 = new THREE.Vector3(0,0,0);
var v1 = new THREE.Vector3(3,0,0);
var v2 = new THREE.Vector3(0,3,0);
var v3 = new THREE.Vector3(3,3,0);

geom.vertices.push(v0);
geom.vertices.push(v1);
geom.vertices.push(v2);
geom.vertices.push(v3);

geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
geom.faces.push( new THREE.Face3( 1, 3, 2 ) );
geom.computeFaceNormals();

customObject = new THREE.Mesh( geom, myBumpMaterial );
customObject.position.set(2.2, 0, 0);
scene.add(customObject);

/////////////////////////////////////////////////////////////////////////
// sphere
/////////////////////////////////////////////////////////////////////////

sphereA = new THREE.Mesh( new THREE.SphereGeometry( 2, 20, 10 ), envmapMaterial );
sphereA.position.set(0,0,0);
scene.add( sphereA );

/////////////////////////////////////////////////////////////////////////
// sphere B
/////////////////////////////////////////////////////////////////////////
sphereB = new THREE.Mesh( new THREE.IcosahedronGeometry( 1, 4 ),
                          creativeMaterial
                          );
sphereB.position.set(-5, 3.6, -3);
scene.add(sphereB);

/////////////////////////////////////////////////////////////////////////
// sphere
/////////////////////////////////////////////////////////////////////////

sphereC = new THREE.Mesh( new THREE.SphereGeometry( 1, 20, 10 ), perlinMaterial );
sphereC.position.set(0,5,0);
scene.add( sphereC );

/////////////////////////////////////////////////////////////////////////////////////
//  ARMADILLO
/////////////////////////////////////////////////////////////////////////////////////

var manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) {
  console.log( item, loaded, total );
};
var armadilloTexture = rainMaterial;
//var armadilloTexture = diffuseMaterial;
var onProgress = function ( xhr ) {
  if ( xhr.lengthComputable ) {
    var percentComplete = xhr.loaded / xhr.total * 100;
    console.log( Math.round(percentComplete, 2) + '% downloaded' );
  }
};
var onError = function ( xhr ) {
};
var loader = new THREE.OBJLoader( manager );
loader.load( 'obj/armadillo.obj', function ( object ) {
  object.traverse( function ( child ) {
    if ( child instanceof THREE.Mesh ) {
      child.material = armadilloTexture;
    }
  } );
  scene.add( object );
        object.scale.set(2,2,2);
        object.position.x = -5;
        object.position.y = 1;
}, onProgress, onError );

var cooper;

loader.load( 'obj/minicooper.obj', function ( object ) {
  object.traverse( function ( child ) {
    if ( child instanceof THREE.Mesh ) {
      child.material = armadilloTexture;
    }
  } );
  scene.add( object );
        object.scale.set(0.03,0.03,0.03);
        object.position.x = 0;
        object.position.y = 4;
        object.position.z = -20;
        object.rotation.x = -Math.PI/2;
        //object.rotation.z = Math.PI;
        cooper = object;
}, onProgress, onError );

///////////////////////////////////////////////////////////////////////////////////////
// LISTEN TO KEYBOARD
///////////////////////////////////////////////////////////////////////////////////////

var keyboard = new THREEx.KeyboardState();
function checkKeyboard() {
  if (keyboard.pressed("W")) {
    console.log('W pressed');
    light.position.y += 0.1;
  } else if (keyboard.pressed("S"))
    light.position.y -= 0.1;
  if (keyboard.pressed("A"))
    light.position.x -= 0.1;
  else if (keyboard.pressed("D"))
    light.position.x += 0.1;
  if (keyboard.pressed("R")) {
    rain = !rain;
  }
  lightSphere.position.set(light.position.x, light.position.y, light.position.z);

  // compute light position in VCS coords,  supply this to the shaders
  vcsLight.set(light.position.x, light.position.y, light.position.z);
  vcsLight.applyMatrix4(camera.matrixWorldInverse);

  myBumpMaterial.uniforms.lightPosition.value = vcsLight;
  myBumpMaterial.uniforms.lightPosition.value.needsUpdate = true;
  toonMaterial.uniforms.lightPosition.value = vcsLight;
  toonMaterial.uniforms.lightPosition.value.needsUpdate = true;
  holeyMaterial.uniforms.lightPosition.value = vcsLight;
  holeyMaterial.uniforms.lightPosition.value.needsUpdate = true;
  envmapMaterial.uniforms.lightPosition.value = vcsLight;
  envmapMaterial.uniforms.lightPosition.value.needsUpdate = true;
  rainMaterial.uniforms.lightPosition.value = vcsLight;
  rainMaterial.uniforms.lightPosition.value.needsUpdate = true;
}

///////////////////////////////////////////////////////////////////////////////////////
// UPDATE CALLBACK
///////////////////////////////////////////////////////////////////////////////////////
ballGeometry = new THREE.SphereGeometry( 0.12 );
function firework(sec) {
    const NUM_BALLS = 400;
    for (let i = 0; i < balls.length; i++) {
        const x = balls[i].x0 + balls[i].t * balls[i].vx;
        const y = balls[i].y0 + balls[i].t * balls[i].vy;
        const z = balls[i].z0 + balls[i].t * balls[i].vz;
        if ( Math.abs(x) > 20 || Math.abs(y) > 20 || Math.abs(z) > 20 ) {
            const x0 = 0;
            const y0 = 5;
            const z0 = 0;
            balls[i].x0 = x0;
            balls[i].y0 = y0;
            balls[i].z0 = z0;
            balls[i].position.set(x0, y0, z0);
            balls[i].t = 0.0;
        } else {
            balls[i].position.set(x,y,z);
            balls[i].t += sec;
        }
    }
    if (balls.length < NUM_BALLS) {
        for (let i = 0; i < 2; i++) {
            var ball = new THREE.Mesh( ballGeometry, rainMaterial );
            ball.vx = (Math.random() - 0.5) * 6;
            ball.vy = (Math.random() - 0.5) * 6;
            ball.vz = (Math.random() - 0.5) * 6;
            const x0 = 0;
            const y0 = 5;
            const z0 = 0;
            ball.x0 = x0;
            ball.y0 = y0;
            ball.z0 = z0;
            ball.position.set(x0, y0, z0);
            ball.t = 0.0;
            balls.push( ball );
            scene.add( ball );
        }
    }
}

var tickHarry = 0;

function update() {
  checkKeyboard();
  requestAnimationFrame(update);
  if (rain) {
    firework(0.02);
  }
  envmapMaterial.uniforms.matrixWorld.value = camera.matrixWorld;
  envmapMaterial.uniforms.matrixWorld.update = true;
  rainMaterial.uniforms.matrixWorld.value = camera.matrixWorld;
  rainMaterial.uniforms.matrixWorld.update = true;
  var t = 0.00025 * ( Date.now() - start );
  creativeMaterial.uniforms[ 'time' ].value = t;
  floorMaterial.uniforms[ 'time' ].value = t;
  perlinMaterial.uniforms[ 'time' ].value = t;
  torus1.rotation.z = t;
  cooper.position.z = cooper.position.z + 0.8*t;
  if (cooper.position.z > 0) {
    rain = true;
  }
  tickHarry++;
  var flipHarry = (tickHarry === 100);
  if (flipHarry) {
    choose1 = !choose1;
    envmapMaterial.uniforms.myPotterTexture.value = choose1 ? potterTexture : hp2Texture;
    envmapMaterial.uniforms.myPotterTexture.update = true;
    tvMaterial.uniforms.myTexture.value = choose1 ? hp2Texture : potterTexture;
    tvMaterial.uniforms.myTexture.update = true;
    flipHarry = false;
    tickHarry = 0;
  }
  renderer.render(scene, camera);
}

update();

