import { useState, useEffect } from "react";
import { checkMultipleWebsites, saveMonitoringHistory, getLatestMonitoringResult } from "../js/request";
import type { WebsiteStatus } from "../js/request";

function Monitoreo() {
  const [websites, setWebsites] = useState<WebsiteStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const sitiosWeb = [
    { url: 'https://tramita.ue118.gob.pe/', name: 'Tramita UE118' },
    { url: 'https://soporte.ue118.gob.pe/', name: 'Soporte UE118' },
    { url: 'https://gestiona.ue118.gob.pe/', name: 'Gestiona UE118' }
  ];

  useEffect(() => {
    loadLastResults();
    // Auto-verificar cada 5 minutos
    const interval = setInterval(checkAllWebsites, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadLastResults = () => {
    const lastResult = getLatestMonitoringResult();
    if (lastResult) {
      setWebsites(lastResult.results);
      setLastUpdate(lastResult.timestamp);
    } else {
      // Inicializar con estado "checking"
      const initialWebsites = sitiosWeb.map(site => ({
        ...site,
        status: 'checking' as const,
        lastChecked: new Date().toISOString()
      }));
      setWebsites(initialWebsites);
    }
  };

  const checkAllWebsites = async () => {
    setIsChecking(true);
    
    try {
      const results = await checkMultipleWebsites(sitiosWeb);
      setWebsites(results);
      setLastUpdate(new Date().toISOString());
      saveMonitoringHistory(results);
    } catch (error) {
      console.error('Error checking websites:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 border-green-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      case 'checking': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return '🟢';
      case 'offline': return '🔴';
      case 'checking': return '🟡';
      default: return '⚪';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'En Línea';
      case 'offline': return 'Fuera de Línea';
      case 'checking': return 'Verificando...';
      default: return 'Desconocido';
    }
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getOverallStatus = () => {
    const onlineCount = websites.filter(w => w.status === 'online').length;
    const totalCount = websites.length;
    
    if (onlineCount === totalCount) return { status: 'Todos los servicios operativos', color: 'text-green-600', icon: '✅' };
    if (onlineCount === 0) return { status: 'Todos los servicios caídos', color: 'text-red-600', icon: '❌' };
    return { status: `${onlineCount}/${totalCount} servicios operativos`, color: 'text-yellow-600', icon: '⚠️' };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Monitoreo de Sitios Web</h1>
            <p className="text-gray-600">Estado en tiempo real de los servicios UE118</p>
          </div>
          <button
            onClick={checkAllWebsites}
            disabled={isChecking}
            className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors ${
              isChecking 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <span>{isChecking ? '🔄' : '🔍'}</span>
            <span>{isChecking ? 'Verificando...' : 'Verificar Ahora'}</span>
          </button>
        </div>

        {/* Estado General */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{overallStatus.icon}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Estado General del Sistema</h2>
                <p className={`text-lg font-semibold ${overallStatus.color}`}>
                  {overallStatus.status}
                </p>
              </div>
            </div>
            {lastUpdate && (
              <div className="text-right">
                <div className="text-sm text-gray-500">Última verificación</div>
                <div className="text-sm font-medium text-gray-700">
                  {formatDateTime(lastUpdate)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabla de Sitios Web */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Estado de Servicios</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Servicio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiempo de Respuesta
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Verificación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {websites.map((website, index) => (
                  <tr key={website.url} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getStatusIcon(website.status)}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {website.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(website.status)}`}>
                        {getStatusText(website.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {website.responseTime ? `${website.responseTime}ms` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(website.lastChecked)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      <a 
                        href={website.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-800 transition-colors"
                      >
                        {website.url}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl mb-2">🟢</div>
            <div className="text-2xl font-bold text-green-600">
              {websites.filter(w => w.status === 'online').length}
            </div>
            <div className="text-sm text-gray-600">Servicios En Línea</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl mb-2">🔴</div>
            <div className="text-2xl font-bold text-red-600">
              {websites.filter(w => w.status === 'offline').length}
            </div>
            <div className="text-sm text-gray-600">Servicios Caídos</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-blue-600">
              {websites.length > 0 && websites.some(w => w.responseTime) 
                ? Math.round(websites.filter(w => w.responseTime).reduce((acc, w) => acc + (w.responseTime || 0), 0) / websites.filter(w => w.responseTime).length)
                : '-'
              }ms
            </div>
            <div className="text-sm text-gray-600">Tiempo Promedio</div>
          </div>
        </div>

        {/* Alertas */}
        {websites.some(w => w.status === 'offline') && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-red-500 text-xl">⚠️</span>
              <h3 className="text-lg font-semibold text-red-800">Servicios con Problemas</h3>
            </div>
            <div className="space-y-2">
              {websites.filter(w => w.status === 'offline').map(website => (
                <div key={website.url} className="text-sm text-red-700">
                  <strong>{website.name}</strong>: {website.error || 'Servicio no disponible'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Monitoreo;
