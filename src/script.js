const APP_KEY = "tiny-best-set-games";
const INCREMENT_THUMBS = 12;
const filterValues = {};
let sortByField = "name";
let filters = {
  platform: { render: _ => {
    //const platformMap = games.reduce((prev, curr) => (prev[curr.platform] = (prev[curr.platform] || 0) + 1, prev), {});
    const { platformMap } = data;
    const value = filters.platform.value || "";
    return `<div>
      <strong>Platform:</strong>
      <select onchange="setFilter('platform', this.value)" value="${value || ""}">
        <option value="">- All -</option>
        ${Object.keys(platformMap).sort().map(p => `<option value="${p}"${value === p ? " selected":""}>${p} (${platformMap[p].count})</option>`).join``}
      </select>
    </div>`;
  }},
  set: { render: _ => {
    const setMap = games.reduce((prev, curr) => (prev[curr.set] = (prev[curr.set] || 0) + 1, prev), {});
    const value = filters.set.value || "";
    return `<div>
      <strong>Set:</strong>
      <select onchange="setFilter('set', this.value)" value="${value}">
        <option value="">- All -</option>
        ${Object.keys(setMap).map(p => `<option value="${p}"${value === p ? " selected":""}>${p} (${setMap[p]})</option>`).join``}
      </select>
    </div>`;
  }},
  viewToggle: {
    render: _ => `<div>
      <label><input type="checkbox" onchange="setIsThumbView(this.checked)"> Show Thumbnails</label>
    </div>`
  }
};

let filterTags = [];
let filterPlatforms = [];
let games = [];
let filtered = [];
let isThumbView = false;
let thumbs = 20;

const getPlatformColor = platform => {
  if (platform.startsWith("Nintendo -")) return "danger";
  else if (platform.startsWith("NEC -")) return "success";
  else if (platform.startsWith("SNK -")) return "info";
  else if (platform.startsWith("Sony -")) return "secondary";
  else if (platform.startsWith("Atari -")) return "warning";
  else if (platform.startsWith("Sega -")) return "muted text-dark";
  else if (platform.startsWith("Arcade ")) return "dark";
  return "secondary";
};

setFilter = (name, value) => (thumbs = INCREMENT_THUMBS, filters[name].value = isNaN(value) ? value : parseInt(value), render());

setIsThumbView = isThumb => (thumbs = INCREMENT_THUMBS, isThumbView = isThumb, render());

cap = s => s.charAt(0).toUpperCase() + s.substr(1);

renderFilters = _ => filterPanel.innerHTML = Object.keys(filters).map(name => filters[name].render()).join`` + "<div></div>";

render = () => {
  const search = searchInput.value;
  const filterKeys = Object.keys(filters);
  const filtersSet = filterKeys.filter(f => filters[f].value).length;
  filtered = games.filter(g => (
    (!search || g.name.toLowerCase().includes(search.toLowerCase()))
    && (!filtersSet || filterKeys.filter(name => filters[name].value && g[name] === filters[name].value).length === filtersSet)
    && (filterTags.length === 0 || (filterTags.length > 0 && g.tags && filterTags.find(tag => g.tags.includes(tag))))
  ));
  count.innerHTML = filtered.length;
  tableView.style.display = isThumbView ? "none" : "";
  thumbView.style.display = !isThumbView ? "none" : "";
  if (isThumbView) {
    thumbView.innerHTML = filtered.map((g, i) => i >= thumbs ? "" : (
      `<div class="masonry-item">
        <div class="card card-body">
          <div>${getGameImg(g, 175)}</div>
          <div><a href="#" onclick="return openGame('${g.name.replace(/'/g, "\\'")}')">${g.name}</a></div>
          <div><span class="badge bg-${getPlatformColor(g.platform)}">${g.platform || '-'}</span></div>
          <div>${g.set || '-'}GB</div>
          <div>${showTags(g, true)}</div>
        </div>
      </div>`
    )).join``;
  }
  else {
    header.innerHTML = Object.keys(games[0]).map(k => `<th>${cap(k)}</th>`).join``;
    o.innerHTML = filtered.map(g => (
      `<tr>
        <td><a href="#" onclick="return openGame('${g.name.replace(/'/g, "\\'")}')">${g.name}</a></td>
        <td><span class="badge bg-${getPlatformColor(g.platform)}">${g.platform || '-'}</span></td>
        <td>${g.set || '-'}GB</td>
        <td>${showTags(g, true)}</td>
      </tr>`
    )).join``;
  }
  filterTagsElem.innerHTML = !filterTags.length ? "" : "Filter Tags: "
    + filterTags.map(t => `<button class="btn badge bg-info mr-1" onclick="removeTag('${t}')" title="Remove">${t}</button>`).join``;
};

