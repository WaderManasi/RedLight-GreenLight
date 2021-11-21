const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

renderer.setClearColor(0xa7c3f0,1);
// colorCode , opacity

const light = new THREE.AmbientLight( 0xffffff,1 ); // soft white light
scene.add( light );

// new
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.3 );
directionalLight.castShadow = true
scene.add( directionalLight )
directionalLight.position.set( 0, 1, 1 )

camera.position.z = 5.2;

// creating a new GLTFLoader model
const loader = new THREE.GLTFLoader();

// All global variables
let flag = true
const startPosition = 4
const endPosition = -startPosition
const text = document.querySelector(".text")
const TIME_LIMIT = 15
let gameStatus = "Get ready.."
let isLookingBack = true
const readyBtn = document.querySelector('.readyBtn')
const startAgain = document.querySelector('.startAgain')

// music
const previewMusic = new Audio('./music/preview.mp3')
const gameOver = new Audio('./music/gameOver.mp3')
const introMusic = new Audio('./music/headline.mp3')
const greenLight = new Audio('./music/greenLight.mp3')
const redLight = new Audio('./music/redLightF.mp3')
const shot = new Audio('./music/shot.mp3')
const endMusic = 0

function createCube(size,positionX, rotateY=0, color=0x709900){
    const geometry = new THREE.BoxGeometry(size.w,size.h,size.d);
    const material = new THREE.MeshBasicMaterial( { color: color } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = positionX;
    cube.rotation.y = rotateY
    scene.add( cube );
    return cube;
}

async function delay(ms){
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
        })
    }
    // Methods 
    lookBack(){
        greenLight.play();
        redLight.pause();

        //old style of animating: this.doll.rotation.y = -3
        
        // new: using gsap animation for smooth effects
        gsap.to(this.doll.rotation,{y:-3, duration:.45})  //time in millis
        setTimeout(()=>{
            isLookingBack = true
        },150)
    }
    lookFront(){
        greenLight.pause();
        redLight.play();

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
        if(!flag)
        return false;
        this.lookBack();
        await delay((Math.random() * 100)+1000);
        this.lookFront();
        await delay((Math.random() * 750)+750);
        this.start();
    }
}

function createTrackToRun(){
    createCube({w:startPosition*2+1,h:1.7,d:1},0,0,0x005900).position.z = -1
    createCube({w:.2,h:1.7,d:1},startPosition,-.35)
    createCube({w:.2,h:1.7,d:1},endPosition,.35)
}
createTrackToRun(); 
let doll = new Doll();


class Player{
    constructor(){
        const geometry = new THREE.SphereGeometry( .3, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.z = .8;
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
    check(){
        if(this.playerInfo.velocity>0 && !isLookingBack){
            //alert('You Lose!')
            flag=false
            text.innerText = "You Lose!"
            gameStatus = "over"
            greenLight.pause();
            redLight.pause();
            gameOver.play();
        }    
        if(this.playerInfo.positionX < endPosition+.4){
            //alert('You Win!')
            flag=false
            greenLight.pause();
            redLight.pause();
            gameOver.play();
            text.innerText = "You Win!🎉"
            gameStatus = "over"
        }
    }
    update(){
        this.check()
        this.playerInfo.positionX -= this.playerInfo.velocity;
        this.player.position.x = this.playerInfo.positionX;
    }
}

// creating new object
const player = new Player();


// Initial
async function initGame(){
    gameOver.pause();
    greenLight.pause();
    redLight.pause();
    previewMusic.pause();
    introMusic.play();
    await delay(1100)
    text.innerText = "Starting in 3"
    await delay(1100)
    text.innerText = "Starting in 2"
    await delay(1100)
    text.innerText = "Starting in 1"
    await delay(1500)
    text.innerText = "Go!⛳"
    startGame();
}

function startGame(){
    gameStatus="started"
    let progress = createCube({w:8,h:.01,d:1},0)
    progress.position.y=3.5
    gsap.to(progress.scale,{x:0,duration:TIME_LIMIT,ease:"none"})
    setTimeout(()=>{
        if(gameStatus != "over"){
            text.innerText = "You ran out of time!⏱"
            greenLight.pause();
            redLight.pause();
            gameStatus="over"
            gameOver.play();
            // startAgain.addEventListener('click',()=>{
            //     if(startAgain.innerText == "Play Again"){
            //         initGame();
            //         document.querySelector('.modal').style.display="none";
            //     }
            // })
        }
    },TIME_LIMIT*1000)
    doll.start()
}

readyBtn.addEventListener('click',()=>{
    if(readyBtn.innerText == "Understood!.. Ready to Play!"){
        initGame();
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

// arrow is pressed
window.addEventListener('keydown',(e)=>{
    if(gameStatus != "started")     return;

    if(e.key == "ArrowUp"){
        player.run()
    }
})

// arrow is released
window.addEventListener('keyup',(e)=>{
    if(e.key == "ArrowUp"){
        player.stop()
    }
})