
import { CrowdHelper, NavMeshHelper, threeToSoloNavMesh } from '@recast-navigation/three';
import { Crowd, NavMeshQuery, init } from 'recast-navigation';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineBasicMaterial, BoxGeometry, Color, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, Vector2, Vector3, WebGLRenderer, ConeGeometry, Raycaster } from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

await init();

const scene = new Scene();

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 5);

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const ground = new Mesh(
    new PlaneGeometry(10, 10),
    new MeshBasicMaterial({ color: 0x808080 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

//adding some obsicles in the scene
const box = new Mesh(
    new BoxGeometry(),
    new MeshBasicMaterial({ color: 0xff0000 })
);
box.position.set(0, 0.5, 0);
scene.add(box);

const box2 = new Mesh(
    new BoxGeometry(),
    new MeshBasicMaterial({ color: 0x00ff00 })
);
box2.position.set(3, 0.5, 0);
scene.add(box2);

const cone= new Mesh(
    new ConeGeometry(),
    new MeshBasicMaterial({ color: 0x00ffff })
);
cone.position.set(-2,0.5,2);
scene.add(cone)

//////////////////////


window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

const meshes: Mesh[] = [];
scene.traverse((child) => {
    if (child instanceof Mesh) {
        meshes.push(child);
    }
});

const { success, navMesh } = threeToSoloNavMesh(meshes, {
    cs: 0.2,
    ch: 0.1,
    walkableSlopeAngle: 35,
    walkableHeight: 1,
    walkableClimb: 1,
    walkableRadius: 1,
    maxEdgeLen: 12,
    maxSimplificationError: 1.3,
    minRegionArea: 8,
    mergeRegionArea: 20,
    maxVertsPerPoly: 6,
    detailSampleDist: 6,
    detailSampleMaxError: 1,
});

if (!success) {
    throw new Error('Failed to generate navmesh');
}

const navMeshHelper = new NavMeshHelper({
    navMesh,
    navMeshMaterial: new MeshBasicMaterial({
        color: 'blue',
        // wireframe: true,
    }),
});

scene.add(navMeshHelper);
navMeshHelper.update();

const navMeshQuery = new NavMeshQuery({ navMesh });
// create a crowd
const maxAgents = 1;
const maxAgentsRadius = 0.5;
const crowd = new Crowd({ maxAgents, maxAgentRadius: maxAgentsRadius, navMesh });

// create the interface to create the agents
// const initialAgentPosition = navMeshQuery.getRandomPointAround(
//     { x: 0, y: 0, z: 0 }, 
//     1 
//   );

const agent = crowd.addAgent(new Vector3(0,0,1), {
    radius: 0.2,
    height: 0.2,
    maxAcceleration: 5,
    maxSpeed:2,
    collisionQueryRange: 0.5,
    pathOptimizationRange: 0.0,
    separationWeight: 1.0,
});

const cubeGeometry = new BoxGeometry(0.2, 0.2,0.2);
const cubeMaterial = new MeshBasicMaterial({ color: 'red' });
const cube = new Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 0.1, 1);
scene.add(cube);


//crowd helper
const crowdHelper = new CrowdHelper({ crowd });
// scene.add(crowdHelper);
crowdHelper.update();


// Add a click event listener to the document
document.addEventListener('click', onClick);
const raycaster = new Raycaster();
let mouse = new Vector2();
let intersection = new Vector3();
let path;
let line: Line2;

function onClick(event: MouseEvent) {
    // Calculate the normalized device coordinates (NDC) of the click position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    console.log(mouse);
    raycaster.setFromCamera( mouse, camera );
    const intersects = raycaster.intersectObjects(scene.children, true);
    console.log(intersects);

//     // Check if there is any intersection
    if (intersects.length > 0) {
        // Get the first intersection point
        intersection = intersects[0].point;

        // Perform your desired actions with the intersection point
        // For example, update the agent's target position
        path = navMeshQuery.computePath(
            cube.position,
             navMeshQuery.getClosestPoint(intersection)
         );
         if (line) {
            scene.remove(line);
        }
         const pathLine = new LineGeometry();
         pathLine.setPositions(path.map((p) => [p.x, p.y, p.z]).flat());
        line = new Line2(pathLine, new LineMaterial({ color: 0xff0000, linewidth: 0.5, resolution: new Vector2(window.innerWidth, window.innerHeight) }));
         scene.add(line);
        agent.goto(intersection);
        
    }
}

// const tempVector3= navMeshQuery.getClosestPoint(intersection)
// make a line to show the path


// agent.goto(tempVector3);


const dt = 1 / 60;
crowd.timeStep=dt;



function animate() {
    requestAnimationFrame(animate);
    crowd.update(dt); // Update the crowd each frame
    // console.log(agent.state());
    // console.log(agent.velocity());

    cube.position.copy(agent.position()as Vector3);
    crowdHelper.update();
    controls.update();
   
    render();

}

function render() {
    renderer.render(scene, camera);
}

animate();












































// import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/Addons.js'
// import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
// import Stats from 'three/examples/jsm/libs/stats.module.js'
// // const recastdetourjs = require('recastdetourjs')



// const scene = new THREE.Scene()
// scene.add(new THREE.AxesHelper(5))

// const camera = new THREE.PerspectiveCamera(
//     75,
//     window.innerWidth / window.innerHeight,
//     0.1,
//     1000
// )
// camera.position.x = 4
// camera.position.y = 4
// camera.position.z = 4

// const renderer = new THREE.WebGLRenderer()
// renderer.setSize(window.innerWidth, window.innerHeight)
// document.body.appendChild(renderer.domElement)

// const controls = new OrbitControls(camera, renderer.domElement)
// controls.target.set(8, 0, 0)

// const light1 = new THREE.PointLight(0xffffff, 400)
// light1.position.set(10, 10, 10)
// scene.add(light1)

// const light2 = new THREE.PointLight(0xffffff, 400)
// light2.position.set(-10, 10, 10)
// scene.add(light2)

// const object1 = new THREE.Mesh(
//     new THREE.SphereGeometry(),
//     new THREE.MeshPhongMaterial({ color: 0xff0000 })
// )
// object1.position.set(4, 0, 0)
// scene.add(object1)
// object1.add(new THREE.AxesHelper(5))

// const object2 = new THREE.Mesh(
//     new THREE.SphereGeometry(),
//     new THREE.MeshPhongMaterial({ color: 0x00ff00 })
// )
// object2.position.set(4, 0, 0)
// object1.add(object2)
// object2.add(new THREE.AxesHelper(5))

// const object3 = new THREE.Mesh(
//     new THREE.SphereGeometry(),
//     new THREE.MeshPhongMaterial({ color: 0x0000ff })
// )
// object3.position.set(4, 0, 0)
// object2.add(object3)
// object3.add(new THREE.AxesHelper(5))

// window.addEventListener('resize', onWindowResize, false)
// function onWindowResize() {
//     camera.aspect = window.innerWidth / window.innerHeight
//     camera.updateProjectionMatrix()
//     renderer.setSize(window.innerWidth, window.innerHeight)
//     render()
// }

// // const gui = new GUI()
// // const object1Folder = gui.addFolder('Object1')
// // object1Folder.add(object1.position, 'x', 0, 10, 0.01).name('X Position')
// // object1Folder
// //     .add(object1.rotation, 'x', 0, Math.PI * 2, 0.01)
// //     .name('X Rotation')
// // object1Folder.add(object1.scale, 'x', 0, 2, 0.01).name('X Scale')
// // object1Folder.open()
// // const object2Folder = gui.addFolder('Object2')
// // object2Folder.add(object2.position, 'x', 0, 10, 0.01).name('X Position')
// // object2Folder
// //     .add(object2.rotation, 'x', 0, Math.PI * 2, 0.01)
// //     .name('X Rotation')
// // object2Folder.add(object2.scale, 'x', 0, 2, 0.01).name('X Scale')
// // object2Folder.open()
// // const object3Folder = gui.addFolder('Object3')
// // object3Folder.add(object3.position, 'x', 0, 10, 0.01).name('X Position')
// // object3Folder
// //     .add(object3.rotation, 'x', 0, Math.PI * 2, 0.01)
// //     .name('X Rotation')
// // object3Folder.add(object3.scale, 'x', 0, 2, 0.01).name('X Scale')
// // object3Folder.open()

// const stats = new Stats()
// document.body.appendChild(stats.dom)

// const debug = document.getElementById('debug1') as HTMLDivElement

// function animate() {
//     requestAnimationFrame(animate)
//     controls.update()
//     render()
//     const object1WorldPosition = new THREE.Vector3()
//     object1.getWorldPosition(object1WorldPosition)
//     const object2WorldPosition = new THREE.Vector3()
//     object2.getWorldPosition(object2WorldPosition)
//     const object3WorldPosition = new THREE.Vector3()
//     object3.getWorldPosition(object3WorldPosition)
//     // debugger
//     // debug.innerText =
//     //     'Red\n' +
//     //     'Local Pos X : ' +
//     //     object1.position.x.toFixed(2) +
//     //     '\n' +
//     //     'World Pos X : ' +
//     //     object1WorldPosition.x.toFixed(2) +
//     //     '\n' +
//     //     '\nGreen\n' +
//     //     'Local Pos X : ' +
//     //     object2.position.x.toFixed(2) +
//     //     '\n' +
//     //     'World Pos X : ' +
//     //     object2WorldPosition.x.toFixed(2) +
//     //     '\n' +
//     //     '\nBlue\n' +
//     //     'Local Pos X : ' +
//     //     object3.position.x.toFixed(2) +
//     //     '\n' +
//     //     'World Pos X : ' +
//     //     object3WorldPosition.x.toFixed(2) +
//     //     '\n';
//     stats.update()
// }

// function render() {
//     renderer.render(scene, camera)
// }

// animate()
