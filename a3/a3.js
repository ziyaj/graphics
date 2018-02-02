/////////////////////////////////////////////////////////////////////////////////////////
//  UBC CPSC 314,  Vjan2018
//  Assignment Template
//  Ziyang Jin
/////////////////////////////////////////////////////////////////////////////////////////

var backwardsMotion = 1;

// SETUP RENDERER & SCENE
var canvas = document.getElementById('canvas');
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
var camera;
var cameraFov = 30;     // initial camera vertical field of view, in degrees

renderer.setClearColor(0xd0f0d0); // set background colour
canvas.appendChild(renderer.domElement);

// SCROLLBAR FUNCTION DISABLE
window.onscroll = function () {
     window.scrollTo(0,0);
   }

// ADAPT TO WINDOW RESIZE
function resize() {
  console.log('resize called');
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
}

var animation = true;
var aniTime = 0.0;

var light;
var torus;
var worldFrame;
var sphere;
var box;
var mcc;
var floor;
var cylinder;
var cone;
var customObject;
var laserLine;
var models;

// mydino : dino dino
const BODY_WIDTH = 1.5;
const BODY_HEIGHT = 2.5;
const BODY_DEPTH = 1.5;
const HEAD_SIZE = BODY_WIDTH/1.2;
var head;
var eyeCircle;
var leftEye;
var rightEye;
var topMouth;
var botMouth;
var tongue;
var neck;
var body;
var hip;
var leftArm;
var rightArm;
var leftClaw;
var rightClaw;
var leftHand;
var rightHand;
var leftLeg;
var rightLeg;
var leftLeg2;
var rightLeg2;
var leftLeg3;
var rightLeg3;
var leftFoot;
var rightFoot;
var leftToe;
var rightToe;
var tail1;
var tail2;
var tail3;
var tail4;
var tail5;

var loadingManager = null;
var RESOURCES_LOADED = false;

////////////////////////////////////////////////////////////
// Keyframe   and   KFobj  classes
////////////////////////////////////////////////////////////

class Keyframe {
  constructor(name, time, avars) {
    this.name = name;
    this.time = time;
    this.avars = avars;
  }
}

class KFobj {
  constructor(setMatricesFunc) {
    this.keyFrameArray = [];          // list of keyframes
    this.maxTime = 0.0;               // time of last keyframe
    this.currTime = 0.0;              // current playback time
    this.setMatricesFunc = setMatricesFunc;    // function to call to update transformation matrices
  };
  reset() {                     // go back to first keyframe
    this.currTime = 0.0;
  };
  add(keyframe) {               // add a new keyframe at end of list
    this.keyFrameArray.push(keyframe);
    if (keyframe.time > this.maxTime)
      this.maxTime = keyframe.time;
  };
  timestep(dt) {                //  take a time-step;  loop to beginning if at end
    this.currTime += dt;
    if (this.currTime > this.maxTime) {
      this.currTime = 0.0;
    } else if (this.currTime <= 0.0) {
      this.currTime = this.maxTime;
    }
  };
  getAvars() {                  //  compute interpolated values for the current time
    var i = 1;
    while (this.currTime > this.keyFrameArray[i].time)       // find the right pair of keyframes
      i++;
    var avars = [];
    for (var n = 0; n < this.keyFrameArray[i-1].avars.length; n++) {   // interpolate the values
      var y0 = this.keyFrameArray[i-1].avars[n];
      var y1 = this.keyFrameArray[i].avars[n];
      var x0 = this.keyFrameArray[i-1].time;
      var x1 = this.keyFrameArray[i].time;
      var x = this.currTime;
      var y = y0 + (y1-y0)*(x-x0)/(x1-x0);    // linearly interpolate
      avars.push(y);
    }
    return avars;         // return list of interpolated avars
  };
}

////////////////////////////////////////////////////////////////////////
// setup animated objects
////////////////////////////////////////////////////////////////////////

// keyframes for the detailed T-rex:   name, time, [x, y, z]
const JUMP_HIGHER = 4;
var trexKFobj = new KFobj(trexSetMatrices);     
trexKFobj.add(new Keyframe('rest pose', 0.0, [0, 1.9, 0]));
trexKFobj.add(new Keyframe('rest pose', 1.0, [1, 1.9, 0]));
trexKFobj.add(new Keyframe('rest pose', 2.0, [1, 2.9 + JUMP_HIGHER, 0]));
trexKFobj.add(new Keyframe('rest pose', 3.0, [0, 2.9 + JUMP_HIGHER, 0]));
trexKFobj.add(new Keyframe('rest pose', 4.0, [0, 1.9, 0]));

// basic interpolation test
console.log('kf 0.1 = ',trexKFobj.getAvars(0.1));    // interpolate for t=0.1
console.log('kf 2.9 = ',trexKFobj.getAvars(2.9));    // interpolate for t=2.9

// keyframes for mydino:    name, time, [x, y, theta1, theta2]
const OUTER_ANGLE = 20;
const INNER_ANGLE = 10;
const DIV = 2 * Math.PI / 12;
var mydinoKFobj = new KFobj(mydinoSetMatrices);
mydinoKFobj.add(new Keyframe('rest pose', 0.0, [1*DIV, 1,   OUTER_ANGLE, -OUTER_ANGLE]));
mydinoKFobj.add(new Keyframe('rest pose', 0.5, [2*DIV, 1.8, INNER_ANGLE, -INNER_ANGLE]));
mydinoKFobj.add(new Keyframe('rest pose', 1.0, [3*DIV, 1.8, -INNER_ANGLE, INNER_ANGLE]));
mydinoKFobj.add(new Keyframe('rest pose', 1.5, [4*DIV, 1,   -OUTER_ANGLE, OUTER_ANGLE]));
mydinoKFobj.add(new Keyframe('rest pose', 2.0, [5*DIV, 1.8, -INNER_ANGLE, INNER_ANGLE]));
mydinoKFobj.add(new Keyframe('rest pose', 2.5, [6*DIV, 1.8, INNER_ANGLE, -INNER_ANGLE]));
mydinoKFobj.add(new Keyframe('rest pose', 3.0, [7*DIV, 1,   OUTER_ANGLE, -OUTER_ANGLE]));
mydinoKFobj.add(new Keyframe('rest pose', 3.5, [8*DIV, 1,   INNER_ANGLE, -INNER_ANGLE]));
mydinoKFobj.add(new Keyframe('rest pose', 4.0, [9*DIV, 1,   -INNER_ANGLE, INNER_ANGLE]));
mydinoKFobj.add(new Keyframe('rest pose', 4.5, [10*DIV, 1,   -OUTER_ANGLE, OUTER_ANGLE]));
mydinoKFobj.add(new Keyframe('rest pose', 5.0, [11*DIV, 1,   -INNER_ANGLE, INNER_ANGLE]));
mydinoKFobj.add(new Keyframe('rest pose', 5.5, [12*DIV, 1,   INNER_ANGLE, -INNER_ANGLE]));
mydinoKFobj.add(new Keyframe('rest pose', 6.0, [13*DIV, 1,   OUTER_ANGLE, -OUTER_ANGLE]));

