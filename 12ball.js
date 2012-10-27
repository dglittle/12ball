
require('fibers')
require('./myutil')

/*

balls
    q : // unknowns
    d : // downers
    u : // uppers
    n : // normals

*/

ballTypes = ["q", "d", "u", "n"]

function generateSubsets(balls, size) {
    return Fiber(function () {
        for (var q = 0; q <= balls.q && q <= size; q++) {
            for (var d = 0; d <= balls.d && q + d <= size; d++) {
                for (var u = 0; u <= balls.u && q + d + u <= size; u++) {
                    var n = size - (q + d + u)
                    if (n <= balls.n) {
                        yield({ q : q, d : d, u : u, n : n })
                    }
                }
            }
        }
    })
}

function addBalls(balls, sub, scale) {
    if (scale === undefined) scale = 1
    foreach(ballTypes, function (t) {
        balls[t] += sub[t] * scale
    })
}

function useScale(left, right, off) {
    var ret = []
    function infer(balls) {
        if (balls.q == 0 && (balls.d + balls.u <= 1)) {
            return
        }
        ret.push(balls)
    }
    infer({
        q : 0,
        d : left.d + left.q,
        u : right.u + right.q,
        n : left.u + right.d + left.n + right.n + sum(off)
    })
    infer({
        q : 0,
        d : right.d + right.q,
        u : left.u + left.q,
        n : right.u + left.d + left.n + right.n + sum(off)
    })
    infer({
        q : off.q,
        d : off.d,
        u : off.u,
        n : sum(left) + sum(right) + off.n
    })
    return ret
}

function foreachGen(gen, func) {
    var s
    while (s = gen.run()) {
        func(s)
    }
}

function getMinWeighings(balls, weighingsSoFar, printAt) {
    if (weighingsSoFar === undefined) weighingsSoFar = 0
    if (weighingsSoFar == 3) return 4
    var best = 4
    var total = sum(balls)
    for (var size = 1; size <= Math.floor(total / 2); size++) {
        foreachGen(generateSubsets(balls, size), function (s1) {
            addBalls(balls, s1, -1)
            foreachGen(generateSubsets(balls, size), function (s2) {
                addBalls(balls, s2, -1)
                var out = useScale(s1, s2, balls)
                
                if (out.length == 0) {
                    var thatBest = weighingsSoFar + 1
                } else {
                    var thatBest = max(map(out, function (e) { return getMinWeighings(e, weighingsSoFar + 1) }))
                }
                if (thatBest < best) {
                    best = thatBest
                    if (printAt == best) {
                        console.log("s1 = " + json(s1))
                        console.log("s2 = " + json(s2))
                        console.log("off = " + json(balls))
                        var thatBest = max(map(out, function (e) { return getMinWeighings(e, weighingsSoFar + 1, printAt - 1) }))
                    }
                }
                
                addBalls(balls, s2, 1)
            })
            addBalls(balls, s1, 1)
        })
    }
    return best
}

var n = getMinWeighings({ q : 12, d : 0, u : 0, n : 0 }, 0)
console.log("n = " + n)

