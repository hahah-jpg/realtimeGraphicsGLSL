#version 300 es
precision highp float;
precision highp int;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
int channel;

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
float hash21(vec2 p){
    uvec2 n = floatBitsToUint(p);
    return float(uhash22(n).x) / float(UINT_MAX);
}

float vnoise21(vec2 p) {
    vec2 n = floor(p);
    float[4] v;
    for (int j = 0; j < 2; j++) {
        for (int i = 0; i < 2; i++) {
            v[i+2*j] = hash21(n + vec2(i, j));
        }
    }
    vec2 f = fract(p);
    f = f * f * f * (10.0 - 15.0 * f + 6.0 * f * f);
    return mix(mix(v[0], v[1], f[0]), mix(v[2], v[3], f[0]), f[1]);
}

float gtable2(vec2 lattice, vec2 p) {
    uvec2 n = floatBitsToUint(lattice);
    uint ind = uhash22(n).x >> 29;
    float u = 0.92387953 * (ind < 4u ? p.x : p.y);
    float v = 0.38268343 * (ind < 4u ? p.y : p.x);
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

float fbm21(vec2 p, float g) {
    float val = 0.0;
    float amp = 1.0;
    float freq = 1.0;
    for (int i = 0; i < 4; i++) {
        val += amp * (vnoise21(freq * p) - 0.5);
        amp *= g;
        freq *= 2.01;
    }
    return 0.5 * val + 0.5;
}
float base21(vec2 p) { // ドメインワーピングの素材となる関数
    return channel == 0 ? fbm21(p, 0.5) : // 左：fBM(G=0.5)
    pnoise21(p); // 右：パーリンノイズ
}
float warp21(vec2 p, float g) { // 2変数ドメインワーピング
    float val = 0.0; // 値の初期値
    for (int i = 0; i < 4; i++) {
        val = base21(p + g * val);
    }
    return val;
}

void main() {
    vec2 pos = gl_FragCoord.xy / min(u_resolution.x, u_resolution.y);
    channel = int(2.0 * gl_FragCoord.x / u_resolution.x);
    pos = 10.0 * pos;
    float g = abs(mod(u_time, 10.0) - 5.0);
    fragColor = vec4(vec3(warp21(pos, g)), 1.0);
}