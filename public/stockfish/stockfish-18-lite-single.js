/* Stockfish 18 browser worker bootstrap. The engine reads this worker's URL to locate its WASM file. */
self.onmessage = null;
importScripts('./stockfish-18-lite-single-core.js');