var minicooperKFobj = new KFobj(myCooperSetMatrices);
minicooperKFobj.add(new Keyframe('rest pose', 0.0, [-DIV, 1,   OUTER_ANGLE, -OUTER_ANGLE]));
minicooperKFobj.add(new Keyframe('rest pose', 0.5, [0, 1.8, INNER_ANGLE, -INNER_ANGLE]));
minicooperKFobj.add(new Keyframe('rest pose', 1.0, [1*DIV, 1.8, -INNER_ANGLE, INNER_ANGLE]));
minicooperKFobj.add(new Keyframe('rest pose', 1.5, [2*DIV, 1,   -OUTER_ANGLE, OUTER_ANGLE]));
minicooperKFobj.add(new Keyframe('rest pose', 2.0, [3*DIV, 1.8, -INNER_ANGLE, INNER_ANGLE]));
minicooperKFobj.add(new Keyframe('rest pose', 2.5, [4*DIV, 1.8, INNER_ANGLE, -INNER_ANGLE]));
minicooperKFobj.add(new Keyframe('rest pose', 3.0, [5*DIV, 1,   OUTER_ANGLE, -OUTER_ANGLE]));
minicooperKFobj.add(new Keyframe('rest pose', 3.5, [6*DIV, 1,   INNER_ANGLE, -INNER_ANGLE]));
minicooperKFobj.add(new Keyframe('rest pose', 4.0, [7*DIV, 1,   -INNER_ANGLE, INNER_ANGLE]));
minicooperKFobj.add(new Keyframe('rest pose', 4.5, [8*DIV, 1,   -OUTER_ANGLE, OUTER_ANGLE]));
minicooperKFobj.add(new Keyframe('rest pose', 5.0, [9*DIV, 1,   -INNER_ANGLE, INNER_ANGLE]));
minicooperKFobj.add(new Keyframe('rest pose', 5.5, [10*DIV, 1,   INNER_ANGLE, -INNER_ANGLE]));
minicooperKFobj.add(new Keyframe('rest pose', 6.0, [11*DIV, 1,   OUTER_ANGLE, -OUTER_ANGLE]));

var mytrexKFobj = new KFobj(mytrexSetMatrices);
mytrexKFobj.add(new Keyframe('rest pose', 0.0, [-3*DIV, 1,   OUTER_ANGLE, -OUTER_ANGLE]));
mytrexKFobj.add(new Keyframe('rest pose', 0.5, [-2*DIV, 1.8, INNER_ANGLE, -INNER_ANGLE]));
mytrexKFobj.add(new Keyframe('rest pose', 1.0, [-1*DIV, 1.8, -INNER_ANGLE, INNER_ANGLE]));
mytrexKFobj.add(new Keyframe('rest pose', 1.5, [0*DIV, 1,   -OUTER_ANGLE, OUTER_ANGLE]));
mytrexKFobj.add(new Keyframe('rest pose', 2.0, [1*DIV, 1.8, -INNER_ANGLE, INNER_ANGLE]));
mytrexKFobj.add(new Keyframe('rest pose', 2.5, [2*DIV, 1.8, INNER_ANGLE, -INNER_ANGLE]));
mytrexKFobj.add(new Keyframe('rest pose', 3.0, [3*DIV, 1,   OUTER_ANGLE, -OUTER_ANGLE]));
mytrexKFobj.add(new Keyframe('rest pose', 3.5, [4*DIV, 1,   INNER_ANGLE, -INNER_ANGLE]));
mytrexKFobj.add(new Keyframe('rest pose', 4.0, [5*DIV, 1,   -INNER_ANGLE, INNER_ANGLE]));
mytrexKFobj.add(new Keyframe('rest pose', 4.5, [6*DIV, 1,   -OUTER_ANGLE, OUTER_ANGLE]));
mytrexKFobj.add(new Keyframe('rest pose', 5.0, [7*DIV, 1,   -INNER_ANGLE, INNER_ANGLE]));
mytrexKFobj.add(new Keyframe('rest pose', 5.5, [8*DIV, 1,   INNER_ANGLE, -INNER_ANGLE]));
mytrexKFobj.add(new Keyframe('rest pose', 6.0, [9*DIV, 1,   OUTER_ANGLE, -OUTER_ANGLE]));

// optional:   allow avar indexing by name
// i.e., instead of   avar[1]    one can also use:    avar[ trexIndex["y"]]  
var trexIndex = {"x":0, "y":1, "z":2};   Object.freeze(trexIndex);

/////////////////////////////////////////////////////////////////////////////////////
// MATERIALS:  global scope within this file
/////////////////////////////////////////////////////////////////////////////////////

var diffuseMaterial;
var diffuseMaterialB;
var diffuseMaterial2;
var basicMaterial;
var normalShaderMaterial;
var dinoMaterial;
var dinoEyeMaterial;
var dinoToeMaterial;
var floorMaterial;
var shaderFiles;

dinoTongueMaterial = new THREE.MeshLambertMaterial( {color: 0xff0000} );
dinoToeMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff} );
dinoEyeMaterial = new THREE.MeshLambertMaterial( {color: 0x000000} );
dinoGreenMaterial = new THREE.MeshLambertMaterial( {color: 0x4fff4f} );
laserLineMaterial = new THREE.LineBasicMaterial( {color: 0xff0000} );
diffuseMaterial = new THREE.MeshLambertMaterial( {color: 0x7f7fff} );
diffuseMaterialB = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.BackSide} );
diffuseMaterial2 = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
basicMaterial = new THREE.MeshBasicMaterial( {color: 0xff0000} );

floorTexture = new THREE.ImageUtils.loadTexture('images/floor.jpg');
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(1, 1);
floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });

// CUSTOM SHADERS
shaderFiles = [ 'glsl/armadillo.vs.glsl', 'glsl/armadillo.fs.glsl' ];
normalShaderMaterial = new THREE.ShaderMaterial();
normalShaderMaterial.side = THREE.BackSide;      // dino has the vertex normals pointing inwards!

