export default {
    times (n, block) {
        var accum = ''
        for (let i = 0; i < n; i++) {
            accum += block.fn(i)
        }
        return accum
    }
}