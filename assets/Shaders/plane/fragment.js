const fragment = /* glsl */ `
precision mediump float;

varying float vFrequency;
void main()
{

    gl_FragColor = vec4(1.0, vFrequency/350.0, 0.0, 1.0);
}
`;

export default fragment;
