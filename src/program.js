
const glMatrix = require('gl-matrix')

import easyWebGL from './easyWebGL'
import { loadTexture } from './textures'
import GLObject from './GLObject'
import addDragRotation from './dragRotatePlugin'

const sphereobjpath = '../sphere.obj'
const sunTexturePng = '../sun.png'
const earthTexturePng = '../earth.png'
const moonTexturePng = '../moon.png'

let canvas, gl, program
const N_BYTES = Float32Array.BYTES_PER_ELEMENT

const start = async () => {
  canvas = document.getElementById('canvas')
  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })
  const EasyGL = new easyWebGL(gl, 'textures', 'textures')
  program = EasyGL.initProgram()

  const { positionAttribLocation, colorAttribLocation } = EasyGL.getAttribLocations()

  gl.enable(gl.DEPTH_TEST)

  gl.useProgram(program)

  // Get the location of the matrices from the shader
  const matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld')
  const matViewUniformLocation = gl.getUniformLocation(program, 'mView')
  const matProjUniformLocation = gl.getUniformLocation(program, 'mProjection')

  // Create arrays containing the actual matrices
  const mWorld      = new Float32Array(16)
  const mView       = new Float32Array(16)
  const mProjection = new Float32Array(16)

  // Identity matrix since we want it to be at center
  glMatrix.mat4.identity(mWorld)

  // Setup the camera matrix
  let positionOfViewer         = [ 0,  0, -5]
  const pointViewerIsLookingAt = [ 0,  0,  0]
  const vectorPointingUp       = [ 0,  5,  0]
  glMatrix.mat4.lookAt(mView, positionOfViewer, pointViewerIsLookingAt, vectorPointingUp)

  // Black magic
  // Most likely f(output, cameraWidthAngle, aspectRatio, closestRenderedPoint, furthestRenderedPoint)
  glMatrix.mat4.perspective(mProjection, Math.PI * 0.25, canvas.width / canvas.height, 0.1, 1000.0)

  // Set the mView in the shader to be the matrix we made
  gl.uniformMatrix4fv(matViewUniformLocation,  gl.FALSE, mView)
  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, mWorld)
  gl.uniformMatrix4fv(matProjUniformLocation,  gl.FALSE, mProjection)
  let lastTime = performance.now()

  // TODO
  const solarSystem = {
    sun_pos: [0, 0, 0],
    sun_scale: 1,
    moon_pos: [0.5, 0, 0],
    moon_scale: 0.03,
    earth_pos: [3, 0, 0],
    earth_scale: 0.1,
    sat_pos: [0, 0.2, 0],
    sat_scale: 0.02
  }

  const textcoordAttribLocation = gl.getAttribLocation(program, 'a_textcoord')
  const u_samplerUniformLocation = gl.getUniformLocation(program, 'u_sampler')

  const sun = await GLObject.create(gl, sphereobjpath, sunTexturePng, positionAttribLocation, textcoordAttribLocation, u_samplerUniformLocation)
  const moon = await GLObject.create(gl, sphereobjpath, moonTexturePng, positionAttribLocation, textcoordAttribLocation, u_samplerUniformLocation)
  const earth = await GLObject.create(gl, sphereobjpath, earthTexturePng, positionAttribLocation, textcoordAttribLocation, u_samplerUniformLocation)
  const sat = await GLObject.create(gl, '../uhf.obj', '../satellite.png', positionAttribLocation, textcoordAttribLocation, u_samplerUniformLocation)


  const rotate_wrt_time = addDragRotation(mWorld)

  let translation = new Float32Array(solarSystem.sun_pos)
  const translateUniformLocation = gl.getUniformLocation(program, 'translation')
  gl.uniform3fv(translateUniformLocation, translation)

  const scalarUniformLocation = gl.getUniformLocation(program, 'scalar')
  gl.uniform1f(scalarUniformLocation, 0.5)

  const vectorAdd = (v1, v2) => {
    return v1.map((_, i) => v1[i] + v2[i])
  }
  let scale

  const initialTime = performance.now()

  const updateSolarSystemPositions = () => {
    let timePassed = performance.now() - initialTime
    timePassed /= 10
    const earthRad = 1 / 365 * timePassed
    const moonRad = 1 / 30 * timePassed
    const f = (rad, scalar) => [Math.cos(rad) * scalar, 0, Math.sin(rad) * scalar]
    solarSystem.earth_pos = f(earthRad, 3)
    solarSystem.moon_pos = f(moonRad, 0.5)
    solarSystem.sat_pos = [0, 0.1 * Math.cos(moonRad * 2), 0.1 * Math.sin(moonRad * 2)]
  }

  const render = () => {
    let currentTime = performance.now()
    let timePassed = currentTime - lastTime
    lastTime = currentTime
    updateSolarSystemPositions()
    rotate_wrt_time(timePassed)
    gl.uniformMatrix4fv(matViewUniformLocation,  gl.FALSE, mView)
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, mWorld)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    translation = new Float32Array(solarSystem.sun_pos)
    gl.uniform3fv(translateUniformLocation, translation)
    scale = solarSystem.sun_scale
    gl.uniform1f(scalarUniformLocation, scale)
    sun.draw()

    translation = new Float32Array(solarSystem.earth_pos)
    gl.uniform3fv(translateUniformLocation, translation)
    scale = solarSystem.earth_scale
    gl.uniform1f(scalarUniformLocation, scale)
    earth.draw()

    translation = new Float32Array(vectorAdd(solarSystem.earth_pos, solarSystem.moon_pos))
    gl.uniform3fv(translateUniformLocation, translation)
    scale = solarSystem.moon_scale
    gl.uniform1f(scalarUniformLocation, scale)
    moon.draw()

    translation = new Float32Array(vectorAdd(vectorAdd(solarSystem.earth_pos, solarSystem.moon_pos), solarSystem.sat_pos))
    gl.uniform3fv(translateUniformLocation, translation)
    scale = solarSystem.sat_scale
    gl.uniform1f(scalarUniformLocation, scale)
    sat.draw()


    //
    // gl.drawElements(gl.TRIANGLES, sunmesh.indices.length, gl.UNSIGNED_SHORT, 0)
    // gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0)
    requestAnimationFrame(render)
  }
  requestAnimationFrame(render)
}

start()
