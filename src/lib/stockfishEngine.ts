const stockfishScriptUrl = '/stockfish/stockfish-18-lite-single.js';

export type EngineStatus = 'idle' | 'loading' | 'ready' | 'fallback';

type PendingSearch = {
  resolve: (move: string | null) => void;
  timeout: number;
};

class StockfishEngine {
  private readonly worker: Worker;
  private readonly ready: Promise<void>;
  private pendingSearch?: PendingSearch;

  constructor() {
    this.worker = new Worker(stockfishScriptUrl);
    this.ready = new Promise((resolve, reject) => {
      let retry: number;
      const stopHandshake = () => {
        window.clearInterval(retry);
        window.clearTimeout(timeout);
      };
      const timeout = window.setTimeout(() => {
        stopHandshake();
        reject(new Error('Stockfish startup timed out'));
      }, 15_000);
      const handleReady = (event: MessageEvent<string>) => {
        if (event.data === 'uciok') {
          stopHandshake();
          this.worker.removeEventListener('message', handleReady);
          resolve();
        }
      };
      this.worker.addEventListener('message', handleReady);
      this.worker.addEventListener('error', () => {
        stopHandshake();
        reject(new Error('Stockfish failed to load'));
      }, { once: true });
      this.worker.postMessage('uci');
      retry = window.setInterval(() => this.worker.postMessage('uci'), 750);
    });
    this.worker.addEventListener('message', (event: MessageEvent<string>) => {
      if (!event.data.startsWith('bestmove ') || !this.pendingSearch) return;
      const move = event.data.split(' ')[1];
      window.clearTimeout(this.pendingSearch.timeout);
      this.pendingSearch.resolve(move === '(none)' ? null : move);
      this.pendingSearch = undefined;
    });
    this.worker.addEventListener('error', () => {
      if (!this.pendingSearch) return;
      window.clearTimeout(this.pendingSearch.timeout);
      this.pendingSearch.resolve(null);
      this.pendingSearch = undefined;
    });
  }

  async findMove(fen: string, elo: number): Promise<string | null> {
    await this.ready;
    return new Promise((resolve) => {
      const timeout = window.setTimeout(() => {
        this.worker.postMessage('stop');
        this.pendingSearch = undefined;
        resolve(null);
      }, 5_000);
      this.pendingSearch = { resolve, timeout };
      const engineElo = Math.max(1320, Math.min(3190, elo));
      const maximumStrength = elo >= 3200;
      this.worker.postMessage(`setoption name UCI_LimitStrength value ${maximumStrength ? 'false' : 'true'}`);
      if (maximumStrength) {
        this.worker.postMessage('setoption name Skill Level value 20');
      } else {
        this.worker.postMessage(`setoption name UCI_Elo value ${engineElo}`);
      }
      this.worker.postMessage(`position fen ${fen}`);
      const thinkTime = Math.round(300 + (Math.min(elo, 3200) / 3200) * 900);
      this.worker.postMessage(`go movetime ${thinkTime}`);
    });
  }

  terminate() {
    this.worker.terminate();
  }
}

let searchQueue = Promise.resolve<string | null>(null);

function addBeginnerMistakes(bestMove: string | null, legalMoves: string[], elo: number): string | null {
  if (!bestMove || elo >= 1320) return bestMove;
  const accuracy = Math.max(0, (elo - 100) / 1220);
  if (Math.random() <= accuracy || legalMoves.length === 0) return bestMove;
  return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}

export function findStockfishMove(fen: string, elo: number, legalMoves: string[]): Promise<string | null> {
  searchQueue = searchQueue.catch(() => null).then(async () => {
    const engine = new StockfishEngine();
    try {
      return await engine.findMove(fen, elo);
    } finally {
      engine.terminate();
    }
  });
  return searchQueue.then((move) => addBeginnerMistakes(move, legalMoves, elo));
}
