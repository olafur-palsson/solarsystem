
const glMatrix = require('gl-matrix')

import easyWebGL from './easyWebGL'
import { cube, cubeIndices, addColorsToCube } from './objects'
import { createRandomColors } from './colorGenerator'

let canvas, gl, program
const N_BYTES = Float32Array.BYTES_PER_ELEMENT

const start = () => {
  canvas = document.getElementById('canvas')
  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })
  const EasyGL = new easyWebGL(gl, 'full3d', 'basic')
  program = EasyGL.initProgram()

  const { positionAttribLocation, colorAttribLocation } = EasyGL.getAttribLocations()

  let data = cube
  let colors = createRandomColors(6)
  data = addColorsToCube(cube, colors)
  console.log(data)

  gl.enable(gl.CULL_FACE)
  gl.cullFace(gl.BACK)

  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)

  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW)

  gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, gl.FALSE, 6 * N_BYTES, 0)
  gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, gl.FALSE, 6 * N_BYTES, 3 * N_BYTES)
  gl.enableVertexAttribArray(positionAttribLocation)
  gl.enableVertexAttribArray(colorAttribLocation)
  gl.useProgram(program)
  // const { mWorld, mView, mProj } = EasyGL.setupUniformMatrices(canvas.width / canvas.height, positionOfViewer, pointViewerIsLookingAt, vectorPointingUp)

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
  let positionOfViewer       = [ 0, -20, 0]
  const pointViewerIsLookingAt = [ 0, 0, 0]
  const vectorPointingUp       = [ 0, 0, 5]
  glMatrix.mat4.lookAt(mView, positionOfViewer, pointViewerIsLookingAt, vectorPointingUp)

  // Black magic
  // Most likely f(output, cameraWidthAngle, aspectRatio, closestRenderedPoint, furthestRenderedPoint)
  glMatrix.mat4.perspective(mProjection, Math.PI * 0.25, canvas.width / canvas.height, 0.1, 1000.0)

  // Set the mView in the shader to be the matrix we made
  gl.uniformMatrix4fv(matViewUniformLocation,  gl.FALSE, mView)
  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, mWorld)
  gl.uniformMatrix4fv(matProjUniformLocation,  gl.FALSE, mProjection)

  console.log(mView)
  console.log(mWorld)
  console.log(mProjection)

  let angle = 0
  let identityMatrix = glMatrix.mat4.identity(new Float32Array(16))
  let rotationMatrix = new Float32Array(16)

  // where a is a double

  document.querySelector("#scale").oninput = e => {
    positionOfViewer = [0, -20 / e.target.value, 0]
  }

  const render = () => {
    let angle = performance.now() / 1000 * Math.PI
    glMatrix.mat4.rotate(rotationMatrix, identityMatrix, angle, [1, 0, 0])
    glMatrix.mat4.mul(mWorld, rotationMatrix, identityMatrix)
    glMatrix.mat4.rotate(rotationMatrix, identityMatrix, angle / 2, [0, 1, 1])
    glMatrix.mat4.mul(mWorld, rotationMatrix, mWorld)
    glMatrix.mat4.lookAt(mView, positionOfViewer, pointViewerIsLookingAt, vectorPointingUp)

    gl.uniformMatrix4fv(matViewUniformLocation,  gl.FALSE, mView)
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, mWorld)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
    gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0)
    requestAnimationFrame(render)
  }
  requestAnimationFrame(render)
}

start()
