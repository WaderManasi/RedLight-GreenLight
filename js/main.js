const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

renderer.setClearColor(0xb7c3f3,1);
// colorCode , opacity

const light = new THREE.AmbientLight( 0xffffff,1 ); // soft white light
scene.add( light );

//global variables
const startPosition = 3
const endPosition = -3

function createCube(size,positionX, rotateY){
    const geometry = new THREE.BoxGeometry(size.w,size.h,size.d);
    const material = new THREE.MeshBasicMaterial( { color: 0x979f81 } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = positionX;
    cube.rotation.y = rotateY
    scene.add( cube );
}

camera.position.z = 5;

// creating a new GLTFLoader model
const loader = new THREE.GLTFLoader();

class Doll{
    constructor(){
        // load the model
        loader.load("../models/scene.gltf", (gltf)=>{
            scene.add(gltf.scene);
            gltf.scene.scale.set(.4,.4,.4)
            gltf.scene.position.set(0,-1,0);
            this.doll = gltf.scene;
            //animate();
        })
    }
    lookBack(){
        //old style of animating: this.doll.rotation.y = -3
        
        // using gsap animation
        gsap.to(this.doll.rotation,{y:-3, duration:.55})  //time in millis
    }
    lookFront(){
        //old style of animating: this.doll.rotation.y = 0
        
        //smooth animation using gsap
        gsap.to(this.doll.rotation,{y:0, duration:.3})   
    }
}

function createTrack(){
    createCube({w:.2,h:1.5,d:1},startPosition,.45)
    createCube({w:.2,h:1.5,d:1},endPosition,-.45)
}
createTrack()
// creating new object
let doll = new Doll();

setTimeout(()=>{
    doll.lookBack()
},1000)

function animate(){
    renderer.render(scene,camera);
    /* code sequence doesnt matter */

    /* rotating the cube through Y axis i.e vertically */
    //cube.rotation.z += 0.01;

    /* rotating the cube through Y axis i.e vertically */
    //cube.rotation.x += 0.01;

    /* rotating the cube through X axis i.e horizontally */
    //cube.rotation.y += 0.01;

    requestAnimationFrame(animate);
}
animate();

// To make it responsive
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
}