new THREE.SourceLoader().load( shaderFiles, function(shaders) {
  normalShaderMaterial.vertexShader = shaders['glsl/armadillo.vs.glsl'];
  normalShaderMaterial.fragmentShader = shaders['glsl/armadillo.fs.glsl'];
})

var meshes = {};   // Meshes index

////////////////////////////////////////////////////////////////////////  
// init():  setup up scene
////////////////////////////////////////////////////////////////////////  

function init() {
    console.log('init called');

    initCamera();
    initLights();
    initObjects();
    initFileObjects();
};

//////////////////////////////////////////////////////////
//  initCamera():   SETUP CAMERA
//////////////////////////////////////////////////////////

function initCamera() {

    // set up M_proj    (internally:  camera.projectionMatrix )
    camera = new THREE.PerspectiveCamera(cameraFov, 1, 0.1, 1000); // view angle, aspect ratio, near, far

    // set up M_view:   (internally:  camera.matrixWorldInverse )
    camera.position.set(0, 12, 20);
    camera.up = new THREE.Vector3(0, 1, 0);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    // SETUP ORBIT CONTROLS OF THE CAMERA
    var controls = new THREE.OrbitControls(camera);
    controls.damping = 0.2;
    controls.autoRotate = false;
};

////////////////////////////////////////////////////////////////////////  
// initLights():  SETUP LIGHTS
////////////////////////////////////////////////////////////////////////  

function initLights() {
    light = new THREE.PointLight(0xffffff);
    light.position.set(0, 4, 20);
    scene.add(light);
    ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);
};

////////////////////////////////////////////////////////////////////////  
// initObjects():  setup up scene
////////////////////////////////////////////////////////////////////////  

