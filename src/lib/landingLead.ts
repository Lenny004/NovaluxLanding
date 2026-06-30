export function buildLeadBody(options: {
  source: string;
  fullName: string;
  phone: string;
  email?: string;
  clientType?: string;
  approximateConsumption?: string;
  serviceLuz?: boolean;
  serviceGas?: boolean;
  invoice?: File;
}): FormData {
  const body = new FormData();
  body.set('source', options.source);
  body.set('full_name', options.fullName);
  body.set('phone', options.phone);
  body.set('lead_origin', 'contact');
  body.set('calculator_completed', '0');

  if (options.email) body.set('email', options.email);
  if (options.clientType) body.set('client_type', options.clientType);
  if (options.approximateConsumption) body.set('approximate_consumption', options.approximateConsumption);
  if (options.serviceLuz) body.set('service_luz', '1');
  if (options.serviceGas) body.set('service_gas', '1');
  if (options.invoice) body.set('invoice', options.invoice);

  return body;
}

export async function submitLandingLead(endpoint: string, apiKey: string, body: FormData) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'X-API-Key': apiKey },
    body,
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || result?.estado !== 1) {
    throw new Error(result?.exception || result?.message || 'No se pudo enviar el formulario');
  }

  return result;
}
