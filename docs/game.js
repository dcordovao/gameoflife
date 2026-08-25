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

  var colorDead = '#14171F';
  var colorLive = '#4FBFAE';
  var colorLiveFlash = '#E7A33E';
  var colorGrid = '#2C3242';

  var rows, grid, nextGrid, paused, flashMode, flashPhase, tickHandle;

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
    flashPhase = !flashPhase;
  }

  function render() {
    ctx.fillStyle = colorDead;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var liveColor = flashMode && flashPhase ? colorLiveFlash : colorLive;
    ctx.fillStyle = liveColor;
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
    statusEl.textContent = (paused ? 'Pausado' : 'Reproduciendo') + (flashMode ? ' · parpadeo activo' : '');
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
    } else if (evt.key === 'e' || evt.key === 'E') {
      flashMode = !flashMode;
      updateStatus();
      render();
    }
  });

  mapSelect.addEventListener('change', function () {
    loadMap(mapSelect.value);
  });

  paused = true;
  flashMode = false;
  flashPhase = false;
  loadMap(mapSelect.value);
});