function initObjects() {

    // // torus
    // torusGeometry = new THREE.TorusGeometry( 1, 0.4, 10, 20 );
    // torus = new THREE.Mesh( torusGeometry, diffuseMaterial );
    // torus.position.set(6, 1.2, -8);   // translation
    // torus.rotation.set(0, 0, 0);      // rotation about x,y,z axes
    // scene.add( torus );

    // sphere representing light source
    sphereGeometry = new THREE.SphereGeometry( 0.3, 32, 32 );    // radius, segments, segments
    sphere = new THREE.Mesh( sphereGeometry, basicMaterial );    
    sphere.position.set(0, 4, 2);
    sphere.position.set(light.position.x, light.position.y, light.position.z);
    scene.add( sphere );

    // world-frame axes
    worldFrame = new THREE.AxisHelper(5) ;
    scene.add( worldFrame );

    // // box
    // boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );    // width, height, depth
    // box = new THREE.Mesh( boxGeometry, diffuseMaterial );
    // box.position.set(-6, 0.5, -8);
    // scene.add( box );
    
    // floor
    floorGeometry = new THREE.PlaneBufferGeometry( 20, 20 );
    floor = new THREE.Mesh( floorGeometry, floorMaterial );
    floor.position.y = 0;
    floor.rotation.x = Math.PI / 2;
    scene.add( floor );

    // // cylinder
    // cylinderGeometry = new THREE.CylinderGeometry( 0.30, 0.30, 1, 20, 4 );
    // cylinder = new THREE.Mesh( cylinderGeometry, diffuseMaterial );
    // scene.add( cylinder );
    // cylinder.matrixAutoUpdate = true;
    // cylinder.position.set(2, 0.5, -8);

    // //  mcc:  multi-colour cube     [https://stemkoski.github.io/Three.js/HelloWorld.html] 
    // var cubeMaterialArray = [];    // one material for each side of cube;  order: x+,x-,y+,y-,z+,z-
    // cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xff3333 } ) );
    // cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xff8800 } ) );
    // cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xffff33 } ) );
    // cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x33ff33 } ) );
    // cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x3333ff } ) );
    // cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x8833ff } ) );
    // var mccMaterials = new THREE.MeshFaceMaterial( cubeMaterialArray );
    // var mccGeometry = new THREE.BoxGeometry( 1, 1, 1, 1, 1, 1 );   // xyzz size,  xyz # segs
    // mcc = new THREE.Mesh( mccGeometry, mccMaterials );   // 
    // mcc.position.set(-4, 0.5, -8);
    // scene.add( mcc ); 
    
    // // cone
    // coneGeometry = new THREE.CylinderGeometry( 0.0, 0.50, 1, 20, 4 ); // rTop, rBot, h, #rsegs, #hsegs
    // cone = new THREE.Mesh( coneGeometry, diffuseMaterial );
    // cone.position.set(-2, 0.5, -8);
    // scene.add( cone );

    // //  CUSTOM OBJECT
    // var geom = new THREE.Geometry(); 
    // var v0 = new THREE.Vector3(0, 0, 0);
    // var v1 = new THREE.Vector3(3, 0, 0);
    // var v2 = new THREE.Vector3(0, 3, 0);
    // var v3 = new THREE.Vector3(3, 3, 0);
    // geom.vertices.push(v0);
    // geom.vertices.push(v1);
    // geom.vertices.push(v2);
    // geom.vertices.push(v3);
    // geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
    // geom.faces.push( new THREE.Face3( 1, 3, 2 ) );
    // geom.computeFaceNormals();
    // customObject = new THREE.Mesh( geom, diffuseMaterial2 );
    // customObject.position.set(0, 0, -10);
    // scene.add( customObject );

    // laser line
    var geom = new THREE.Geometry(); 
    var vL0 = new THREE.Vector3(0, 0, 0);
    var vL1 = new THREE.Vector3(5, 5, 5);
    // use three line segments to give it thickness
    geom.vertices.push( new THREE.Vector3(0+0.00, 0+0.00, 0+0.00) );
    geom.vertices.push( new THREE.Vector3(5+0.00, 5+0.00, 5+0.00) );
    geom.vertices.push( new THREE.Vector3(0+0.02, 0+0.00, 0+0.00) );
    geom.vertices.push( new THREE.Vector3(5+0.02, 5+0.00, 5+0.00) );
    geom.vertices.push( new THREE.Vector3(0+0.00, 0+0.02, 0+0.00) );
    geom.vertices.push( new THREE.Vector3(5+0.00, 5+0.02, 5+0.00) );
    laserLine = new THREE.Line( geom, laserLineMaterial );
    scene.add( laserLine );

    // body
    tail1Geometry = new THREE.CylinderGeometry( BODY_WIDTH/3, BODY_WIDTH/4, BODY_WIDTH );
    tail2Geometry = new THREE.CylinderGeometry( BODY_WIDTH/4, BODY_WIDTH/5, BODY_WIDTH/2 );
    tail3Geometry = new THREE.CylinderGeometry( BODY_WIDTH/5, BODY_WIDTH/6, BODY_WIDTH/2 );
    tail4Geometry = new THREE.CylinderGeometry( BODY_WIDTH/6, BODY_WIDTH/10, BODY_WIDTH/2 );
    tail5Geometry = new THREE.CylinderGeometry( BODY_WIDTH/10, BODY_WIDTH/18, BODY_WIDTH/2 );
    eyeCircleGeometry = new THREE.CylinderGeometry( HEAD_SIZE/8, HEAD_SIZE/8, 1.1 * HEAD_SIZE );
    eyeGeometry = new THREE.SphereGeometry( HEAD_SIZE/13 );
    hipGeometry = new THREE.CylinderGeometry( BODY_WIDTH/2, BODY_WIDTH/2, BODY_WIDTH );
    armGeometry = new THREE.BoxGeometry( BODY_WIDTH/6, BODY_HEIGHT/3, BODY_WIDTH/6 );
    clawGeometry = new THREE.BoxGeometry( BODY_WIDTH/6, BODY_HEIGHT/6, BODY_WIDTH/6 );
    handGeometry = new THREE.BoxGeometry( BODY_WIDTH/6, BODY_WIDTH/6, BODY_WIDTH/6 );
    bodyGeometry = new THREE.BoxGeometry( BODY_WIDTH, BODY_HEIGHT, BODY_DEPTH );    // width, height, depth
    legGeometry = new THREE.BoxGeometry( BODY_WIDTH/1.8, BODY_WIDTH/1.2, BODY_WIDTH/1.8 );    // width, height, depth
    leg2Geometry = new THREE.BoxGeometry( BODY_WIDTH/2.3, BODY_WIDTH/1.6, BODY_WIDTH/2.3 );
    leg3Geometry = new THREE.BoxGeometry( BODY_WIDTH/2.8, BODY_WIDTH/2, BODY_WIDTH/2.8 );
    footGeometry = new THREE.BoxGeometry( BODY_WIDTH/5.6, BODY_WIDTH/2, BODY_WIDTH/2.8 );
    toeGeometry = new THREE.BoxGeometry( BODY_WIDTH/5.6, BODY_WIDTH/8, BODY_WIDTH/2.8 );
    headGeometry = new THREE.BoxGeometry( HEAD_SIZE, HEAD_SIZE, HEAD_SIZE );
    topMouthGeometry = new THREE.BoxGeometry( HEAD_SIZE/3, 1.5 * HEAD_SIZE, HEAD_SIZE/1.1 );
    botMouthGeometry = new THREE.BoxGeometry( HEAD_SIZE/4, 1.5 * HEAD_SIZE, HEAD_SIZE/1.2 );
    tongueGeometry = new THREE.BoxGeometry( HEAD_SIZE/15, 1.4 * HEAD_SIZE, HEAD_SIZE/2 );
    neckGeometry = new THREE.BoxGeometry( 1, 2, 1 );
    tail1 = new THREE.Mesh( tail1Geometry, dinoGreenMaterial );
    tail2 = new THREE.Mesh( tail2Geometry, dinoGreenMaterial );
    tail3 = new THREE.Mesh( tail3Geometry, dinoGreenMaterial );
    tail4 = new THREE.Mesh( tail4Geometry, dinoGreenMaterial );
    tail5 = new THREE.Mesh( tail5Geometry, dinoGreenMaterial );
    eyeCircle = new THREE.Mesh( eyeCircleGeometry, dinoToeMaterial );
    leftEye = new THREE.Mesh( eyeGeometry, dinoEyeMaterial );
    rightEye = new THREE.Mesh( eyeGeometry, dinoEyeMaterial );
    head = new THREE.Mesh( headGeometry, dinoGreenMaterial );
    topMouth = new THREE.Mesh( topMouthGeometry, dinoGreenMaterial );
    botMouth = new THREE.Mesh( botMouthGeometry, dinoGreenMaterial );
    tongue = new THREE.Mesh( tongueGeometry, dinoTongueMaterial );
    leftArm = new THREE.Mesh( armGeometry, dinoGreenMaterial );
    rightArm = new THREE.Mesh( armGeometry, dinoGreenMaterial );
    leftClaw = new THREE.Mesh( clawGeometry, dinoGreenMaterial );
    rightClaw = new THREE.Mesh( clawGeometry, dinoGreenMaterial );
    leftHand = new THREE.Mesh( handGeometry, dinoToeMaterial );
    rightHand = new THREE.Mesh( handGeometry, dinoToeMaterial );
    hip = new THREE.Mesh( hipGeometry, dinoGreenMaterial );
    neck = new THREE.Mesh( neckGeometry, dinoGreenMaterial );
    body = new THREE.Mesh( bodyGeometry, dinoGreenMaterial );
    leftLeg = new THREE.Mesh( legGeometry, dinoGreenMaterial );
    rightLeg = new THREE.Mesh( legGeometry, dinoGreenMaterial );
    leftLeg2 = new THREE.Mesh( leg2Geometry, dinoGreenMaterial );
    rightLeg2 = new THREE.Mesh( leg2Geometry, dinoGreenMaterial );
    leftLeg3 = new THREE.Mesh( leg3Geometry, dinoGreenMaterial );
    rightLeg3 = new THREE.Mesh( leg3Geometry, dinoGreenMaterial );
    leftFoot = new THREE.Mesh( footGeometry, dinoGreenMaterial );
    rightFoot = new THREE.Mesh( footGeometry, dinoGreenMaterial );
    leftToe = new THREE.Mesh( toeGeometry, dinoToeMaterial );
    rightToe = new THREE.Mesh( toeGeometry, dinoToeMaterial );
    scene.add( tail1 );
    scene.add( tail2 );
    scene.add( tail3 );
    scene.add( tail4 );
    scene.add( tail5 );
    scene.add( head );
    scene.add( topMouth );
    scene.add( botMouth );
    scene.add( tongue );
    scene.add( eyeCircle );
    scene.add( leftEye );
    scene.add( rightEye );
    scene.add( leftArm );
    scene.add( rightArm );
    scene.add( leftClaw );
    scene.add( rightClaw );
    scene.add( leftHand );
    scene.add( rightHand );
    scene.add( hip );
    scene.add( neck );
    scene.add( body );
    scene.add( leftLeg );
    scene.add( rightLeg );
    scene.add( leftLeg2 );
    scene.add( rightLeg2 );
    scene.add( leftLeg3 );
    scene.add( rightLeg3 );
    scene.add( leftFoot );
    scene.add( rightFoot );
    scene.add( leftToe );
    scene.add( rightToe );
}

