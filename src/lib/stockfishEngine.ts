const stockfishScriptUrl = '/stockfish/stockfish-18-lite-single.js';

export const STOCKFISH_MIN_ELO = 1300;
export const STOCKFISH_MAX_ELO = 3200;

export type EngineStatus = 'idle' | 'loading' | 'ready' | 'fallback';

type PendingSearch = {
  resolve: (result: EngineAnalysis) => void;
  reject: (error: Error) => void;
  timeout: number;
  scoreCp?: number;
  depth: number;
};

export type EngineAnalysis = {
  bestMove: string | null;
  scoreCp: number | null;
  depth: number;
};

export class StockfishEngine {
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
      const score = event.data.match(/\bdepth (\d+).*\bscore (cp|mate) (-?\d+)/);
      if (score && this.pendingSearch) {
        const depth = Number(score[1]);
        if (depth >= this.pendingSearch.depth) {
          const value = Number(score[3]);
          this.pendingSearch.depth = depth;
          this.pendingSearch.scoreCp = score[2] === 'mate'
            ? Math.sign(value) * (100_000 - Math.abs(value))
            : value;
        }
      }
      if (!event.data.startsWith('bestmove ') || !this.pendingSearch) return;
      const move = event.data.split(' ')[1];
      window.clearTimeout(this.pendingSearch.timeout);
      this.pendingSearch.resolve({
        bestMove: move === '(none)' ? null : move,
        scoreCp: this.pendingSearch.scoreCp ?? null,
        depth: this.pendingSearch.depth,
      });
      this.pendingSearch = undefined;
    });
    this.worker.addEventListener('error', () => {
      if (!this.pendingSearch) return;
      window.clearTimeout(this.pendingSearch.timeout);
      this.pendingSearch.resolve({ bestMove: null, scoreCp: null, depth: 0 });
      this.pendingSearch = undefined;
    });
  }

  async findMove(fen: string, elo: number): Promise<string | null> {
    await this.ready;
    const engineElo = Math.max(STOCKFISH_MIN_ELO, Math.min(STOCKFISH_MAX_ELO, elo));
    const strengthProgress = (engineElo - STOCKFISH_MIN_ELO)
      / (STOCKFISH_MAX_ELO - STOCKFISH_MIN_ELO);
    const thinkTime = Math.round(1_400 + strengthProgress * 3_600);
    const isTrainingLevel = engineElo === STOCKFISH_MIN_ELO;
    this.worker.postMessage(`setoption name UCI_LimitStrength value ${isTrainingLevel ? 'true' : 'false'}`);
    this.worker.postMessage(isTrainingLevel
      ? 'setoption name UCI_Elo value 1320'
      : 'setoption name Skill Level value 20');
    const result = await this.search(fen, `go movetime ${thinkTime}`, 9_000);
    return result.bestMove;
  }

  async analyze(fen: string, depth: number): Promise<EngineAnalysis> {
    await this.ready;
    this.worker.postMessage('setoption name UCI_LimitStrength value false');
    return this.search(fen, `go depth ${depth}`, 12_000);
  }

  private search(fen: string, command: string, timeoutMs: number): Promise<EngineAnalysis> {
    return new Promise((resolve, reject) => {
      let search: PendingSearch;
      const timeout = window.setTimeout(() => {
        this.worker.postMessage('stop');
        window.setTimeout(() => {
          if (this.pendingSearch !== search) return;
          this.pendingSearch = undefined;
          search.reject(new Error('Stockfish search timed out'));
        }, 1_000);
      }, timeoutMs);
      search = { resolve, reject, timeout, depth: 0 };
      this.pendingSearch = search;
      this.worker.postMessage(`position fen ${fen}`);
      this.worker.postMessage(command);
    });
  }

  terminate() {
    if (this.pendingSearch) {
      window.clearTimeout(this.pendingSearch.timeout);
      this.pendingSearch.resolve({ bestMove: null, scoreCp: null, depth: 0 });
      this.pendingSearch = undefined;
    }
    this.worker.terminate();
  }
}

let searchQueue = Promise.resolve<string | null>(null);

export function findStockfishMove(fen: string, elo: number): Promise<string | null> {
  searchQueue = searchQueue.catch(() => null).then(async () => {
    const engine = new StockfishEngine();
    try {
      return await engine.findMove(fen, elo);
    } finally {
      engine.terminate();
    }
  });
  return searchQueue;
}
