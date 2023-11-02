
import {  BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, SphereGeometry, Vector3, WebGLRenderer } from 'three/src/Three.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
// import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'

// const recastdetourjs = require('recastdetourjs')

const scene = new Scene()

const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.z = 5

const renderer = new WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

new OrbitControls(camera, renderer.domElement)

const geometry = new BoxGeometry()
const material = new MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
})

const cube = new Mesh(geometry, material)
scene.add(cube)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

// Import the Recast module
// import Recast from './your-recast-module'; // Replace with the actual import path

function animate() {
    requestAnimationFrame(animate)

    cube.rotation.x += 0.01
    cube.rotation.y += 0.01

    render()
}

function render() {
    renderer.render(scene, camera)
}

animate()