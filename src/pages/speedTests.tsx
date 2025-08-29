import { useEffect, useState } from "react";
import SpeedTest from "@cloudflare/speedtest";

// 📌 Creamos la interfaz según lo que devuelve getSummary()
interface SpeedTestSummary {
  download: number;
  upload: number;
  latency: number;
  jitter: number;
  downLoadedLatency: number;
  downLoadedJitter: number;
  upLoadedLatency: number;
  upLoadedJitter: number;
}

// 📌 Creamos un tipo para el resultado de SpeedTest
interface SpeedTestResult {
  getSummary: () => SpeedTestSummary;
}

function SpeedTests() {
  const [results, setResults] = useState<SpeedTestSummary | null>(null);

  useEffect(() => {
    const st = new SpeedTest();

    // ✅ Tipamos res como SpeedTestResult en lugar de any
    (st as any).onFinish = (res: SpeedTestResult) => {
  const summary = res.getSummary();
  setResults(summary);
  };

    st.play();

    
  }, []);

  return (
    <div>
      <h2>Resultados SpeedTest</h2>
      {results ? (
        <ul>
          <li><strong>Descarga:</strong> {(results.download / 1e6).toFixed(2)} Mbps</li>
          <li><strong>Subida:</strong> {(results.upload / 1e6).toFixed(2)} Mbps</li>
          <li><strong>Latencia:</strong> {results.latency.toFixed(2)} ms</li>
          <li><strong>Jitter:</strong> {results.jitter.toFixed(2)} ms</li>
        </ul>
      ) : (
        <p>Ejecutando test...</p>
      )}
    </div>
  );
}

export default SpeedTests;
