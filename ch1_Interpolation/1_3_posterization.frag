#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float u_time; // 経過時間に関するユニフォーム関数
int channel; // 表示するシェーダのチャンネル
void main() {
    vec2 pos = gl_FragCoord.xy / u_resolution.xy; // フラグメント座標を正規化
    vec3[4] col4 = vec3[](
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 1.0, 0.0),
        vec3(1.0, 1.0, 0.0)
    );
    float n = 4.0; // 階調数
    pos *= n; // フラグメント座標範囲を[0,n]区間にスケール
    channel = int(2.0 * gl_FragCoord.x / u_resolution.x); // ビューポートを分割して各チャンネルを表示
    if (channel == 0) { // 左：階段関数を使った補完
        pos = floor(pos) + step(0.5, fract(pos)); // フラグメント座標を階段化
    } else { // 右：滑らかな階段関数を使った補完
        float thr = 0.25 * sin(u_time);
        pos = floor(pos) + smoothstep(0.25 + thr, 0.75 - thr, fract(pos));
    }
    pos /= n; // フラグメント座標範囲を[0,1]区間内に正規化
    vec3 col = mix(mix(col4[0], col4[1], pos.x), mix(col4[2], col4[3], pos.x), pos.y);
    fragColor = vec4(col, 1.0);
}