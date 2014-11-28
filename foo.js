(function() {
var a, i1, i2, o1, o2;

a = [];

o1 = 'foo';

o2 = 'bar';

a.push(o1);

a.push(o2);

console.log("len: " + a.length);

console.log(a);

i1 = a.indexOf(o1);

i2 = a.indexOf(o2);

a = a.filter(function(o) {
  return o !== o1;
});

console.log("len: " + a.length);

console.log(a);

a = a.filter(function(o) {
  return o !== o2;
});

console.log("len: " + a.length);

console.log(a);


}).call(this);

//# sourceMappingURL=foo.map