////////////////////////////////////////////////////////////////////////  
// initFileObjects():    read object data from OBJ files;  see onResourcesLoaded() for instances
////////////////////////////////////////////////////////////////////////  

function initFileObjects() {

  // Models index
  models = {
    // bunny: { obj:"obj/bunny.obj", mtl: diffuseMaterial, mesh: null },
    // teapot: { obj:"obj/teapot.obj", mtl: diffuseMaterial, mesh: null },
    // armadillo: { obj:"obj/armadillo.obj", mtl: diffuseMaterial, mesh: null },
    //  horse: {obj:"obj/horse.obj", mtl: diffuseMaterial, mesh: null },
    minicooper: { obj:"obj/minicooper.obj", mtl: diffuseMaterial, mesh: null },
    trex: { obj:"obj/trex.obj", mtl: normalShaderMaterial, mesh: null },
    //  dragon: {obj:"obj/dragon.obj", mtl: diffuseMaterial, mesh: null }
  };

  // Object loader
  loadingManager = new THREE.LoadingManager();
  loadingManager.onProgress = function(item, loaded, total) {
    console.log(item, loaded, total);
  };
  loadingManager.onLoad = function() {
    console.log("loaded all resources");
    RESOURCES_LOADED = true;
    onResourcesLoaded();
  };

  // Load models;  asynchronous in JS, so wrap code in a fn and pass it the index
  for (var _key in models) {
    console.log('Key:', _key);
    (function(key) {
      var objLoader = new THREE.OBJLoader(loadingManager);
      objLoader.load(models[key].obj, function(mesh) {
        mesh.traverse(function(node) {
          if (node instanceof THREE.Mesh) {
            node.material = models[key].mtl;
            node.material.shading = THREE.SmoothShading;
          }
        });
        models[key].mesh = mesh;
      });
    })(_key);
  }
}

///////////////////////////////////////////////////////////////////////////////////////
// LISTEN TO KEYBOARD
///////////////////////////////////////////////////////////////////////////////////////

var keyboard = new THREEx.KeyboardState();
function checkKeyboard() {
  if (keyboard.pressed(" ")) {
    animation = !animation;           // toggle animation on or off
  } else if (keyboard.pressed("r")) {
    console.log('Reset!');
    trexKFobj.reset();
    mydinoKFobj.reset();
    minicooperKFobj.reset();
    mytrexKFobj.reset();
  } else if (keyboard.pressed("o")) {
    camera.fov += 0.5;
    camera.updateProjectionMatrix();  // get three.js to recopute   M_proj
  } else if (keyboard.pressed("p")) {
    camera.fov -= 0.5;
    camera.updateProjectionMatrix();  // get three.js to recompute  M_proj
  } else if (keyboard.pressed("l")) {
    laserLine.visible = !laserLine.visible;
  } else if (keyboard.pressed("b")) {
    // play the motion backwards in time
    backwardsMotion = - backwardsMotion;
  }
}

///////////////////////////////////////////////////////////////////////////////////////
// UPDATE CALLBACK
///////////////////////////////////////////////////////////////////////////////////////

