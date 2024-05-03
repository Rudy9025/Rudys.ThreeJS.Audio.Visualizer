const vertex = /* glsl */ `
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

attribute vec3 position;
attribute float aFrequency;
varying float vFrequency;
void main()
{
    
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.y += (aFrequency - 150.0) * 0.15;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vFrequency = aFrequency;
}`;
export default vertex;
