/** Código de respuesta exitosa del CRM para operaciones de lead. */
export const CRM_RESPONSE_STATUS = {
  SUCCESS: 1,
} as const;

/** Campos opcionales y obligatorios para construir el FormData del lead. */
export type BuildLeadBodyOptions = {
  source: string;
  fullName: string;
  phone: string;
  email?: string;
  clientType?: string;
  approximateConsumption?: string;
  serviceLuz?: boolean;
  serviceGas?: boolean;
  invoice?: File;
};

/**
 * Construye el cuerpo multipart que espera el endpoint de leads del CRM.
 *
 * @param options - Datos del formulario de contacto normalizados.
 * @returns FormData listo para enviar con fetch.
 */
export function buildLeadBody(options: BuildLeadBodyOptions): FormData {
  const body = new FormData();

  body.set('source', options.source);
  body.set('full_name', options.fullName);
  body.set('phone', options.phone);
  body.set('lead_origin', 'contact');
  body.set('calculator_completed', '0');

  if (options.email) {
    body.set('email', options.email);
  }

  if (options.clientType) {
    body.set('client_type', options.clientType);
  }

  if (options.approximateConsumption) {
    body.set('approximate_consumption', options.approximateConsumption);
  }

  if (options.serviceLuz) {
    body.set('service_luz', '1');
  }

  if (options.serviceGas) {
    body.set('service_gas', '1');
  }

  if (options.invoice) {
    body.set('invoice', options.invoice);
  }

  return body;
}

/**
 * Envía un lead al CRM y valida que la respuesta indique éxito.
 *
 * @param endpoint - URL del endpoint PHP de leads.
 * @param apiKey - Clave API enviada en la cabecera X-API-Key.
 * @param body - FormData con los campos del lead.
 * @returns Cuerpo JSON de la respuesta del servidor.
 * @throws Error con el mensaje del CRM si la petición falla o estado !== 1.
 */
export async function submitLandingLead(
  endpoint: string,
  apiKey: string,
  body: FormData,
): Promise<unknown> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'X-API-Key': apiKey },
    body,
  });
  const responseBody = await response.json().catch(() => null);

  if (!response.ok || responseBody?.estado !== CRM_RESPONSE_STATUS.SUCCESS) {
    const errorMessage =
      responseBody?.exception ||
      responseBody?.message ||
      'No se pudo enviar el formulario';
    throw new Error(errorMessage);
  }

  return responseBody;
}
