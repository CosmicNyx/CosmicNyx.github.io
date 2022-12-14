let a = ["shy","hi","hi","die","hi","die","shy"];
let b = []
let counter= 0
let len = a.length

for (let i = 0; i < len; i++) {
    if (b.indexOf(a[i]) === -1){
        b.push(a[i])
    }
}

console.log(b)