#version 300 es
precision highp float;
precision highp int;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
ivec2 channel;

const float PI = 3.1415926;
float atan2(float y, float x) {
    if (x == 0.0) {
        return sign(y) * PI / 2.0;
    } else {
        return atan(y, x);
    }
}
vec2 xy2pol(vec2 xy) {
    return vec2(atan2(xy.x, xy.y), length(xy));
}

uvec3 k = uvec3(0x456789abu, 0x6789ab45u, 0x89ab4567u);
uvec3 u = uvec3(1, 2, 3);
uvec2 uhash22(uvec2 n){
    n ^= (n.yx << u.xy);
    n ^= (n.yx >> u.xy);
    n *= k.xy;
    n ^= (n.yx << u.xy);
    return n * k.xy;
}

float gtable2(vec2 lattice, vec2 p) {
    uvec2 n = floatBitsToUint(lattice);
    uint ind = uhash22(n).x >> 29;
    float u = 0.92387953 * (ind < 4u ? p.x : p.y);
    float v = 0.38268343 * (ind < 4u ? p.y : p.x);
    return ((ind & 1u) == 0u ? u : -u) + ((ind & 2u) == 0u ? v : -v);
}
float periodicNoise21(vec2 p, float period) { // period:周期
    vec2 n = floor(p);
    vec2 f = fract(p);
    float[4] v;
    for (int j = 0; j < 2; j++) {
        for (int i = 0; i < 2; i++) {
            v[i+2*j] = gtable2(mod(n + vec2(i, j), period), f - vec2(i, j)); // mod関数で周期性を持たせたハッシュ値
        }
    }
    f = f * f * f * (10.0 -15.0 * f + 6.0 * f * f);
    return 0.5 * mix(mix(v[0], v[1], f[0]), mix(v[2], v[3], f[0]), f[1]) + 0.5;
}

void main() {
    vec2 pos = gl_FragCoord.xy / u_resolution.xy;
    pos = 2.0 * pos.xy - vec2(1.0);
    pos = xy2pol(pos);
    pos = vec2(5.0 / PI, 5.0) * pos + u_time;
    fragColor = vec4(periodicNoise21(pos, 10.0));
    fragColor.a = 1.0;
}