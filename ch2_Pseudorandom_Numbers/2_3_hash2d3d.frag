#version 300 es
precision highp float;
precision highp int;
out vec4 fragColor;
uniform float u_time;
uvec3 k = uvec3(0x456789abu, 0x6789ab45u, 0x89ab4567u); // 算術積で使う定数
uvec3 u = uvec3(1, 2, 3); // シフト数
const uint UINT_MAX = 0xffffffffu; // 符号なし整数の最大値
uvec2 uhash22(uvec2 n) { // 引数･戻り値が2次元のuint型ハッシュ関数
    n ^= (n.yx << u.xy);
    n ^= (n.yx >> u.xy);
    n *= k.xy;
    n ^= (n.yx << u.xy);
    return n * k.xy;
}
uvec3 uhash33(uvec3 n) { // 引数･戻り値が3次元のuint型ハッシュ関数
    n ^= (n.yzx << u);
    n ^= (n.yzx >> u);
    n *= k;
    n ^= (n.yzx << u);
    return n * k;
}
vec2 hash22(vec2 p) { // 引数･戻り値が2次元のfloat型ハッシュ関数
    uvec2 n = floatBitsToUint(p);
    return vec2(uhash22(n)) / vec2(UINT_MAX);
}
vec3 hash33(vec3 p) { // 引数･戻り値が3次元のfloat型ハッシュ関数
    uvec3 n = floatBitsToUint(p);
    return vec3(uhash33(n)) / vec3(UINT_MAX);
}
void main() {
    float time = floor(60.0 * u_time); // 1秒に60カウント
    vec2 pos = gl_FragCoord.xy + time; // フラグメント座標をずらす
    fragColor.rgb = vec3(hash11(pos.x));
    fragColor.a = 1.0;
}