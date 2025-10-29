#version 300 es
precision highp float;
precision highp int;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
int channel;
void main() {
    fragColor = vec4(1.0, 0.0, 0.0, 1.0);
}