onload = () => {
  // const str = localStorage.getItem(APP_KEY);
  // games = str ? JSON.parse(str) : data.games;
  window.addEventListener("scroll", () => {
    if (!isThumbView) return;
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    // Calculates the height of the client viewport, adjusted for the device's pixel ratio
    const clientHeight = document.documentElement.clientHeight * window.devicePixelRatio;
    if (scrollTop + clientHeight >= scrollHeight) {
      if (thumbs < filtered.length) {
        thumbs = Math.min(thumbs + INCREMENT_THUMBS, filtered.length);
        render();
      }
    }
  });
  games = data.games;
  renderFilters(games);
  render();
};

const editTags = (id, tagsStr) => {
  const g = games.find(a => a.id === id);
  const tagsElem = document.getElementById("tagsElem");
  if (tagsStr) {
    //apply tags
    g.tags = tagsStr.split(",").map(s => s.trim());
    localStorage.setItem(APP_KEY, JSON.stringify(games));
    tagsElem.innerHTML = showTags(g);
    render();
  }
  else {
    //show edit form
    tagsElem.innerHTML = `<input type="text" class="form-control" value="${g.tags ? g.tags.join(", ") : ""}" onkeypress="if (event.keyCode === 13) editTags(${g.id}, this.value);"/>`;
    tagsElem.getElementsByTagName("input")[0].focus();
  }
  return false;
};

const filterByTag = tag => {
  filterTags.push(tag);
  filterTags = Array.from(new Set(filterTags));
  render();
};

const removeTag = tag => {filterTags = filterTags.filter(t => t !== tag); render()};

const showTags = (g, hideEditBtn) => ((!g.tags || g.tags.length === 0) ? "n/a" : (
  g.tags.map(s => `<button onclick="filterByTag('${s}')" class="btn badge bg-secondary mx-1">${s}</button>`).join``
))
+ (hideEditBtn ? "" : `<a href="#" onclick="return editTags(${g.id})">✏️</a>`);

const viewBtn = (g, isPrev) => (
  g ? `<button class="m-2 btn btn-primary" onclick="return openGame('${g.name}')">${isPrev ? "⬅" : "➡"}</button>` : ""
);

const getPlatform = platform => data.platformMap[platform] || null;

const openGame = name => {
  const index = filtered.findIndex(a => a.name === name);
  const g = filtered[index];
  const prev = index >= 0 ? filtered[index - 1] : null;
  const next = index < filtered.length - 1 ? filtered[index + 1] : null;
  const { dir, mobyName } = getPlatform(g.platform);
  c.innerHTML = `
  <div class="justify-content-between d-flex">
    <h3>${g.name}</h3>
  </div>

  <div class="my-2">
    <div><b>Platform:</b> ${g.platform}</div>
    <div><b>Set:</b> ${g.set}GB</div>
    <b>Tags:</b> <span id="tagsElem">${showTags(g)}</span>
  </div>

  <div class="mt-2 mx-auto">
    ${getGameImg(g, 300)}
  </div>

  <div class="text-center">
    ${viewBtn(prev, true)}
    <a href="https://www.mobygames.com/game/platform:${mobyName}/title:${g.name.replace(/ \([\s\S]*?\)/g, '')}/sort:moby_score/"
      target="_blank" class="m-2 btn btn-primary" title="Find on Moby Games">🔎 Find Game</a>
    ${viewBtn(next)}
  </div>`;
  d.showModal();
  return false;
};

const BASE_URL = "http://lewdev.brinkster.net/apps/tiny-best-set/Roms";
const getGameImg = (g, width) => {
  const { gameToRomName } = data;
  const { dir } = getPlatform(g.platform);
  const friendlyName = fileFriendly(g.name);
  const nameNoParen = removeParenthesisAndContents(g.name);
  const filename = (dir === "ARCADE" && (gameToRomName[nameNoParen] || gameToRomName[friendlyName])) || friendlyName;
  const src = ` src="${BASE_URL}/${dir}/Imgs/${filename}.png"`;
  const displayWidth = width ? ` width="${width}"` : "";
  const title = ` title="${dir} / ${filename}"`;
  return `<img class="d-block mx-auto"${src + displayWidth + title} onerror="this.src='${BASE_URL}/image-not-found.png'">`
};

const fileFriendly = s => s.replace(/\s*:/g, " -").replace(/[\?°]/g, "");
const removeParenthesisAndContents = s => fileFriendly(s).replace(/\s*\([\w\-,\.\d\s/\[\]]+\)/g, "");