document.addEventListener('DOMContentLoaded', function () {
  var SOURCE_COLS = 120;
  var CELL_SIZE = 10;
  var TICK_MS = 150;

  var isMobile = window.innerWidth <= 640;
  var scale = isMobile ? 2 : 1;
  var cols = SOURCE_COLS / scale;

  var canvas = document.getElementById('lifeCanvas');
  var ctx = canvas.getContext('2d');
  var mapSelect = document.getElementById('mapSelect');
  var statusEl = document.getElementById('gameStatus');
  var playPauseBtn = document.getElementById('playPauseBtn');

  var colorDead = '#14171F';
  var colorLive = '#4FBFAE';
  var colorGrid = '#2C3242';

  var rows, grid, nextGrid, paused, tickHandle;

  function parseMap(text) {
    var lines = text.split('\n').filter(function (line) { return line.length > 0; });
    rows = Math.floor(lines.length / scale);
    canvas.width = cols * CELL_SIZE;
    canvas.height = rows * CELL_SIZE;

    grid = [];
    for (var i = 0; i < cols; i++) {
      grid.push(new Array(rows).fill(false));
    }

    for (var x = 0; x < cols; x++) {
      for (var y = 0; y < rows; y++) {
        var alive = false;
        for (var bx = 0; bx < scale && !alive; bx++) {
          for (var by = 0; by < scale && !alive; by++) {
            var line = lines[y * scale + by];
            if (line && line[x * scale + bx] === 'X') alive = true;
          }
        }
        grid[x][y] = alive;
      }
    }
    nextGrid = grid.map(function (col) { return col.slice(); });
  }

  function countLiveNeighbors(x, y) {
    var count = 0;
    for (var i = x - 1; i <= x + 1; i++) {
      for (var j = y - 1; j <= y + 1; j++) {
        if ((i !== x || j !== y) && i >= 0 && i < cols && j >= 0 && j < rows) {
          if (grid[i][j]) count++;
        }
      }
    }
    return count;
  }

  function step() {
    for (var x = 0; x < cols; x++) {
      for (var y = 0; y < rows; y++) {
        var neighbors = countLiveNeighbors(x, y);
        if (grid[x][y]) {
          nextGrid[x][y] = neighbors === 2 || neighbors === 3;
        } else {
          nextGrid[x][y] = neighbors === 3;
        }
      }
    }
    var swap = grid;
    grid = nextGrid;
    nextGrid = swap;
  }

  function render() {
    ctx.fillStyle = colorDead;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = colorLive;
    for (var x = 0; x < cols; x++) {
      for (var y = 0; y < rows; y++) {
        if (grid[x][y]) {
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
        }
      }
    }

    ctx.strokeStyle = colorGrid;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    for (var gx = 0; gx <= cols; gx++) {
      ctx.moveTo(gx * CELL_SIZE, 0);
      ctx.lineTo(gx * CELL_SIZE, canvas.height);
    }
    for (var gy = 0; gy <= rows; gy++) {
      ctx.moveTo(0, gy * CELL_SIZE);
      ctx.lineTo(canvas.width, gy * CELL_SIZE);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function updateStatus() {
    statusEl.textContent = paused ? 'Pausado' : 'Reproduciendo';
  }

  function startTicking() {
    stopTicking();
    tickHandle = setInterval(function () {
      step();
      render();
    }, TICK_MS);
  }

  function stopTicking() {
    if (tickHandle) {
      clearInterval(tickHandle);
      tickHandle = null;
    }
  }

  function setPaused(value) {
    paused = value;
    if (paused) stopTicking(); else startTicking();
    updateStatus();
    updatePlayPauseButton();
  }

  function updatePlayPauseButton() {
    playPauseBtn.classList.toggle('is-paused', paused);
    playPauseBtn.classList.toggle('is-playing', !paused);
    playPauseBtn.setAttribute('aria-label', paused ? 'Reproducir' : 'Pausar');
  }

  function loadMap(file) {
    setPaused(true);
    fetch('maps/' + file)
      .then(function (res) { return res.text(); })
      .then(function (text) {
        parseMap(text);
        render();
      });
  }

  canvas.addEventListener('click', function (evt) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var x = Math.floor((evt.clientX - rect.left) * scaleX / CELL_SIZE);
    var y = Math.floor((evt.clientY - rect.top) * scaleY / CELL_SIZE);
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      grid[x][y] = !grid[x][y];
      render();
    }
  });

  document.addEventListener('keydown', function (evt) {
    if (evt.key === 'p' || evt.key === 'P') {
      setPaused(!paused);
    }
  });

  mapSelect.addEventListener('change', function () {
    loadMap(mapSelect.value);
  });

  playPauseBtn.addEventListener('click', function () {
    setPaused(!paused);
  });

  paused = true;
  loadMap(mapSelect.value);
});
