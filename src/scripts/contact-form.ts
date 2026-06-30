import { buildLeadBody, submitLandingLead } from '../lib/landingLead';

type StatusType = 'error' | 'success';

const DEFAULT_SUBMIT_LABEL = 'Solicitar información';
const DEFAULT_SOURCE = 'novalux';

function getInvoiceFile(formData: FormData): File | undefined {
  const invoice = formData.get('invoice');

  if (invoice instanceof File && invoice.size > 0) {
    return invoice;
  }

  return undefined;
}

export function initContactForm(): void {
  const form = document.querySelector('[data-contact-form]');

  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const status = form.querySelector('[data-form-status]');
  const success = form.parentElement?.querySelector('[data-contact-success]');
  const submit = form.querySelector('button[type="submit"]');
  const submitLabel =
    submit instanceof HTMLButtonElement ? submit.textContent : 'Enviar';
  const fileInput = form.querySelector('[data-contact-file]');
  const fileWrap = form.querySelector('[data-file-wrap]');
  const fileName = form.querySelector('[data-file-name]');
  const filePlaceholder =
    fileName instanceof HTMLElement ? fileName.textContent : 'o arrastra aquí';

  const showSuccess = (): void => {
    form.classList.add('is-hidden');

    if (success instanceof HTMLElement) {
      success.hidden = false;
    }

    form.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const syncFileField = (): void => {
    if (!(fileInput instanceof HTMLInputElement) || !(fileWrap instanceof HTMLElement)) {
      return;
    }

    const file = fileInput.files?.[0];
    fileWrap.classList.toggle('is-filled', Boolean(file));

    if (fileName instanceof HTMLElement) {
      fileName.textContent = file ? file.name : filePlaceholder;
    }
  };

  if (fileInput instanceof HTMLInputElement && fileWrap instanceof HTMLElement) {
    fileInput.addEventListener('change', syncFileField);

    ['dragenter', 'dragover'].forEach((eventName) => {
      fileWrap.addEventListener(eventName, (event) => {
        event.preventDefault();
        fileWrap.classList.add('is-dragover');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      fileWrap.addEventListener(eventName, () => {
        fileWrap.classList.remove('is-dragover');
      });
    });

    fileWrap.addEventListener('drop', (event) => {
      event.preventDefault();
      const file = event.dataTransfer?.files?.[0];

      if (!file) {
        return;
      }

      const transfer = new DataTransfer();
      transfer.items.add(file);
      fileInput.files = transfer.files;
      syncFileField();
    });

    form.addEventListener('reset', () => {
      window.requestAnimationFrame(syncFileField);
    });
  }

  const setStatus = (message: string, type: StatusType): void => {
    if (!(status instanceof HTMLElement)) {
      return;
    }

    status.textContent = message;
    status.className = `label-s contact-status is-visible is-${type}`;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const endpoint = form.dataset.endpoint;
    const apiKey = form.dataset.apiKey;
    const source = form.dataset.source || DEFAULT_SOURCE;

    if (!endpoint || !apiKey) {
      setStatus('El formulario no está configurado. Inténtalo más tarde.', 'error');
      return;
    }

    const formData = new FormData(form);
    const consumption = String(formData.get('approximate_consumption') ?? '').trim();

    const body = buildLeadBody({
      source,
      fullName: String(formData.get('name') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      clientType: String(formData.get('client_type') ?? '').trim(),
      approximateConsumption: consumption || undefined,
      serviceLuz: Boolean(formData.get('service_luz')),
      serviceGas: Boolean(formData.get('service_gas')),
      invoice: getInvoiceFile(formData),
    });

    if (submit instanceof HTMLButtonElement) {
      submit.disabled = true;
      submit.textContent = 'Enviando...';
    }

    try {
      await submitLandingLead(endpoint, apiKey, body);
      form.reset();
      syncFileField();
      showSuccess();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo enviar el formulario';
      setStatus(message, 'error');
    } finally {
      if (submit instanceof HTMLButtonElement) {
        submit.disabled = false;
        submit.textContent = submitLabel ?? DEFAULT_SUBMIT_LABEL;
      }
    }
  });
}
