import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass.js'
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import Stats from 'stats.js'
import * as dat from 'dat.gui'
import { Transform } from 'cannon'
import gsap, { clamp } from 'gsap'
import { Camera } from 'three'

/**
 * 
 */
const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

/**
 * Base
 */

/**
 * Debug
 */
const gui = new dat.GUI()
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
// enviromentMap.castShadow = false
// enviromentMap.receiveShadow = false
// scene.background = enviromentMap
scene.environment = enviromentMap

/**
 * Material
 */

// Textures
//  const mapTexture = textureLoader.load('/models/LeePerrySmith/color.jpg')
//  mapTexture.encoding = THREE.sRGBEncoding
 
//  const normalTexture = textureLoader.load('/models/LeePerrySmith/normal.jpg')

// // Material
// const material = new THREE.MeshStandardMaterial( {
//     map: mapTexture,
//     normalMap: normalTexture
// } )

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
      
    

        gui
            .add(mesh.rotation, 'z')
            .min(- Math.PI)
            .max(Math.PI)
            .step(0.001)
            .name('rotation')

        updateAllMaterials()
    }
)

debugObject.envMapIntensity = 5
gui.add(debugObject, 'envMapIntensity').min(0).max(10).step(0.001).onChange(updateAllMaterials)

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
 * Lights
 */
// // Direction light
// const directionLight = new THREE.DirectionalLight('#ffffff', 3)
// directionLight.position.set(0.25, 2, -2.25)
// directionLight.castShadow = true
// directionLight.shadow.camera.far = 15
// directionLight.shadow.mapSize.set(1024, 1024)
// directionLight.shadow.mormalBias = 0.05

// scene.add(directionLight)

// const directionLightCameraHelper = new THREE.CameraHelper(directionLight.shadow.camera)
// scene.add(directionLightCameraHelper)

// gui.add(directionLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity')
// gui.add(directionLight.position, 'x').min(-5).max(5).step(0.001).name('lightX')
// gui.add(directionLight.position, 'y').min(-5).max(5).step(0.001).name('lightY')
// gui.add(directionLight.position, 'z').min(-5).max(5).step(0.001).name('lightZ')



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
controls.minDistance = 3
controls.maxDistance = 10
controls.maxPolarAngle = 2
controls.minPolarAngle = 0.5
controls.autoRotate = false
console.log(controls)


/**
 * Renderer
 */
 const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    // powerPreference: 'high-performance',
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

gui
    .add(renderer, 'toneMapping', {
        No: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACESFilmic: THREE.ACESFilmicToneMapping
    })
    .onFinishChange(() =>
    {
        renderer.toneMapping = Number(renderer.toneMapping)
        updateAllMaterials()
    })

gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001)

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

// // Dot screen pass
// const dotScreenPass = new DotScreenPass()
// dotScreenPass.enabled = false
// effectComposer.addPass(dotScreenPass)

// // Glitch pass
// const glitchPass = new GlitchPass()
// glitchPass.goWild = false
// glitchPass.enabled = false
// effectComposer.addPass(glitchPass)

// // RGB shift shader
// const rgbShifShader = new ShaderPass(RGBShiftShader)
// rgbShifShader.enabled = false
// effectComposer.addPass(rgbShifShader)

// Unreal bloom pass
// const unrealBloomPass = new UnrealBloomPass()
// unrealBloomPass.strength = 0.3
// unrealBloomPass.radius = 1
// unrealBloomPass.threshold = 0.6
// effectComposer.addPass(unrealBloomPass)

// gui.add(unrealBloomPass, 'enabled')
// gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001)
// gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001)
// gui.add(unrealBloomPass, 'threshold').min(0).max(2).step(0.001)

// // Tint pass
// const TintShader = {
//     uniforms: 
//     {
//         tDiffuse: { value: null },
//         uTint: { value: null }
//     },
//     vertexShader: `
//         varying vec2 vUv;

//         void main()
//         {
//             gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

//             vUv = uv;
//         }
//     `,
//     fragmentShader: `
//         uniform sampler2D tDiffuse;
//         uniform vec3 uTint;

//         varying vec2 vUv;

//         void main()
//         {
//             vec4 color = texture2D(tDiffuse, vUv);
//             color.rgb += uTint;

//             gl_FragColor = color;
//         }
//     `
// }
// const tintPass = new ShaderPass(TintShader)
// tintPass.material.uniforms.uTint.value = new THREE.Vector3()
// effectComposer.addPass(tintPass)

// gui.add(tintPass.material.uniforms.uTint.value, 'x').min(-1).max(1).step(0.001).name('red')
// gui.add(tintPass.material.uniforms.uTint.value, 'y').min(-1).max(1).step(0.001).name('green')
// gui.add(tintPass.material.uniforms.uTint.value, 'z').min(-1).max(1).step(0.001).name('blue')

// // Displacement pass
// const DisplacementShader = {
//     uniforms: 
//     {
//         tDiffuse: { value: null },
//         uNormalMap: { value: null }
//     },
//     vertexShader: `
//         varying vec2 vUv;

//         void main()
//         {
//             gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

//             vUv = uv;
//         }
//     `,
//     fragmentShader: `
//         uniform sampler2D tDiffuse;
//         uniform sampler2D uNormalMap;

//         varying vec2 vUv;

//         void main()
//         {
//             vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
//             vec2 newUv = vUv + normalColor.xy * 0.1;
//             vec4 color = texture2D(tDiffuse, newUv);

//             vec3 lightDirection = normalize(vec3(- 1.0, 1.0, 0.0));
//             float lightness = clamp(dot(normalColor, lightDirection), 0.0, 1.0);
//             color.rgb += lightness * 2.0;

//             gl_FragColor = color;
//         }
//     `
// }
// const displacementPass = new ShaderPass(DisplacementShader)
// displacementPass.material.uniforms.uNormalMap.value = textureLoader.load('/textures/interfaceNormalMap.png')
// effectComposer.addPass(displacementPass)

/**
 * Animate
 */
const clock = new THREE.Clock()
// let previousTime = 0

const tick = () =>
{
    stats.begin()

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

    stats.end()
}

tick()

renderer.shadowMap.autoUpdate = false
// renderer.shadowMap.needsUpdate = true