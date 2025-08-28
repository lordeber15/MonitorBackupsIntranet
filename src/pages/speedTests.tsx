function SpeedTests() {
  medirVelocidad();
  return <div className="p-4">SpeedTest</div>;
}
async function medirVelocidad() {
  const archivo = "https://nbg1-speed.hetzner.com/100MB.bin"; // archivo de prueba
  const inicio = new Date().getTime();

  const response = await fetch(archivo);
  const blob = await response.blob();
  const fin = new Date().getTime();

  const duracion = (fin - inicio) / 1000; // segundos
  const tamanioMB = blob.size / (1024 * 1024);
  const velocidadMbps = (tamanioMB / duracion) * 8;

  console.log(`Velocidad: ${velocidadMbps.toFixed(2)} Mbps`);
}

export default SpeedTests;
