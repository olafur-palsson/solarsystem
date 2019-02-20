

export default class Boilerplate {

  constructor (webglContext) {
    this.gl = webglContext
  }
  // This is how you get the compile errors of a shader displayed in console
  verifyShaderCompilation (gl, shader) {
    const ok = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if ( !ok )
    throw "ShaderCompileError: \n" + gl.getShaderInfoLog(shader)
  }

  // This is how you get the linking errors of the program displayed in console
  verifyProgramLinking (gl, program) {
    const ok = gl.getProgramParameter(program, gl.LINK_STATUS)
    if ( !ok )
    throw "ProgramLinkingError: \n" + gl.getProgramInfoLog(program)
  }

  initProgram (vertexShaderText, fragmentShaderText) {

    // Set the background or null color and clear
    this.gl.clearColor(0, 0, 0, 1)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

    // Create shader
    this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER)
    this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)

    // Set the source code for the shader
    this.gl.shaderSource(this.vertexShader, vertexShaderText)
    this.gl.shaderSource(this.fragmentShader, fragmentShaderText)

    // Compile
    this.gl.compileShader(this.vertexShader)
    this.gl.compileShader(this.fragmentShader)

    // Get shader compile errors displayed in console
    this.verifyShaderCompilation(this.gl, this.vertexShader)
    this.verifyShaderCompilation(this.gl, this.fragmentShader)

    // Create and link the program
    this.program = this.gl.createProgram()
    this.gl.attachShader(this.program, this.vertexShader)
    this.gl.attachShader(this.program, this.fragmentShader)
    this.gl.linkProgram(this.program)

    // Get linking errors
    this.verifyProgramLinking(this.gl, this.program)

    return this.program
  }



}
