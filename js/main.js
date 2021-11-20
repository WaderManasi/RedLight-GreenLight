const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

renderer.setClearColor(0xb7c3f3,1);
// colorCode , opacity

const light = new THREE.AmbientLight( 0xffffff,1 ); // soft white light
scene.add( light );

//new

// const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.3 );
// directionalLight.castShadow = true
// scene.add( directionalLight )
// directionalLight.position.set( 0, 1, 1 )

camera.position.z = 5;

// creating a new GLTFLoader model
const loader = new THREE.GLTFLoader();

// All global variables
const startPosition = 6 //3
const endPosition = -startPosition
const text = document.querySelector(".text")
const TIME_LIMIT = 10
const gameStatus = "Get ready.."
let isLookingBack = true

const readyBtn = document.querySelector('.readyBtn')

// music
const previewMusic = new Audio('./music/preview.mp3')
const introMusic = new Audio('./music/headline.mp3')
const greenLight = new Audio('./music/greenLight.mp3')
const redLight = new Audio('./music/redLightF.mp3')
const shot = new Audio('./music/shot.mp3')

function createCube(size,positionX, rotateY=0, color=0xfbc851){
    const geometry = new THREE.BoxGeometry(size.w,size.h,size.d);
    const material = new THREE.MeshBasicMaterial( { color: color } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = positionX;
    cube.rotation.y = rotateY
    scene.add( cube );
    return cube;
}

function delay(ms){
    return new Promise(resolve => setTimeout(resolve,ms));
}

class Doll{
    constructor(){
        // load the model
        loader.load("../models/scene.gltf", (gltf)=>{
            scene.add(gltf.scene);
            gltf.scene.scale.set(.4,.4,.4)
            gltf.scene.position.set(0,-1,0);
            this.doll = gltf.scene;
            previewMusic.play();
            //animate();
        })
    }

    // Methods 
    lookBack(){
        redLight.play();
        //old style of animating: this.doll.rotation.y = -3
        
        // using gsap animation
        gsap.to(this.doll.rotation,{y:-3, duration:.45})  //time in millis
        setTimeout(()=>{
            isLookingBack = true
        },150)
    }
    lookFront(){
        greenLight.play();
        //old style of animating: this.doll.rotation.y = 0
        
        //smooth animation using gsap
        gsap.to(this.doll.rotation,{y:0, duration:.3})
        
        setTimeout(()=>{
            isLookingBack = false
        },
        450)  
    }

    // random back & front movement in random delay time
    async start(){
        this.lookBack();
        await delay((Math.random * 1000)+1000);
        this.lookFront();
        await delay((Math.random * 750)+750);
        this.start();
    }
    stop(){
        this.lookFront();
    }
    check(){
        if(this.playerInfo.velocity>0 && !isLookingBack){
            //alert('You Lose!')
            text.innerText = "You Lose!"
            gameStatus = "over"
            previewMusic.play();
        }    
        if(this.playerInfo.positionX < endPosition+.4){
            //alert('You Win!')
            text.innerText = "You Win!"
            gameStatus = "over"
            previewMusic.play();
        }
    }
}

function createTrack(){
    createCube({w:startPosition*2,h:1.5,d:1},0,0,0xe5a716).position.z = -.8
    createCube({w:.2,h:1.5,d:1},startPosition,.35)
    createCube({w:.2,h:1.5,d:1},endPosition,-.35)
}
createTrack();

class Player{
    constructor(){
        const geometry = new THREE.SphereGeometry( .3, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.z = 1;
        sphere.position.x = startPosition;
        scene.add( sphere );
        this.player = sphere;
        this.playerInfo = {
            positionX: startPosition,
            velocity: 0
        }
    }
    run(){
        this.playerInfo.velocity = .03
    }
    stop(){
        this.playerInfo.velocity = 0
    }
    update(){
        this.playerInfo.positionX -= this.playerInfo.velocity;
        this.player.position.x = this.playerInfo.positionX;
    }
}

// creating new object
const player = new Player();
let doll = new Doll();


// Initial
async function init(){
    previewMusic.pause();
    introMusic.play();
    await delay(1100)
    text.innerText = "Starting in 3"
    await delay(1100)
    text.innerText = "Starting in 2"
    await delay(1100)
    text.innerText = "Starting in 1"
    await delay(1500)
    text.innerText = "Go!"
    startGame();
}
function startGame(){
    gameStatus="started"
    let progress = createCube({w:5,h:.1,d:1},0)
    progress.position.y=3.5
    gsap.to(progress.scale,{x:0,duration:TIME_LIMIT})
    doll.start()
    setTimeout(()=>{
        if(gameStatus != "over"){
            text.innerText = "You ran out of time"
        }
    },TIME_LIMIT*1000)
}
// if(document.getElementById('readyBtn').clicked == true){
//     init()
// }

readyBtn.addEventListener('click',()=>{
    if(readyBtn.innerText == "Understood!.. Ready to Play!"){
        init();
        document.querySelector('.modal').style.display="none";
    }
})

function animate(){
    if(gameStatus == "over")    return
    renderer.render(scene,camera);
    /* code sequence doesnt matter */

    /* rotating the cube through Y axis i.e vertically */
    //cube.rotation.z += 0.01;

    /* rotating the cube through Y axis i.e vertically */
    //cube.rotation.x += 0.01;

    /* rotating the cube through X axis i.e horizontally */
    //cube.rotation.y += 0.01;
    requestAnimationFrame(animate);
    player.update();
}
animate();

// To make it responsive
window.addEventListener('resize',onWindowResize,false)
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener('keydown',(e)=>{
    if(gameStatus != "started")     return;

    if(e.key == "ArrowUp"){
        player.run()
    }
    // if(e.key == "ArrowDown"){
    //     player.stop()
    // }
})
window.addEventListener('keyup',(e)=>{
    if(e.key == "ArrowUp"){
        player.stop()
    }
    // if(e.key == "ArrowDown"){
    //     player.stop()
    // }
})