# Game of Life

Implementación del autómata celular de Conway (nace con 3 vecinos vivos, sobrevive con 2 o 3,
sin wrap-around en los bordes).

**Jugar en el navegador:** [games.cordovacodes.com](https://games.cordovacodes.com)

## Versiones

- **C++ / SDL2** (`gameoflife.cpp`, `Makefile`, `Images/`): la versión original, con ventana nativa
  y sprites `.bmp`. Requiere SDL2 instalado; compila con `make`.
- **JavaScript / Canvas** (`docs/`): puerto para navegador, sin dependencias ni build step. Dibuja
  las celdas directo en `<canvas>` en vez de reusar los sprites `.bmp` del original. Es lo que se
  publica en GitHub Pages (carpeta `docs/`) bajo el dominio `games.cordovacodes.com`.

Ambas versiones comparten los mismos mapas iniciales (`Maps/` para C++, `docs/maps/` para la web —
mismo contenido) y los mismos controles: click para alternar una celda, `P` pausa/reproduce, `E`
activa el modo parpadeo.

## Compilar la versión C++

```
make
./gameoflife
```

## Correr la versión web en local

Es HTML/CSS/JS plano — cualquier servidor estático sirve, por ejemplo:

```
cd docs
python3 -m http.server 8080
```

y abrir `http://localhost:8080`.
