# just a playground for code snippets
a = []
o1 = 'foo'
o2 = 'bar'
a.push o1
a.push o2

console.log "len: "+a.length
console.log a

i1 = a.indexOf o1
i2 = a.indexOf o2

a=a.filter (o) -> o!=o1
console.log "len: "+a.length
console.log a

a=a.filter (o) -> o!=o2
console.log "len: "+a.length
console.log a