//classes
//
class Screen {
    constructor(ctx, width, height) {
        this._ctx = ctx;
        this._screen = this.generateEmptyScreen(width, height);
        // this._emptyScreen = this.generateEmptyScreen(width, height);
    }
    get screen() {
        return this._screen;
    }
    set screen(value) {
        this._screen = value;
    }
    get ctx() {
        return this._ctx;
    }
    set ctx(value) {
        this._ctx = value;
    }
    // get emptyScreen() {
    //     return this._emptyScreen;
    // }
    //generating 1 more pixel for rn
    generateEmptyScreen(width, height) {
        const newScreen = [];
        for (let i = 0; i < width + 1; i++) {
            newScreen[i] = [];
            for (let j = 0; j < height + 1; j++) {
                newScreen[i][j] = { type: undefined };
            }
        }
        return newScreen;
    }
    wipeScreen() {
        const emptyScreen = this.generateEmptyScreen(this.width - 1, this.height - 1);
        this.screen = emptyScreen;
    }
    get width() {
        return this.screen.length;
    }
    get height() {
        return this.screen[0].length;
    }
    generateBorderWalls() {
        this.addSurface(new Surface(1, 1, this.width - 2, 1, 0.5));
        this.addSurface(new Surface(this.width - 2, 1, this.width - 2, this.height - 2, 0.5));
        this.addSurface(new Surface(this.width - 2, this.height - 2, 1, this.height - 2, 0.5));
        this.addSurface(new Surface(1, this.height - 2, 1, 1, 0.5));
    }
    //wortk on this
    drawScreen() {
        for (let i = 0; i < this.screen.length; i++) {
            for (let j = 0; j < this.screen[0].length; j++) {
                ctx.beginPath();
                if (this.screen[i][j].type == "ray") {
                    const opacity = this.screen[i][j].opacity;
                    ctx.fillStyle = `rgb(${opacity * 255}, ${opacity * 255}, ${opacity * 255})`;
                } else if (this.screen[i][j].type == "surface") {
                    ctx.fillStyle = "gray";
                } else {
                    ctx.fillStyle = "black";
                }
                ctx.fillRect(i, j, 1, 1);
                ctx.stroke();
            }
        }
    }
    addLine(x1, y1, x2, y2, params) {
        let coordinateCurrent = new Coordinates(x1, y1);
        let coordinateFinal = new Coordinates(x2, y2);
        let dir = coordinateCurrent.directionTo(coordinateFinal);
        while (coordinateFinal.distanceTo(coordinateCurrent) > 1) {
            coordinateCurrent.x -= Math.cos(dir);
            coordinateCurrent.y -= Math.sin(dir);
            this.screen[Math.floor(coordinateCurrent.x)][Math.floor(coordinateCurrent.y)] = params;
        }
    }
    addSurface(surface) {
        this.addLine(surface.coordinates1.x, surface.coordinates1.y, surface.coordinates2.x, surface.coordinates2.y, { type: "surface", reflectivity: surface.reflectivity, dir: surface.angle, opacity: 1 });
        this.addLine(surface.coordinates1.x + 1, surface.coordinates1.y, surface.coordinates2.x + 1, surface.coordinates2.y, { type: "surface", reflectivity: surface.reflectivity, dir: surface.angle, opacity: 1 });
    }
    addRay(ray) {
        let coordinateCurrent = new Coordinates(ray.x, ray.y);
        let currentDir = ray.dir;
        let params = { type: "ray", opacity: 1 };
        for (let i = 0; i <= ray.bounces; i++) {
            while (true) {
                coordinateCurrent.x -= Math.cos(currentDir);
                coordinateCurrent.y -= Math.sin(currentDir);
                if (coordinateCurrent.x < 0 || coordinateCurrent.y < 0 || coordinateCurrent.x > this.screen.length || coordinateCurrent.y > this.screen[0].length) {
                    i = ray.bounces;
                    break;
                } else if (this.screen[Math.floor(coordinateCurrent.x)][Math.floor(coordinateCurrent.y)].type == "surface") {
                    const diff = currentDir - this.screen[Math.floor(coordinateCurrent.x)][Math.floor(coordinateCurrent.y)].dir;
                    currentDir = this.screen[Math.floor(coordinateCurrent.x)][Math.floor(coordinateCurrent.y)].dir - diff;
                    params.opacity += this.screen[Math.floor(coordinateCurrent.x)][Math.floor(coordinateCurrent.y)].reflectivity;
                    coordinateCurrent.x -= Math.cos(currentDir);
                    coordinateCurrent.y -= Math.sin(currentDir);
                    break;
                } else {
                    //work on this pls
                    //if (this.screen[Math.floor(coordinateCurrent.x)][Math.floor(coordinateCurrent.y)].type != "ray") {
                        this.screen[Math.floor(coordinateCurrent.x)][Math.floor(coordinateCurrent.y)] = JSON.parse(JSON.stringify(params));
                    //}
                }
            }
        }
    }
    addLight(light, num, bounces) {
        const rays = light.generateRays(num, bounces);
        //console.log(rays);
        for (let ray of rays) {
            this.addRay(ray);
        }
    }
}

