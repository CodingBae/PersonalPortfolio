console.clear();
var SquiggleState;
(function (SquiggleState) {
    SquiggleState[SquiggleState["ready"] = 0] = "ready";
    SquiggleState[SquiggleState["animating"] = 1] = "animating";
    SquiggleState[SquiggleState["ended"] = 2] = "ended";
})(SquiggleState || (SquiggleState = {}));
var Squiggle = /** @class */ (function () {
    function Squiggle(stage, settings, grid) {
        this.sqwigs = [];
        this.state = SquiggleState.ready;
        this.grid = grid;
        this.stage = stage;
        settings.width = 0;
        settings.opacity = 1;
        this.state = SquiggleState.animating;
        var path = this.createLine(settings);
        var sqwigCount = 3;
        for (var i = 0; i < sqwigCount; i++) {
            this.createSqwig(i, sqwigCount, path, JSON.parse(JSON.stringify(settings)), i == sqwigCount - 1);
        }
    }
    Squiggle.prototype.createSqwig = function (index, total, path, settings, forceWhite) {
        var _this = this;
        var sqwig = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        sqwig.setAttribute('d', path);
        sqwig.style.fill = 'none';
        sqwig.style.stroke = forceWhite ? '#303030' : this.getColor();
        sqwig.style.strokeLinecap = "round";
        settings.length = sqwig.getTotalLength();
        settings.chunkLength = settings.length / 6; //(settings.sections * 2) + (Math.random() * 40);
        settings.progress = settings.chunkLength;
        sqwig.style.strokeDasharray = settings.chunkLength + ", " + (settings.length + settings.chunkLength);
        sqwig.style.strokeDashoffset = "" + settings.progress;
        this.stage.appendChild(sqwig);
        this.sqwigs.unshift({ path: sqwig, settings: settings });
        TweenLite.to(settings, settings.sections * 0.1, {
            progress: -settings.length,
            width: settings.sections * 0.9,
            ease: Power1.easeOut,
            delay: index * (settings.sections * 0.01),
            onComplete: function () {
                if (index = total - 1)
                    _this.state = SquiggleState.ended;
                sqwig.remove();
            }
        });
    };
    Squiggle.prototype.update = function () {
        this.sqwigs.map(function (set) {
            set.path.style.strokeDashoffset = "" + set.settings.progress;
            set.path.style.strokeWidth = set.settings.width + "px";
            set.path.style.opacity = "" + set.settings.opacity;
        });
    };
    Squiggle.prototype.createLine = function (settings) {
        var x = settings.x;
        var y = settings.y;
        var dx = settings.directionX;
        var dy = settings.directionY;
        var path = [
            'M',
            '' + x,
            '' + y,
            "Q"
        ];
        var steps = settings.sections;
        var step = 0;
        var getNewDirection = function (direction, goAnywhere) {
            if (!goAnywhere && settings['direction' + direction.toUpperCase()] != 0)
                return settings['direction' + direction.toUpperCase()];
            return Math.random() < 0.5 ? -1 : 1;
        };
        while (step < steps * 2) {
            step++;
            x += (dx * (step / 30)) * this.grid;
            y += (dy * (step / 30)) * this.grid;
            if (step != 1)
                path.push(',');
            path.push('' + x);
            path.push('' + y);
            if (step % 2 != 0) {
                dx = dx == 0 ? getNewDirection('x', step > 8) : 0;
                dy = dy == 0 ? getNewDirection('y', step > 8) : 0;
            }
        }
        return path.join(' ');
    };
    Squiggle.prototype.getColor = function () {
        var offset = Math.round(Math.random() * 100);
        var r = Math.sin(0.3 * offset) * 100 + 155;
        var g = Math.sin(0.3 * offset + 2) * 100 + 155;
        var b = Math.sin(0.3 * offset + 4) * 100 + 155;
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    };
    Squiggle.prototype.componentToHex = function (c) {
        var hex = Math.round(c).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    };
    return Squiggle;
}());
var App = /** @class */ (function () {
    function App(container) {
        var _this = this;
        this.squiggles = [];
        this.width = 600;
        this.height = 600;
        this.grid = 40;
        this.container = container;
        this.svg = document.getElementById('stage');
        this.onResize();
        this.tick();
        var input = new Input(this.container);
        input.moves.subscribe(function (position) {
            for (var i = 0; i < 3; i++)
                _this.createSqwigFromMouse(position);
        });
        input.starts.subscribe(function (position) { return _this.lastMousePosition = position; });
        input.ends.subscribe(function (position) { return _this.burst(true); });
        if (location.pathname.match(/fullcpgrid/i))
            setInterval(function () { return _this.burst(false); }, 1000);
        Rx.Observable.fromEvent(window, "resize").subscribe(function () { return _this.onResize(); });
    }
    App.prototype.burst = function (fromMouse) {
        if (fromMouse === void 0) { fromMouse = false; }
        for (var i = 0; i < 5; i++)
            this.createRandomSqwig(fromMouse);
    };
    App.prototype.createSqwigFromMouse = function (position) {
        var sections = 4;
        if (this.lastMousePosition) {
            var newDirection = { x: 0, y: 0 };
            var xAmount = Math.abs(this.lastMousePosition.x - position.x);
            var yAmount = Math.abs(this.lastMousePosition.y - position.y);
            if (xAmount > yAmount) {
                newDirection.x = this.lastMousePosition.x - position.x < 0 ? 1 : -1;
                sections += Math.round(xAmount / 4);
            }
            else {
                newDirection.y = this.lastMousePosition.y - position.y < 0 ? 1 : -1;
                sections += Math.round(yAmount / 4);
            }
            this.direction = newDirection;
        }
        if (this.direction) {
            var settings = {
                x: this.lastMousePosition.x,
                y: this.lastMousePosition.y,
                directionX: this.direction.x,
                directionY: this.direction.y,
                sections: sections > 20 ? 20 : sections
            };
            var newSqwig = new Squiggle(this.svg, settings, 10 + Math.random() * (sections * 1.5));
            this.squiggles.push(newSqwig);
        }
        this.lastMousePosition = position;
    };
    App.prototype.createRandomSqwig = function (fromMouse) {
        if (fromMouse === void 0) { fromMouse = false; }
        var dx = Math.random();
        if (dx > 0.5)
            dx = dx > 0.75 ? 1 : -1;
        else
            dx = 0;
        var dy = 0;
        if (dx == 0)
            dx = Math.random() > 0.5 ? 1 : -1;
        var settings = {
            x: fromMouse ? this.lastMousePosition.x : this.width / 2,
            y: fromMouse ? this.lastMousePosition.y : this.height / 2,
            directionX: dx,
            directionY: dy,
            sections: 5 + Math.round(Math.random() * 15)
        };
        var newSqwig = new Squiggle(this.svg, settings, this.grid / 2 + Math.random() * this.grid / 2);
        this.squiggles.push(newSqwig);
    };
    App.prototype.onResize = function () {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.svg.setAttribute('width', String(this.width));
        this.svg.setAttribute('height', String(this.height));
    };
    App.prototype.tick = function () {
        var _this = this;
        var step = this.squiggles.length - 1;
        while (step >= 0) {
            if (this.squiggles[step].state != SquiggleState.ended) {
                this.squiggles[step].update();
            }
            else {
                this.squiggles[step] = null;
                this.squiggles.splice(step, 1);
            }
            --step;
        }
        requestAnimationFrame(function () { return _this.tick(); });
    };
    return App;
}());
var Input = /** @class */ (function () {
    function Input(element) {
        this.mouseEventToCoordinate = function (mouseEvent) {
            mouseEvent.preventDefault();
            return {
                x: mouseEvent.clientX,
                y: mouseEvent.clientY
            };
        };
        this.touchEventToCoordinate = function (touchEvent) {
            touchEvent.preventDefault();
            return {
                x: touchEvent.changedTouches[0].clientX,
                y: touchEvent.changedTouches[0].clientY
            };
        };
        this.mouseDowns = Rx.Observable.fromEvent(element, "mousedown").map(this.mouseEventToCoordinate);
        this.mouseMoves = Rx.Observable.fromEvent(window, "mousemove").map(this.mouseEventToCoordinate);
        this.mouseUps = Rx.Observable.fromEvent(window, "mouseup").map(this.mouseEventToCoordinate);
        this.touchStarts = Rx.Observable.fromEvent(element, "touchstart").map(this.touchEventToCoordinate);
        this.touchMoves = Rx.Observable.fromEvent(element, "touchmove").map(this.touchEventToCoordinate);
        this.touchEnds = Rx.Observable.fromEvent(window, "touchend").map(this.touchEventToCoordinate);
        this.starts = this.mouseDowns.merge(this.touchStarts);
        this.moves = this.mouseMoves.merge(this.touchMoves);
        this.ends = this.mouseUps.merge(this.touchEnds);
    }
    return Input;
}());
var container = document.getElementById('app');
var app = new App(container);
;(function(){

    var icon = '<svg class="sg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 185.31 251.89"><path d="M66.8,144.17c0-66.24,22.46-113.09,80.72-112.32,81.48,1.07,80.72,46.08,80.72,112.32,0,5.15,8.38,3.81,7.62,19-2.28,19.42-9.44,14.63-10.39,19.85-9.26,51.08-40.65,88.67-77.95,88.67-37.76,0-69.47-38.53-78.28-90.58-.82-4.85-5.86-.8-6.42-18.68C61.47,146.07,66.8,149.07,66.8,144.17Z" transform="translate(-56.6 -25.84)" style="fill:#ffdfbf;fill-rule:evenodd"/><path d="M147.52,31.85C99.49,31.22,75.79,63,69,111.24c8.78-23.84,27.86-26,64.33-26.54,70.62-1.13,88.39,8.27,79.64,96.55-1.84,18.6-6.1,24.62-28.36,39.74-12.07,8.2,18.54-26.37-49.78-27-49.5-.43-30.06,36.41-40.06,29.44a81.88,81.88,0,0,1-20.28-20.73c12.89,40.76,40.76,69,73.08,69,37.3,0,68.69-37.59,77.95-88.67l2.77-38.89C228.24,77.93,229,32.91,147.52,31.85Z" transform="translate(-56.6 -25.84)" style="fill:#d0b57b;fill-rule:evenodd"/><path d="M146.13,31.84h1.39c81.48,1.07,80.72,46.08,80.72,112.33,0,5.15,8.38,3.81,7.62,19-2.28,19.42-9.44,14.63-10.39,19.85-9.26,51.08-40.65,88.67-77.95,88.67-37.76,0-69.47-38.53-78.28-90.58-.82-4.85-5.86-.8-6.42-18.68-1.34-16.39,4-13.39,4-18.29,0-65.71,22.11-112.33,79.33-112.33m0-6h0c-29.39,0-51.65,11.54-66.18,34.3C67.3,80,60.86,108.06,60.8,143.68h0c-2.54,3.05-4.94,7-4,19.12.4,12.11,2.72,16.46,6.59,19.86,9.65,56,44.19,95.07,84.11,95.07,19.91,0,38.59-9.42,54-27.25,14.35-16.57,24.87-39.79,29.66-65.45l0,0c4.22-2.57,8.87-6.53,10.58-21.1l0-.2v-.2c.58-11.55-3.35-16.18-7.07-19.61l-.53-.5v-1c0-33,0-61.46-10.76-82.11-12-23-36.09-33.89-75.88-34.41Z" transform="translate(-56.6 -25.84)" style="fill:#303030"/><path d="M118.31,183.29s4.28,4.28,12.84,4S143.67,182,143.67,182s-3.62,8.23-11.53,8.89S118.31,183.29,118.31,183.29Z" transform="translate(-56.6 -25.84)" style="fill:#bfa78f;fill-rule:evenodd"/><ellipse cx="44.24" cy="115.64" rx="28.15" ry="35.97" style="fill:#fff"/><ellipse cx="104.54" cy="115.64" rx="28.15" ry="35.97" style="fill:#fff"/><circle class="eye" id="eye-left" cx="35.9" cy="121.66" r="10.5" style="fill:#303030"/><circle class="eye" cx="94.57" cy="121.66" r="10.5" style="fill:#303030"/><path d="M140.74,236.63h0c-16.92,0-29.43-4.38-29.43-18.42h0c0-4.22,4.12-7.64,9.21-7.64H160c3.6,0,6.53,2.42,6.53,5.42v7.23C166.55,234.48,154.32,236.63,140.74,236.63Z" transform="translate(-56.6 -25.84)" style="fill:#2d251d;fill-rule:evenodd"/><path d="M160,210.57h-39.5c-5.09,0-9.21,3.42-9.21,7.64,0,.07,0,.15,0,.22,7.57,2.29,17.6,3.2,29,3.2h0c9.87,0,19.24-.52,26.25-2.36V216C166.55,213,163.62,210.57,160,210.57Z" transform="translate(-56.6 -25.84)" style="fill:#fff"/></svg>';

    document.head.insertAdjacentHTML('beforeend','<style>.sg { width: 35px; height: 35px; position: fixed; bottom: 10px; right: 10px; } .sg .eye { -webkit-transform: translateX(0px);   transform: translateX(0px); } .sg:hover .eye { -webkit-transition: -webkit-transform 0.3s ease; transition: -webkit-transform 0.3s ease; transition: transform 0.3s ease; transition: transform 0.3s ease, -webkit-transform 0.3s ease; -webkit-transform: translateX(12px);   transform: translateX(12px); }</style>');
    document.body.appendChild(a);
})();