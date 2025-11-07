#version 300 es
precision highp float;
precision highp int;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
ivec2 channel;

uvec3 k = uvec3(0x456789abu, 0x6789ab45u, 0x89ab4567u);
uvec3 u = uvec3(1, 2, 3);
const uint UINT_MAX = 0xffffffffu;
uvec2 uhash22(uvec2 n){
    n ^= (n.yx << u.xy);
    n ^= (n.yx >> u.xy);
    n *= k.xy;
    n ^= (n.yx << u.xy);
    return n * k.xy;
}
uvec3 uhash33(uvec3 n){
    n ^= (n.yzx << u);
    n ^= (n.yzx >> u);
    n *= k;
    n ^= (n.yzx << u);
    return n * k;
}
vec2 hash22(vec2 p){
    uvec2 n = floatBitsToUint(p);
    return vec2(uhash22(n)) / vec2(UINT_MAX);
}
vec3 hash33(vec3 p){
    uvec3 n = floatBitsToUint(p);
    return vec3(uhash33(n)) / vec3(UINT_MAX);
}

float gnoise21(vec2 p) {
    vec2 n = floor(p);
    vec2 f = fract(p);
    float[4] v;
    for (int j = 0; j < 2; j++) {
        for (int i = 0; i < 2; i++) {
            vec2 g = normalize(hash22(n + vec2(i, j)) - vec2(0.5));
            v[i+2*j] = dot(g, f - vec2(i, j));
        }
    }
    
    f = f * f * f * (10.0 -15.0 * f + 6.0 * f * f);
    return 0.5 * mix(mix(v[0], v[1], f[0]), mix(v[2], v[3], f[0]), f[1]) + 0.5;
}
float gnoise31(vec3 p) {
    vec3 n = floor(p);
    vec3 f = fract(p);
    float[8] v;
    for (int k = 0; k < 2; k++) {
        for (int j = 0; j < 2; j++) {
            for (int i = 0; i < 2; i++) {
                vec3 g = normalize(hash33(n + vec3(i, j, k)) - vec3(0.5));
                v[i+2*j+4*k] = dot(g, f - vec3(i, j, k));
            }
        }
    }
    f = f * f * f * (10.0 -15.0 * f + 6.0 * f * f);
    float[2] w;
    for (int i = 0; i < 2; i++) {
        w[i] = mix(mix(v[4*i], v[4*i+1], f[0]), mix(v[4*i+2], v[4*i+3], f[0]), f[1]);
    }
    return 0.5 * mix(w[0], w[1], f[2]) + 0.5;
}

float gtable2(vec2 lattice, vec2 p) {
    uvec2 n = floatBitsToUint(lattice);
    uint ind = uhash22(n).x >> 29;
    float u = 0.92387953 * (ind < 4u ? p.x : p.y); // 0.92387953 ≒ cos(pi/8)
    float v = 0.38268343 * (ind < 4u ? p.y : p.x); // 0.38268343 ≒ sin(pi/8)
    return ((ind & 1u) == 0u ? u : -u) + ((ind & 2u) == 0u ? v : -v);
}
float pnoise21(vec2 p) {
    vec2 n = floor(p);
    vec2 f = fract(p);
    float[4] v;
    for (int j = 0; j < 2; j++) {
        for (int i = 0; i < 2; i++) {
            v[i+2*j] = gtable2(n + vec2(i, j), f - vec2(i, j));
        }
    }
    f = f * f * f * (10.0 -15.0 * f + 6.0 * f * f);
    return 0.5 * mix(mix(v[0], v[1], f[0]), mix(v[2], v[3], f[0]), f[1]) + 0.5;
}
float gtable3(vec3 lattice, vec3 p) { // latice:格子点
    uvec3 n = floatBitsToUint(lattice); // 格子点の値をビット列に変換
    uint ind = uhash33(n).x >> 28; // ハッシュ値の桁を落とす
    float u = ind < 8u ? p.x : p.y;
    float v = ind < 4u ? p.y : ind == 12u || ind == 14u ? p.x : p.z;
    return ((ind & 1u) == 0u ? u : -u) + ((ind & 2u) == 0u ? v : -v);
}
float pnoise31(vec3 p) {
    vec3 n = floor(p);
    vec3 f = fract(p);
    float[8] v;
    for (int k = 0; k < 2; k++) {
        for (int j = 0; j < 2; j++) {
            for (int i = 0; i < 2; i++) {
                v[i+2*j+4*k] = gtable3(n + vec3(i, j, k), f - vec3(i, j, k)) * 0.70710678; // 0.70710678 ≒ 1/sqrt(2)
            }
        }
    }
    f = f * f * f * (10.0 -15.0 * f + 6.0 * f * f);
    float[2] w;
    for (int i = 0; i < 2; i++) {
        w[i] = mix(mix(v[4*i], v[4*i+1], f[0]), mix(v[4*i+2], v[4*i+3], f[0]), f[1]);
    }
    return 0.5 * mix(w[0], w[1], f[2]) + 0.5;
}

void main() {
    vec2 pos = gl_FragCoord.xy / min(u_resolution.x, u_resolution.y);
    pos = 10.0 * pos + u_time;
    channel = ivec2(2.0 * gl_FragCoord.xy / u_resolution.xy);
    float v = channel[0] == 0 ?
        channel[1] == 0 ? gnoise21(pos) :
        gnoise31(vec3(pos, u_time)) :
        channel[1] == 0 ? pnoise21(pos) :
        pnoise31(vec3(pos, u_time));
    fragColor.rgb = vec3(v);
    fragColor.a = 1.0;
}