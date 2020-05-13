export class SequencePlayer {
    constructor(seq) {
        this.seq = seq;
        this.time = 0;
        this.current = 0;
        this.over = false;
    }
    continue(dTime) {
        this.time += dTime;
        let q = this.seq;
        while (q[this.current][0] < this.time) {
            q[this.current][1]();
            this.current++;
            if (this.current >= q.length) {
                this.over = true;
                if (this.onEnd) {
                    this.onEnd();
                }
                return false;
            }
        }
        return true;
    }
    play(timeScale = 1000) {
        let last = 0;
        let self = this;
        function step(timestamp) {
            let dTime = last ? timestamp - last : 0;
            last = timestamp;
            if (self.continue(dTime / timeScale))
                requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
}
function toNumber(bit) {
    let splitAt = bit.search("/");
    let num = 0;
    if (splitAt >= 0) {
        num =
            (splitAt == 0 ? 1 : Number(bit.substr(0, splitAt))) /
                Number(bit.substr(splitAt + 1));
    }
    else {
        num = Number(bit);
    }
    return num;
}
export class SequenceBuilder {
    constructor(str, lib, timeScale = 1) {
        this.seq = [];
        str = str.replace(/([a-zA-Z_][a-zA-Z_0-9]+)\(([^)]+)\)/g, (m, a, b) => `${a}(${b.replace(/ /g, "")})`);
        let split = str.trim().split(" ");
        let time = 0;
        for (let bit of split) {
            let isEffect = bit.search(/[a-zA-Z_]/) >= 0;
            if (isEffect) {
                let fields = bit.match(/([a-zA-Z_][a-zA-Z_0-9]+)\(([^)]+)\)/) || [null, bit, null];
                let effect = lib[fields[1]];
                if (effect instanceof Function) {
                    if (fields[2]) {
                        let args = fields[2].split(",");
                        this.seq.push([time, () => { effect(...args); }]);
                    }
                    else
                        this.seq.push([time, effect]);
                }
                else {
                    this.mix(effect, time);
                }
            }
            else {
                time += timeScale * toNumber(bit);
            }
        }
    }
    mix(other, delay = 0) {
        this.seq = this.seq.concat((other instanceof SequenceBuilder ? other.seq : other).map(([t, f]) => [
            t + delay,
            f,
        ]));
        this.seq.sort((a, b) => a[0] - b[0]);
        return this;
    }
    static build(str, lib, timeScale = 1) {
        return new SequenceBuilder(str, lib, timeScale).seq;
    }
}
export class SequenceCollection {
    constructor(lib = {}, program = "") {
        this.lib = lib;
        if (program) {
            program.split("\n").map(s => {
                let line = s.trim().split(":");
                if (line.length == 2)
                    this.add(line[0], line[1]);
            });
        }
    }
    add(id, seqCode) {
        this.lib[id] = new SequenceBuilder(seqCode, this.lib).seq;
        return this;
    }
    seq(id) {
        return this.lib[id];
    }
}
export default function sequencer(lib = {}, program = "") {
    let collection = new SequenceCollection(lib, program);
    return (sequence) => new SequencePlayer(new SequenceBuilder(sequence, collection.lib).seq);
}
