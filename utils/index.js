import * as THREE from '../library/three.module.js';

export function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width  = canvas.clientWidth * pixelRatio | 0; // 取整
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

export class AxisGridHelper {
    constructor(node, visible = false, units) {
        const axes = new THREE.AxesHelper(); // x(red) y(green) z(blue)
        axes.material.depthTest = false; // 取消深度，即使轴在内部也能看到
        axes.renderOrder = 2; // 绘制顺序，需要在辅助网格绘制完成后再绘制辅助轴（默认为0）
        node.add(axes);

        const grid = new THREE.GridHelper(units, units);
        grid.material.depthTest = false;
        grid.renderOrder = 1; // 绘制顺序，需要在球体绘制完成后再绘制辅助网格（默认为0）
        node.add(grid);

        this.grid = grid;
        this.axes = axes;
        this.visible = visible;
    }

    get visible() {
        return this._visible;
    }
    set visible(v) {
        this._visible = v;
        this.grid.visible = v;
        this.axes.visible = v;
    }
}

// 设置16进制的色值
export class ColorHelper {
    constructor(obj, prop) {
        this.obj = obj;
        this.prop = prop;
    }
    get value() {
        return `#${this.obj[this.prop].getHexString()}`
    }
    set value(hexStr) {
        this.obj[this.prop].set(hexStr);
    }
}

// 弧度转角度
export class DegRadHelper {
    constructor(obj, prop) {
        this.obj = obj;
        this.prop = prop;
    }
    get value() {
        return THREE.Math.radToDeg(this.obj[this.prop]);
    }
    set value(v) {
        this.obj[this.prop] = THREE.Math.degToRad(v);
    }
}

export class MinMaxHelper {
    constructor(obj, minProp, maxProp, step) {
        this.obj = obj;
        this.minProp = minProp;
        this.maxProp = maxProp;
        this.step = step;
    }
    get min() {
        return this.obj[this.minProp];
    }
    set min(v) {
        this.obj[this.minProp] = v;
        this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.step);
    }
    get max() {
        return this.obj[this.maxProp];
    }
    set max(v) {
        this.obj[this.maxProp] = v;
        this.min = this.min; // 会调用min setter
    }
}

// 保证 near 一直小于 far
// 保证 fog 颜色和场景的 background 同步
export class FogHelper {
    constructor(fog, bg) {
        this.fog = fog;
        this.bg = bg;
    }
    get near() {
        return this.fog.near;
    }
    set near(v) {
        this.fog.near = v;
        this.fog.far = Math.max(v, this.fog.far);
    }
    get far() {
        return this.fog.far;
    }
    set far(v) {
        this.fog.far = v;
        this.fog.near = Math.min(v, this.fog.near);
    }
    get color() {
        return `#${this.fog.color.getHexString()}`;
    }
    set color(v) {
        this.fog.color.set(v);
        this.bg.set(v);
    }
}

// https://threejsfundamentals.org/threejs/lessons/threejs-load-obj.html
export function frameArea(sizeToFitScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitScreen = sizeToFitScreen / 2;
    const halfFovY = THREE.Math.degToRad(camera.fov / 2);
    const distance = halfSizeToFitScreen / Math.tan(halfFovY);

    const direction = (new THREE.Vector3())
        .subVectors(camera.position, boxCenter)
        .multiply(new THREE.Vector3(1, 0, 1)) // 将初始视角转换到 XZ 平面
        .normalize();
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();

    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}

function dumpVec3(v3, precision = 3) {
    return `${v3.x.toFixed(precision)}, ${v3.y.toFixed(precision)}, ${v3.z.toFixed(precision)}`;
}

export function dumpObject(obj, lines = [], isLast = true, prefix = '') {
    const localPrefix = isLast ? '└─' : '├─';
    lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
    const dataPrefix = obj.children.length
        ? (isLast ? '  │ ' : '│ │ ')
        : (isLast ? '    ' : '│   ');
    lines.push(`${prefix}${dataPrefix}  pos: ${dumpVec3(obj.position)}`);
    lines.push(`${prefix}${dataPrefix}  rot: ${dumpVec3(obj.rotation)}`);
    lines.push(`${prefix}${dataPrefix}  scl: ${dumpVec3(obj.scale)}`);
    const newPrefix = prefix + (isLast ? '  ' : '│ ');
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
        const isLast = ndx === lastNdx;
        dumpObject(child, lines, isLast, newPrefix);
    });
    return lines;
}

export function hsl(h, s, l) {
    return (new THREE.Color()).setHSL(h, s, l);
}