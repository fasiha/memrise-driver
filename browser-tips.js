
{
  var sections = Array.from(document.querySelectorAll('div.level-header h3.level-name'), x => x.innerText);
  var nrowsPerSec =
      Array.from(document.querySelectorAll('div.level[data-level-id]'), x => x.querySelectorAll('tr.thing').length);
  var rowsPerSec =
      Array.from(document.querySelectorAll('div.level[data-level-id]'),
                 x => Array.from(x.querySelectorAll('tr.thing'),
                                 x => Array.from(x.querySelectorAll('td.cell.text[data-key]'), x => x.innerText)));

  var md = '';
  for (let i = 0; i < sections.length; i++) {
    md += `\n# ${sections[i]}\n`;
    for (let row of rowsPerSec[i]) { md += `## ${row.slice(0, 3).join(' @ ')}\n`; }
  }
  copy(md);
  var allrows = rowsPerSec.reduce((p, c) => p.concat(c), []);
}

{
  var md = ``;
  // md = `paste`
  var mdrows =
      md.split('\n').filter(s => s.startsWith("## ")).map(s => s.replace(/^## /, '').split('@').map(s => s.trim()));
  var rows =
      Array.from(document.querySelectorAll('tr.thing'), x => Array.from(x.querySelectorAll('td.cell.text[data-key]')));

  var is = [183, 184, 185];
  is = Array.from(rows, (_, i) => i);
  for (let i of is) {
    for (let j = 0; j < 3; j++) {
      var td = rows[i][j];
      var val = mdrows[i][j];
      if (td.innerText === val) { continue; }
      td.querySelector('div.text').click();
      td.querySelector('input').value = val;
      td.querySelector('input').dispatchEvent(new Event('blur', {bubbles: true}));
    }
  }
}

{

  var tds = document.querySelectorAll('tr td.cell.text.attribute[data-key]');
  tds.forEach((td, i) => {
    td.querySelector('div.text').click();
    td.querySelector('input').value = es[i];
    td.querySelector('input').dispatchEvent(new Event('blur', {bubbles: true}));
  })

  Array.from(document.getElementsByClassName('show-hide btn btn-small')).forEach(x => x.click())
  var tds = document.querySelectorAll('tr td.cell.text.column[data-key="1"]');
  tds.forEach((td, i) => {
    td.querySelector('div.text').click();
    var v = td.querySelector('input').value;
    if (v.endsWith(')')) { td.querySelector('input').value = v.trim().slice(0, -1).split(/\s*\(/).join('＋'); }
    td.querySelector('input').dispatchEvent(new Event('blur', {bubbles: true}));
  })

  var tds = document.querySelectorAll('tr td.cell.text.attribute[data-key="1"]');
  tds.forEach((td, i) => {
    td.querySelector('div.text').click();
    var v = td.querySelector('input').value;
    td.querySelector('input').value = v.replace(/ thus/g, '');
    td.querySelector('input').dispatchEvent(new Event('blur', {bubbles: true}));
  })
}