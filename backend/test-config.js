async function t() {
  const req1 = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: 'admin@siscom.gov', password: 'Siscom2026'})
  });
  const res1 = await req1.json();
  const token = res1.token;
  const data = {"nombre_entidad":"Comisaría de Familia","municipio":"Valledupar","departamento":"Cesar","prefijo_radicado":"HS","umbral_bajo":16,"umbral_medio":50,"umbral_alto":150,"email_notificaciones":true,"notificar_riesgo_alto":true,"drive_activo":true};
  const req2 = await fetch('http://localhost:3001/api/v1/configuracion', {
      method: 'PUT', headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token},
      body: JSON.stringify(data)
  });
  const res2 = await req2.json();
  console.log(res2);
}
t();
