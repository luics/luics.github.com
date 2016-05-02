var line;
for (var i = 1; i <= 9; i++) {
  line = [];
  for (var j = 1; j <= 9; j++) {
    line.push(i + 'x' + j + '=' + (i * j));
    line.push('\t');
  }
  console.log(line.join(''));
}
