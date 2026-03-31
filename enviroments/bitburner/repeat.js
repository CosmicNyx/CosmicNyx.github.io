/** @param {NS} ns */
export async function main(ns) {
    const command = "autoHack.js";  // script to run
    const target  = "joesguns";     // target argument
    const times   = 5;              // how many times to run it

    for (let i = 0; i < times; i++) {
        ns.run(command, 1, target);
    }
}
