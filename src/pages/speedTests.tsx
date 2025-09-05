import { useState, useRef, useEffect } from "react";
import { measurePing, measureDownloadSpeed } from "../js/request";
import type { SpeedTestCallbacks } from "../js/request";

function SpeedTests() {
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const [testPhase, setTestPhase] = useState<'idle' | 'ping' | 'download' | 'complete'>('idle');
  const [ping, setPing] = useState<number | null>(null);
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [animatedSpeed, setAnimatedSpeed] = useState(0);
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animación suave para los números
  useEffect(() => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }

    const diff = currentSpeed - animatedSpeed;
    if (Math.abs(diff) > 0.1) {
      animationRef.current = setInterval(() => {
        setAnimatedSpeed(prev => {
          const step = diff * 0.1;
          const newValue = prev + step;
          if (Math.abs(currentSpeed - newValue) < 0.1) {
            clearInterval(animationRef.current!);
            return currentSpeed;
          }
          return newValue;
        });
      }, 50);
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [currentSpeed, animatedSpeed]);

  // Callbacks para las funciones de test
  const callbacks: SpeedTestCallbacks = {
    onSpeedUpdate: (speed: number) => setCurrentSpeed(speed),
    onProgressUpdate: (progress: number) => setProgress(progress),
    onMaxSpeedUpdate: (maxSpeed: number) => setMaxSpeed(maxSpeed)
  };

  const resetTest = () => {
    setCurrentSpeed(0);
    setAnimatedSpeed(0);
    setMaxSpeed(0);
    setPing(null);
    setDownloadSpeed(null);
    setProgress(0);
    setTestPhase('idle');
  };

  const startTest = async () => {
    setIsTesting(true);
    resetTest();

    try {
      // Fase 1: Ping
      setTestPhase('ping');
      const pingResult = await measurePing();
      setPing(pingResult);
      
      // Fase 2: Descarga
      setTestPhase('download');
      setProgress(0);
      const downloadResult = await measureDownloadSpeed(callbacks, 10);
      setDownloadSpeed(downloadResult);
      
      // Completado - Guardar resultado con maxSpeed
      setTestPhase('complete');
      setProgress(100);
      
      // Guardar resultado del test automáticamente
      const result = {
        ping: pingResult,
        download: downloadResult,
        maxSpeed: maxSpeed > 0 ? maxSpeed : downloadResult, // Usar downloadResult si maxSpeed es 0
        timestamp: new Date().toISOString()
      };
      
      // Importar y usar la función de guardado
      const { saveSpeedTestResult } = await import("../js/request");
      saveSpeedTestResult(result);
      
    } catch (error) {
      console.error('Error en el test:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const getPhaseText = () => {
    switch (testPhase) {
      case 'ping': return 'Midiendo latencia...';
      case 'download': return 'Probando velocidad de descarga...';
      case 'complete': return 'Test completado';
      default: return 'Listo para iniciar';
    }
  };

  const CircularProgress = ({ progress, size = 200 }: { progress: number; size?: number }) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-blue-500 transition-all duration-500 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">
              {animatedSpeed.toFixed(1)}
            </div>
            <div className="text-sm text-gray-500">Mbps</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
          }
        `
      }} />
      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Test de Velocidad</h1>
          <p className="text-gray-600">Mide la velocidad de tu conexión a internet</p>
        </div>

        {/* Interfaz del test - se oculta con animación cuando está completo */}
        <div className={`transition-all duration-1000 ease-in-out ${
          testPhase === 'complete' 
            ? 'opacity-0 transform -translate-y-8 pointer-events-none absolute top-0 left-0 right-0' 
            : 'opacity-100 transform translate-y-0 relative'
        }`}>
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex flex-col items-center">
              <CircularProgress progress={isTesting ? progress : 0} />
              
              <div className="mt-6 text-center">
                <p className="text-lg text-gray-600 mb-4">{getPhaseText()}</p>
                
                <button
                  onClick={startTest}
                  disabled={isTesting}
                  className={`px-8 py-3 rounded-lg text-white font-semibold text-lg transition-colors duration-200 ${
                    isTesting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isTesting ? 'Probando...' : 'Iniciar Test'}
                </button>
              </div>
            </div>
          </div>

          {/* Resultados en tiempo real */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center border border-green-200">
              <div className="text-3xl mb-2">🏓</div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {ping !== null ? `${ping.toFixed(0)} ms` : '--'}
              </div>
              <div className="text-gray-700 font-medium">Ping</div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center border border-blue-200">
              <div className="text-3xl mb-2">⬇️</div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {downloadSpeed !== null ? `${downloadSpeed.toFixed(1)} Mbps` : '--'}
              </div>
              <div className="text-gray-700 font-medium">Descarga</div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center border border-purple-200">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {maxSpeed > 0 ? `${maxSpeed.toFixed(1)} Mbps` : '--'}
              </div>
              <div className="text-gray-700 font-medium">Máxima</div>
            </div>
          </div>
        </div>

        {/* Tabla de resultados completos - aparece con animación y ocupa el espacio del test */}
        {testPhase === 'complete' && ping !== null && downloadSpeed !== null && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 animate-fade-in-up border border-gray-200" style={{ marginTop: '0px' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">🎯 Resultados del Test</h2>
              <button
                onClick={resetTest}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25"
              >
                🔄 Nuevo Test
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Métrica
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resultado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Calificación
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <div className="text-sm font-medium text-gray-900">Ping / Latencia</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">{ping.toFixed(0)} ms</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ping < 50 ? 'bg-green-100 text-green-800' : 
                        ping < 100 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {ping < 50 ? 'Excelente' : ping < 100 ? 'Bueno' : 'Regular'}
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <div className="text-sm font-medium text-gray-900">Velocidad de Descarga</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">{downloadSpeed.toFixed(1)} Mbps</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        downloadSpeed > 25 ? 'bg-green-100 text-green-800' : 
                        downloadSpeed > 10 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {downloadSpeed > 25 ? 'Rápido' : downloadSpeed > 10 ? 'Moderado' : 'Lento'}
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 bg-indigo-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                        <div className="text-sm font-medium text-gray-900">Velocidad Máxima</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">{maxSpeed.toFixed(1)} Mbps</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        Pico alcanzado
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Resumen de la Conexión</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Tu conexión es {downloadSpeed > 25 ? 'excelente' : downloadSpeed > 10 ? 'buena' : 'básica'} para 
                    {downloadSpeed > 25 ? ' streaming 4K, gaming y trabajo remoto' : 
                     downloadSpeed > 10 ? ' streaming HD y navegación' : 
                     ' navegación básica y email'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Fecha del test</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SpeedTests;
