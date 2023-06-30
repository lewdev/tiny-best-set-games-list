let data = null;
let searchStr = selectedPlatform = selectedParenthesis = "";
let parenthesisMap = {};
let parenthesisList = null;

onload = () => {
  fetch("tiny-best-set-games.json").then(r => r.json()).then(d => { data = d; render(); });
};

const elem = (tag, innerHTML) => `<${tag}>${innerHTML}</${tag}>`;

const dropdown = (label, options) => `<div class="col-4">
  <div>${elem("strong", label)}:</div>
  <select id="${label}" onchange="selected${label} = event.target.value; render()">
    <option value="">- All -</option>
    ${options.map(p => `<option value="${p.value}">${p.label}</option>`)}
  </select>
</div>`;

const filter = () => data.games.filter(g => (!searchStr || g.name.contains(searchStr)
  && (!selectedPlatform || g.platform === selectedPlatform)
  && (!selectedParenthesis || g.parenthesis.contains(selectedParenthesis))
));

const cols = ["name", "platform", "set"];
const render = () => {
  selectedPlatform = (document.getElementById("Platform") || {}).value;
  filters.innerHTML = dropdown("Platform",
    Object.keys(data.platformMap).map(p => ({value: p, label: `${p} (${data.platformMap[p]})`}))
  );
  o.innerHTML = elem("thead", elem("tr", cols.map(c => elem("th", c)).join``))
  + elem("tbody", filter().map(g => elem("tr", cols.map(c => elem("td", g[c])).join``)).join``);
};