function update() {
  checkKeyboard();

  if (!RESOURCES_LOADED) {       // wait until all OBJs are loaded
    requestAnimationFrame(update);
    return;        
  }

  /////////// animated objects ////////////////

  if (animation) {       //   update the current time of objects if  animation = true
    const sec = backwardsMotion * 0.02;
    trexKFobj.timestep(sec);               // the big dino
    mydinoKFobj.timestep(sec);             // the blocky walking figure, your hierarchy
    minicooperKFobj.timestep(sec);
    mytrexKFobj.timestep(sec);
    aniTime += sec;                        // update global time
  }

  var trexAvars = trexKFobj.getAvars();       // interpolate avars
  trexKFobj.setMatricesFunc(trexAvars);       // compute object-to-world matrices

  var mydinoAvars = mydinoKFobj.getAvars();   // interpolate avars
  mydinoKFobj.setMatricesFunc(mydinoAvars);   // compute object-to-world matrices

  var myCooperAvars = minicooperKFobj.getAvars();
  minicooperKFobj.setMatricesFunc(myCooperAvars);

  var mytrexAvars = mytrexKFobj.getAvars();
  mytrexKFobj.setMatricesFunc(mytrexAvars);

  laserUpdate();

  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

///////////////////////////////////////////////////////////////////////////////////////
//  laserUpdate()
///////////////////////////////////////////////////////////////////////////////////////

function laserUpdate() {

  var trexEyeLocal = new THREE.Vector3(0, 1.2, -1.9);
  var trex2 = meshes["trex2"];                                   //   reference to the Object
  var trexEyeWorld = trexEyeLocal.applyMatrix4(trex2.matrix);    // this computes  trex2.matrix * trexEyeLocal (with h=1)

  var cooperLocal = new THREE.Vector3(30, 0, 0);
  var cooper1 = meshes["minicooper1"];
  var cooperWorld = cooperLocal.applyMatrix4(cooper1.matrix);

  var mydinoLocal = new THREE.Vector3(-1, 0, 0);
  var mydino = body;
  var mydinoWorld = mydinoLocal.applyMatrix4(body.matrix);

  var offset = [ new THREE.Vector3(0,0,0), new THREE.Vector3(0.02,0,0), new THREE.Vector3(0,0.02,0) ];
  for (var n = 0; n < 3; n++) {            // laserLine consists of three line segements, slightly offset (more visible)
    laserLine.geometry.vertices[n*2].x = cooperWorld.x + offset[n].x;
    laserLine.geometry.vertices[n*2].y = cooperWorld.y + offset[n].y;
    laserLine.geometry.vertices[n*2].z = cooperWorld.z + offset[n].z;

    laserLine.geometry.vertices[n*2+1].x = mydinoWorld.x + offset[n].x;
    laserLine.geometry.vertices[n*2+1].y = mydinoWorld.y + offset[n].y;
    laserLine.geometry.vertices[n*2+1].z = mydinoWorld.z + offset[n].z;
  }
  laserLine.geometry.verticesNeedUpdate = true;

}

///////////////////////////////////////////////////////////////////////////////////////
// trexSetMatrices(avars)
///////////////////////////////////////////////////////////////////////////////////////

function trexSetMatrices(avars) {
  var trex2 = meshes["trex2"];        //   reference to the Object

  trex2.matrixAutoUpdate = false;     // tell three.js not to over-write our updates
  trex2.matrix.identity();              
  trex2.matrix.multiply(new THREE.Matrix4().makeTranslation(avars[0], avars[1], avars[2]));  
  trex2.matrix.multiply(new THREE.Matrix4().makeRotationY(-Math.PI/2));
  trex2.matrix.multiply(new THREE.Matrix4().makeScale(1.5, 1.5, 1.5));
  trex2.updateMatrixWorld();
}

///////////////////////////////////////////////////////////////////////////////////////
// myCooperSetMatrices(avars)
///////////////////////////////////////////////////////////////////////////////////////
function myCooperSetMatrices(avars) {
    const cooper = meshes["minicooper1"];
    const RADIUS = 6.8;

    cooper.matrixAutoUpdate = false;
    cooper.matrix.identity();
    cooper.matrix.multiply(new THREE.Matrix4().makeTranslation(RADIUS * Math.cos(avars[0]), 0, RADIUS * Math.sin(avars[0])));
    cooper.matrix.multiply(new THREE.Matrix4().makeRotationY(-avars[0]));
    cooper.matrix.multiply(new THREE.Matrix4().makeRotationX(-Math.PI/2));
    cooper.matrix.multiply(new THREE.Matrix4().makeScale(0.025, 0.025, 0.025));
    cooper.updateMatrixWorld();
}

function mytrexSetMatrices(avars) {
    const trex1 = meshes["trex1"];
    const RADIUS = 6.8;

    trex1.matrixAutoUpdate = false;
    trex1.matrix.identity();
    trex1.matrix.multiply(new THREE.Matrix4().makeTranslation(RADIUS * Math.cos(avars[0]), 2, RADIUS * Math.sin(avars[0])));
    trex1.matrix.multiply(new THREE.Matrix4().makeRotationY(-avars[0] + Math.PI));
    trex1.matrix.multiply(new THREE.Matrix4().makeScale(1.5, 1.5, 1.5));
    trex1.updateMatrixWorld();    
}

///////////////////////////////////////////////////////////////////////////////////////
// mydinoSetMatrices(avars)
///////////////////////////////////////////////////////////////////////////////////////

function mydinoSetMatrices(avars) {

  const BODY_CLINE = -Math.PI/6;
  const RADIUS = 7;
  body.matrixAutoUpdate = false;
  body.matrix.identity();                // root of the hierarchy
  body.matrix.multiply(new THREE.Matrix4().makeTranslation(RADIUS * Math.cos(avars[0]), avars[1] + 2.6, RADIUS * Math.sin(avars[0])));    // translate body-center up
  body.matrix.multiply(new THREE.Matrix4().makeRotationY(-avars[0] + 3*Math.PI/2));
  body.matrix.multiply(new THREE.Matrix4().makeRotationZ(BODY_CLINE));
  body.updateMatrixWorld();

  // arm common
  const ARM_X = BODY_WIDTH/2;
  const ARM_Y = BODY_HEIGHT/8;
  const ARM_Z = -BODY_WIDTH/1.7;
  const CLAW_ANGLE = Math.PI/2;
  const CLAW_X = -BODY_WIDTH/4;
  const CLAW_Y = -BODY_HEIGHT/8;
  // left arm
  leftArm.matrixAutoUpdate = false;
  leftArm.matrix.copy(body.matrix);
  leftArm.matrix.multiply(new THREE.Matrix4().makeTranslation(ARM_X, ARM_Y, -ARM_Z));
  leftArm.matrix.multiply(new THREE.Matrix4().makeRotationZ(BODY_CLINE + Math.PI/2 + avars[2] * Math.PI/90));
  leftArm.updateMatrixWorld();
  // right arm
  rightArm.matrixAutoUpdate = false;
  rightArm.matrix.copy(body.matrix);
  rightArm.matrix.multiply(new THREE.Matrix4().makeTranslation(ARM_X, ARM_Y, ARM_Z));
  rightArm.matrix.multiply(new THREE.Matrix4().makeRotationZ(BODY_CLINE + Math.PI/2 + avars[3] * Math.PI/90));
  rightArm.updateMatrixWorld();
  // left claw
  leftClaw.matrixAutoUpdate = false;
  leftClaw.matrix.copy(leftArm.matrix);
  leftClaw.matrix.multiply(new THREE.Matrix4().makeRotationZ(CLAW_ANGLE));
  leftClaw.matrix.multiply(new THREE.Matrix4().makeTranslation(CLAW_X, CLAW_Y, 0));
  leftClaw.updateMatrixWorld();
  // right claw
  rightClaw.matrixAutoUpdate = false;
  rightClaw.matrix.copy(rightArm.matrix);
  rightClaw.matrix.multiply(new THREE.Matrix4().makeRotationZ(CLAW_ANGLE));
  rightClaw.matrix.multiply(new THREE.Matrix4().makeTranslation(CLAW_X, CLAW_Y, 0));
  rightClaw.updateMatrixWorld();
  // left hand
  leftHand.matrixAutoUpdate = false;
  leftHand.matrix.copy(leftClaw.matrix);
  leftHand.matrix.multiply(new THREE.Matrix4().makeTranslation(0, CLAW_Y, 0));
  leftHand.updateMatrixWorld();
  // left hand
  rightHand.matrixAutoUpdate = false;
  rightHand.matrix.copy(rightClaw.matrix);
  rightHand.matrix.multiply(new THREE.Matrix4().makeTranslation(0, CLAW_Y, 0));
  rightHand.updateMatrixWorld();

  hip.matrixAutoUpdate = false;
  hip.matrix.copy(body.matrix);
  hip.matrix.multiply(new THREE.Matrix4().makeTranslation(0, -BODY_HEIGHT/2, 0));
  hip.matrix.multiply(new THREE.Matrix4().makeRotationX(Math.PI/2));
  hip.updateMatrixWorld();

  tail1.matrixAutoUpdate = false;
  tail1.matrix.copy(hip.matrix);
  tail1.matrix.multiply(new THREE.Matrix4().makeRotationX(-Math.PI/2));
  tail1.matrix.multiply(new THREE.Matrix4().makeRotationY(avars[2] * Math.PI/250));
  tail1.matrix.multiply(new THREE.Matrix4().makeRotationZ(-Math.PI/3 + avars[2] * Math.PI/360));
  tail1.matrix.multiply(new THREE.Matrix4().makeTranslation(0, -BODY_HEIGHT/3, 0));
  tail1.updateMatrixWorld();

  tail2.matrixAutoUpdate = false;
  tail2.matrix.copy(tail1.matrix);
  tail2.matrix.multiply(new THREE.Matrix4().makeRotationY(avars[2] * Math.PI/200));
  tail2.matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI/5 + avars[2] * Math.PI/300));
  tail2.matrix.multiply(new THREE.Matrix4().makeTranslation(-BODY_HEIGHT/7, -BODY_HEIGHT/3.5, 0));
  tail2.updateMatrixWorld();

  tail3.matrixAutoUpdate = false;
  tail3.matrix.copy(tail2.matrix);
  tail3.matrix.multiply(new THREE.Matrix4().makeRotationY(avars[2] * Math.PI/150));
  //tail3.matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI/10 + avars[2] * Math.PI/360));
  tail3.matrix.multiply(new THREE.Matrix4().makeTranslation(-BODY_HEIGHT/20, -BODY_HEIGHT/4, 0));
  tail3.updateMatrixWorld();

  tail4.matrixAutoUpdate = false;
  tail4.matrix.copy(tail3.matrix);
  tail4.matrix.multiply(new THREE.Matrix4().makeRotationY(avars[2] * Math.PI/100));
  //tail4.matrix.multiply(new THREE.Matrix4().makeRotationZ(-Math.PI/10 + avars[2] * Math.PI/360));
  tail4.matrix.multiply(new THREE.Matrix4().makeTranslation(BODY_HEIGHT/30, -BODY_HEIGHT/4, 0));
  tail4.updateMatrixWorld();

  tail5.matrixAutoUpdate = false;
  tail5.matrix.copy(tail4.matrix);
  tail5.matrix.multiply(new THREE.Matrix4().makeRotationY(avars[2] * Math.PI/50));
  //tail5.matrix.multiply(new THREE.Matrix4().makeRotationZ(-Math.PI/10 + avars[2] * Math.PI/360));
  tail5.matrix.multiply(new THREE.Matrix4().makeTranslation(BODY_HEIGHT/30, -BODY_HEIGHT/4, 0));
  tail5.updateMatrixWorld();

  neck.matrixAutoUpdate = false;
  neck.matrix.copy(body.matrix);
  neck.matrix.multiply(new THREE.Matrix4().makeTranslation(BODY_WIDTH/4, BODY_HEIGHT/1.5, 0));
  neck.matrix.multiply(new THREE.Matrix4().makeRotationZ(-Math.PI/6 + avars[2] * Math.PI/240));
  neck.updateMatrixWorld();

  // head
  head.matrixAutoUpdate = false;
  head.matrix.copy(neck.matrix);
  head.matrix.multiply(new THREE.Matrix4().makeTranslation(-BODY_WIDTH/8, 1, 0)); // translate to head
  head.matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI/3)); // rotate about head
  head.matrix.multiply(new THREE.Matrix4().makeRotationY(avars[2] * Math.PI/120));
  head.updateMatrixWorld();

  topMouth.matrixAutoUpdate = false;
  topMouth.matrix.copy(head.matrix);
  topMouth.matrix.multiply(new THREE.Matrix4().makeRotationZ(-Math.PI/2));
  topMouth.matrix.multiply(new THREE.Matrix4().makeTranslation(-HEAD_SIZE/8, HEAD_SIZE/2, 0));
  topMouth.updateMatrixWorld();

  botMouth.matrixAutoUpdate = false;
  botMouth.matrix.copy(head.matrix);
  botMouth.matrix.multiply(new THREE.Matrix4().makeRotationZ(-Math.PI/1.5 + avars[2] * Math.PI/360));
  botMouth.matrix.multiply(new THREE.Matrix4().makeTranslation(0, HEAD_SIZE/2, 0));
  botMouth.updateMatrixWorld();

  tongue.matrixAutoUpdate = false;
  tongue.matrix.copy(head.matrix);
  tongue.matrix.multiply(new THREE.Matrix4().makeRotationZ(-Math.PI/1.7 + avars[2] * Math.PI/360));
  tongue.matrix.multiply(new THREE.Matrix4().makeTranslation(0, HEAD_SIZE/2, 0));
  tongue.updateMatrixWorld();

  // eyes
  const EYE_X = HEAD_SIZE/4;
  const EYE_Y = HEAD_SIZE/4;
  const EYE_Z = HEAD_SIZE/2;
  eyeCircle.matrixAutoUpdate = false;
  eyeCircle.matrix.copy(head.matrix);
  eyeCircle.matrix.multiply(new THREE.Matrix4().makeTranslation(EYE_X, EYE_Y, 0));
  eyeCircle.matrix.multiply(new THREE.Matrix4().makeRotationX(Math.PI/2));
  eyeCircle.updateMatrixWorld();

  leftEye.matrixAutoUpdate = false;
  leftEye.matrix.copy(head.matrix);
  leftEye.matrix.multiply(new THREE.Matrix4().makeTranslation(EYE_X, EYE_Y, -EYE_Z));
  leftEye.updateMatrixWorld();
  rightEye.matrixAutoUpdate = false;
  rightEye.matrix.copy(head.matrix);
  rightEye.matrix.multiply(new THREE.Matrix4().makeTranslation(EYE_X, EYE_Y, EYE_Z));
  rightEye.updateMatrixWorld();

  // legs
  const LEG_ANGLE = - 2.4 * BODY_CLINE;
  const LEG2_ANGLE = -Math.PI/2.8;
  const LEG2_X = BODY_WIDTH/4;
  const LEG2_Y = -BODY_WIDTH/2;
  const LEG3_ANGLE = Math.PI/8;
  const LEG3_X = -BODY_WIDTH/8;
  const LEG3_Y = -BODY_WIDTH/2;
  const FOOT_X = -BODY_WIDTH/4;
  const FOOT_Y = -BODY_WIDTH/8;
  const TOE_Y = -(BODY_WIDTH/4 + BODY_WIDTH/16);
  leftLeg.matrixAutoUpdate = false;
  leftLeg.matrix.copy(hip.matrix);      // start with the parent's matrix
  leftLeg.matrix.multiply(new THREE.Matrix4().makeRotationX(-Math.PI/2));
  leftLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0, 0, -BODY_WIDTH/3));     // translate to hip
  leftLeg.matrix.multiply(new THREE.Matrix4().makeRotationZ(LEG_ANGLE + avars[2] * Math.PI/180));  // rotate about hip
  leftLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0, -1, 0));            // translate to center of upper leg
  leftLeg.updateMatrixWorld();

  leftLeg2.matrixAutoUpdate = false;
  leftLeg2.matrix.copy(leftLeg.matrix);
  leftLeg2.matrix.multiply(new THREE.Matrix4().makeRotationZ(LEG2_ANGLE));
  leftLeg2.matrix.multiply(new THREE.Matrix4().makeTranslation(LEG2_X, LEG2_Y, 0));
  leftLeg2.updateMatrixWorld();

  leftLeg3.matrixAutoUpdate = false;
  leftLeg3.matrix.copy(leftLeg2.matrix);
  leftLeg3.matrix.multiply(new THREE.Matrix4().makeRotationZ(LEG3_ANGLE));
  leftLeg3.matrix.multiply(new THREE.Matrix4().makeTranslation(LEG3_X, LEG3_Y, 0));
  leftLeg3.updateMatrixWorld();

  leftFoot.matrixAutoUpdate = false;
  leftFoot.matrix.copy(leftLeg3.matrix);
  leftFoot.matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI/2));
  leftFoot.matrix.multiply(new THREE.Matrix4().makeTranslation(FOOT_X, FOOT_Y, 0));
  leftFoot.updateMatrixWorld();

  leftToe.matrixAutoUpdate = false;
  leftToe.matrix.copy(leftFoot.matrix);
  leftToe.matrix.multiply(new THREE.Matrix4().makeTranslation(0, TOE_Y, 0));
  leftToe.updateMatrixWorld();

  rightLeg.matrixAutoUpdate = false;
  rightLeg.matrix.copy(hip.matrix);     // start with the parent's matrix
  rightLeg.matrix.multiply(new THREE.Matrix4().makeRotationX(-Math.PI/2));
  rightLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0, 0, BODY_WIDTH/3));      // translate to hip
  rightLeg.matrix.multiply(new THREE.Matrix4().makeRotationZ(LEG_ANGLE + avars[3] * Math.PI/180));  // rotate about hip
  rightLeg.matrix.multiply(new THREE.Matrix4().makeTranslation(0, -1, 0));            // translate to center of upper leg
  rightLeg.updateMatrixWorld();

  rightLeg2.matrixAutoUpdate = false;
  rightLeg2.matrix.copy(rightLeg.matrix);
  rightLeg2.matrix.multiply(new THREE.Matrix4().makeRotationZ(LEG2_ANGLE));
  rightLeg2.matrix.multiply(new THREE.Matrix4().makeTranslation(LEG2_X, LEG2_Y, 0));
  rightLeg2.updateMatrixWorld();

  rightLeg3.matrixAutoUpdate = false;
  rightLeg3.matrix.copy(rightLeg2.matrix);
  rightLeg3.matrix.multiply(new THREE.Matrix4().makeRotationZ(LEG3_ANGLE));
  rightLeg3.matrix.multiply(new THREE.Matrix4().makeTranslation(LEG3_X, LEG3_Y, 0));
  rightLeg3.updateMatrixWorld();

  rightFoot.matrixAutoUpdate = false;
  rightFoot.matrix.copy(rightLeg3.matrix);
  rightFoot.matrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI/2));
  rightFoot.matrix.multiply(new THREE.Matrix4().makeTranslation(FOOT_X, FOOT_Y, 0));
  rightFoot.updateMatrixWorld();

  rightToe.matrixAutoUpdate = false;
  rightToe.matrix.copy(rightFoot.matrix);
  rightToe.matrix.multiply(new THREE.Matrix4().makeTranslation(0, TOE_Y, 0));
  rightToe.updateMatrixWorld();

}

