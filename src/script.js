import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import Stats from 'stats.js'
import * as dat from 'dat.gui'
import gsap, { clamp } from 'gsap'
import { Camera } from 'three'

/**
 * 
 */
// const stats = new Stats()
// stats.showPanel(0)
// document.body.appendChild(stats.dom)

/**
 * Base
 */

/**
 * Debug
 */
// const gui = new dat.GUI()
const debugObject = {}

 
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
let sceneReady = false
// Wait a little
window.setTimeout(() =>
{
    sceneReady = true
}, 2000)

 const textureLoader = new THREE.TextureLoader()
 const gltfLoader = new GLTFLoader()
 const cubeTextureLoader = new THREE.CubeTextureLoader

/**
 * Update all material
 */
 const updateAllMaterials = () =>
 {
     scene.traverse((child) =>
     {
         if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
         {
            //  child.material.envMap = enviromentMap
             child.material.envMapIntensity = debugObject.envMapIntensity
             child.material.needsUpdate = true
             child.castShadow = true
             child.receiveShadow = false
         }
     })
 }

 /**
 * Enviroment map
 */
const enviromentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/3/px.jpg',
    '/textures/environmentMaps/3/nx.jpg',
    '/textures/environmentMaps/3/py.jpg',
    '/textures/environmentMaps/3/ny.jpg',
    '/textures/environmentMaps/3/pz.jpg',
    '/textures/environmentMaps/3/nz.jpg'
])
enviromentMap.encoding = THREE.sRGBEncoding
scene.environment = enviromentMap

/** Models
 * 
 */
let tl = gsap.timeline()

gltfLoader.load(
    '/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
    (gltf) =>
    {
        // Model
        const mesh = gltf.scene.children[0]
        // mesh.rotation.y = Math.PI * 0.5
        mesh.scale.set(2.5, 2.5, 2.5)
        mesh.position.y = 1
        scene.add(mesh)

        tl.from(mesh.scale, {x: 0.01, y: 0.01, z: 0.01, duration: 2}) 
        tl.to(mesh.rotation, {z: Math.PI * 2, duration: 2}, "-=2 ")
      
    

        // gui
        //     .add(mesh.rotation, 'z')
        //     .min(- Math.PI)
        //     .max(Math.PI)
        //     .step(0.001)
        //     .name('rotation')

        updateAllMaterials()
    }
)

debugObject.envMapIntensity = 5
// gui.add(debugObject, 'envMapIntensity').min(0).max(10).step(0.001).onChange(updateAllMaterials)

/**
 * Point of interest
 */
const raycaster = new THREE.Raycaster()
const points =
[
    {
        position: new THREE.Vector3(2.5, 1.3, - 1.65),
        element: document.querySelector('.point-0')
    },
    {
        position: new THREE.Vector3(0.5, 0.5, 1.8),
        element: document.querySelector('.point-1')
    },
    {
        position: new THREE.Vector3(0, 0, - 2.5),
        element: document.querySelector('.point-3')
    }
]


/** Sizes
    */
    const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
    }

    window.addEventListener('resize', () =>
    {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Update effect composer
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    effectComposer.setSize(sizes.width, sizes.height)

    })

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 7
camera.position.x = 0
camera.position.y = 0


scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true
controls.enablePan = false
controls.enableZoom = true
controls.minDistance = 6
controls.maxDistance = 15
controls.maxPolarAngle = 2
controls.minPolarAngle = 0.5
controls.autoRotate = false
// console.log(controls)


/**
 * Renderer
 */
 const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    // powerPreference: 'high-performance',
    antialias: true,
    alpha: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// gui
//     .add(renderer, 'toneMapping', {
//         No: THREE.NoToneMapping,
//         Linear: THREE.LinearToneMapping,
//         Reinhard: THREE.ReinhardToneMapping,
//         Cineon: THREE.CineonToneMapping,
//         ACESFilmic: THREE.ACESFilmicToneMapping
//     })
//     .onFinishChange(() =>
//     {
//         renderer.toneMapping = Number(renderer.toneMapping)
//         updateAllMaterials()
//     })

// gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001)

/**
 * Post processing
 */

// Render target
const renderTarget = new THREE.WebGLMultisampleRenderTarget(
    800,
    600,
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding
    }
)

// Composer
const effectComposer = new EffectComposer(renderer, renderTarget)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(sizes.width, sizes.height)

// Render pass
const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)

/**
 * Animate
 */
const clock = new THREE.Clock()
// let previousTime = 0

const tick = () =>
{
    // stats.begin()

    const elapsedTime = clock.getElapsedTime()
    // const deltaTime = elapsedTime - previousTime
    // previousTime = elapsedTime

    // Update controls
    controls.update()
    if(sceneReady)
    {
        // Go through each point
        for(const point of points)
        {
            const screenPosition = point.position.clone()
            screenPosition.project(camera)

            raycaster.setFromCamera(screenPosition, camera)
            const intersects = raycaster.intersectObjects(scene.children, true)

            if(intersects.length === 0)
            {
                point.element.classList.add('visible')
            }
            else
            {
                const intersectionDistance = intersects[0].distance
                const poitnDistance = point.position.distanceTo(camera.position)
                if(intersectionDistance < poitnDistance)
                {point.element.classList.remove('visible')}
                else
                {
                    point.element.classList.add('visible')
                }
            }
            

            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = - screenPosition.y * sizes.height * 0.5
            point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
        }
    }

    // Render
    // renderer.render(scene, camera)
    effectComposer.render()

 

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    // stats.end()
}

tick()

renderer.shadowMap.autoUpdate = false
// renderer.shadowMap.needsUpdate = true