class Ray {
    constructor(x, y, dir, bounces) {
        this._coordinates = new Coordinates(x, y);
        this._dir = dir;
        this._bounces = bounces;
    }
    get coordinates() {
        return this._coordinates;
    }
    set coordinates(value) {
        this._coordinates = value;
    }
    get dir() {
        return this._dir;
    }
    set dir(value) {
        this._dir = value;
    }
    get bounces() {
        return this._bounces;
    }
    set bounces(value) {
        this._bounces = value;
    }
    get x() {
        return this.coordinates.x;
    }
    get y() {
        return this.coordinates.y;
    }
}

class Light {
    constructor(x, y, brightness) {
        this._coordinates = new Coordinates(x, y);
        this._brightness = brightness;
    }
    get coordinates() {
        return this._coordinates;
    }
    set coordinates(value) {
        this._coordinates = value;
    }
    get brightness() {
        return this._brightness;
    }
    set brightness(value) {
        this._brightness = value;
    }
    generateRays(num, bounces) {
        const rays = [];
        for (let i = 0; i < num; i++) {
            rays.push(new Ray(this.coordinates.x, this.coordinates.y, (((Math.PI * 2) / num) * i), bounces));
        }
        return rays;
    }
}

class Surface {
    constructor(x1, y1, x2, y2, reflectivity = 1) {
        this._coordinates1 = new Coordinates(x1, y1);
        this._coordinates2 = new Coordinates(x2, y2);
        this._reflectivity = reflectivity;
    }
    get coordinates1() {
        return this._coordinates1;
    }
    set coordinates1(value) {
        this._coordinates1 = value;
    }
    get coordinates2() {
        return this._coordinates2;
    }
    set coordinates2(value) {
        this._coordinates2 = value;
    }
    get reflectivity() {
        return this._reflectivity;
    }
    set reflectivity(value) {
        this._reflectivity = value;
    }
    get angle() {
        return this.coordinates1.directionTo(this.coordinates2);
    }
    get length() {
        return Math.abs(this.coordinates1.distanceTo(this.coordinates2));
    }
}

class Coordinates {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }
    get x() {
        return this._x;
    }
    set x(value) {
        this._x = value;
    }
    get y() {
        return this._y;
    }
    set y(value) {
        this._y = value;
    }
    distanceXTo(coordinates) {
        return (this.x - coordinates.x);
    }
    distanceYTo(coordinates) {
        return (this.y - coordinates.y);
    }
    distanceTo(coordinates) {
        return Math.sqrt((this.distanceXTo(coordinates) ** 2) + (this.distanceYTo(coordinates) ** 2));
    }
    directionTo(coordinates) {
        return Math.atan2(this.distanceYTo(coordinates), this.distanceXTo(coordinates));
    }
}

//main code
//
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const width = 1000;
const height = 500;
canvas.width = width + 1;
canvas.height = height + 1;

const screen1 = new Screen(ctx, width, height);
// screen1.generateBorderWalls();
// screen1.addSurface(new Surface(150, 20, 480, 350, 1));
// screen1.addSurface(new Surface(5, 20, 335, 350, 1));
// //screen1.addRay(new Ray(120, 50, 2.8, 20));
// screen1.addLight(new Light(150, 90, 1));
// screen1.drawScreen();

//let mousePosition = [];
addEventListener("mousemove", (ev) => {
    //mousePosition = [ev.x, ev.y];
    screen1.wipeScreen();
    screen1.generateBorderWalls();
    // screen1.addSurface(new Surface(150, 20, 480, 350, 0.5));
    // screen1.addSurface(new Surface(5, 20, 335, 350, 0.5));
    // screen1.addSurface(new Surface(250, 600, 600, 250, 0.5));
    screen1.addLight(new Light(ev.x, ev.y, 1), 10, 3);
    screen1.drawScreen();
});