/////////////////////////////////////////////////////////////////////////////////////
// runs when all resources are loaded
/////////////////////////////////////////////////////////////////////////////////////

function onResourcesLoaded() {

  // Clone models into meshes;   [Michiel:  AFAIK this makes a "shallow" copy of the model,
  //                             i.e., creates references to the geometry, and not full copies ]
  // meshes["armadillo1"] = models.armadillo.mesh.clone();
  // meshes["bunny1"] = models.bunny.mesh.clone();
  // meshes["teapot1"] = models.teapot.mesh.clone();
  meshes["minicooper1"] = models.minicooper.mesh.clone();
  // meshes["minicooper2"] = models.minicooper.mesh.clone();
  meshes["trex1"] = models.trex.mesh.clone();
  meshes["trex2"] = models.trex.mesh.clone();

  // Reposition individual meshes, then add meshes to scene

  // meshes["armadillo1"].position.set(-7, 1.5, 2);
  // meshes["armadillo1"].rotation.set(0, -Math.PI/2, 0);
  // meshes["armadillo1"].scale.set(1.5, 1.5, 1.5);
  // scene.add(meshes["armadillo1"]);

  // meshes["bunny1"].position.set(-5, 0.2, 8);
  // meshes["bunny1"].rotation.set(0, Math.PI, 0);
  // meshes["bunny1"].scale.set(0.8, 0.8, 0.8);
  // scene.add(meshes["bunny1"]);

  // meshes["teapot1"].position.set(3, 0, -6);
  // meshes["teapot1"].scale.set(0.5, 0.5, 0.5);
  // scene.add(meshes["teapot1"]);

  meshes["minicooper1"].position.set(-2, 0, 3);
  meshes["minicooper1"].scale.set(0.025, 0.025, 0.025);
  meshes["minicooper1"].rotation.set(-Math.PI/2, 0, Math.PI/2);
  scene.add(meshes["minicooper1"]);

  // meshes["minicooper2"].position.set(6, 0, 6);
  // meshes["minicooper2"].scale.set(0.025, 0.025, 0.025);
  // meshes["minicooper2"].rotation.set(-Math.PI/2, 0, Math.PI/2);
  // scene.add(meshes["minicooper2"]);

  meshes["trex1"].position.set(-4, 1.90, -2);
  meshes["trex1"].scale.set(1.5, 1.5, 1.5);
  meshes["trex1"].rotation.set(0, -Math.PI/2, 0);
  scene.add(meshes["trex1"]);

  // note:  we will be animating trex2, so these transformations will be overwritten anyhow
  meshes["trex2"].position.set(0, 1.9, 3);
  meshes["trex2"].scale.set(1.5, 1.5, 1.5);
  meshes["trex2"].rotation.set(0, -Math.PI/2, 0);
  scene.add(meshes["trex2"]);
}

// window.onload = init;
init();

window.addEventListener('resize', resize);   // EVENT LISTENER RESIZE
resize();

update();

