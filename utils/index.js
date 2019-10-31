function resizeRendererToDisplaySize(renderer) {
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

class AxisGridHelper {
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
