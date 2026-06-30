import { buildLeadBody, submitLandingLead } from '../lib/landingLead';

const DEFAULT_LEAD_SOURCE = 'novalux';
const DEFAULT_SUBMIT_LABEL = 'Solicitar información';
const FALLBACK_SUBMIT_LABEL = 'Enviar';
const SUBMITTING_LABEL = 'Enviando...';
const DEFAULT_FILE_PLACEHOLDER = 'o arrastra aquí';

const FORM_MESSAGES = {
  NOT_CONFIGURED: 'El formulario no está configurado. Inténtalo más tarde.',
  SUBMIT_FAILED: 'No se pudo enviar el formulario',
} as const;

const FORM_SELECTORS = {
  FORM: '[data-contact-form]',
  STATUS: '[data-form-status]',
  SUCCESS_PANEL: '[data-contact-success]',
  FILE_INPUT: '[data-contact-file]',
  FILE_WRAP: '[data-file-wrap]',
  FILE_NAME: '[data-file-name]',
} as const;

type FormStatusType = 'error' | 'success';

type ContactFormElements = {
  form: HTMLFormElement;
  statusElement: HTMLElement | null;
  successPanel: HTMLElement | null;
  submitButton: HTMLButtonElement | null;
  submitLabel: string;
};

type FileUploadElements = {
  fileInput: HTMLInputElement;
  fileWrap: HTMLElement;
  fileNameElement: HTMLElement | null;
  filePlaceholder: string;
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function getContactFormElements(): ContactFormElements | null {
  const form = document.querySelector(FORM_SELECTORS.FORM);

  if (!(form instanceof HTMLFormElement)) {
    return null;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const submitLabel =
    submitButton instanceof HTMLButtonElement
      ? submitButton.textContent ?? FALLBACK_SUBMIT_LABEL
      : FALLBACK_SUBMIT_LABEL;

  return {
    form,
    statusElement: form.querySelector(FORM_SELECTORS.STATUS),
    successPanel: form.parentElement?.querySelector(FORM_SELECTORS.SUCCESS_PANEL) ?? null,
    submitButton: submitButton instanceof HTMLButtonElement ? submitButton : null,
    submitLabel: submitLabel ?? DEFAULT_SUBMIT_LABEL,
  };
}

function getFileUploadElements(form: HTMLFormElement): FileUploadElements | null {
  const fileInput = form.querySelector(FORM_SELECTORS.FILE_INPUT);
  const fileWrap = form.querySelector(FORM_SELECTORS.FILE_WRAP);
  const fileNameElement = form.querySelector(FORM_SELECTORS.FILE_NAME);

  if (!(fileInput instanceof HTMLInputElement) || !(fileWrap instanceof HTMLElement)) {
    return null;
  }

  const filePlaceholder =
    fileNameElement instanceof HTMLElement
      ? fileNameElement.textContent ?? DEFAULT_FILE_PLACEHOLDER
      : DEFAULT_FILE_PLACEHOLDER;

  return { fileInput, fileWrap, fileNameElement, filePlaceholder };
}

function syncFileFieldDisplay(elements: FileUploadElements): void {
  const selectedFile = elements.fileInput.files?.[0];
  elements.fileWrap.classList.toggle('contact__file-wrap--filled', Boolean(selectedFile));

  if (elements.fileNameElement instanceof HTMLElement) {
    elements.fileNameElement.textContent = selectedFile
      ? selectedFile.name
      : elements.filePlaceholder;
  }
}

function bindFileUploadHandlers(form: HTMLFormElement, onSync: () => void): void {
  const elements = getFileUploadElements(form);

  if (!elements) {
    return;
  }

  const sync = (): void => {
    syncFileFieldDisplay(elements);
    onSync();
  };

  elements.fileInput.addEventListener('change', sync);

  ['dragenter', 'dragover'].forEach((eventName) => {
    elements.fileWrap.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.fileWrap.classList.add('contact__file-wrap--dragover');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    elements.fileWrap.addEventListener(eventName, () => {
      elements.fileWrap.classList.remove('contact__file-wrap--dragover');
    });
  });

  elements.fileWrap.addEventListener('drop', (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer?.files?.[0];

    if (!droppedFile) {
      return;
    }

    const transfer = new DataTransfer();
    transfer.items.add(droppedFile);
    elements.fileInput.files = transfer.files;
    sync();
  });

  form.addEventListener('reset', () => {
    window.requestAnimationFrame(sync);
  });
}

function createFileFieldSync(form: HTMLFormElement): () => void {
  const elements = getFileUploadElements(form);

  if (!elements) {
    return () => undefined;
  }

  return () => {
    syncFileFieldDisplay(elements);
  };
}

function extractInvoiceFile(formData: FormData): File | undefined {
  const invoice = formData.get('invoice');

  if (invoice instanceof File && invoice.size > 0) {
    return invoice;
  }

  return undefined;
}

function showSuccessView(form: HTMLFormElement, successPanel: HTMLElement | null): void {
  form.classList.add('contact__form--hidden');

  if (successPanel instanceof HTMLElement) {
    successPanel.hidden = false;
  }

  form.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function createStatusWriter(statusElement: HTMLElement | null) {
  return (message: string, statusType: FormStatusType): void => {
    if (!(statusElement instanceof HTMLElement)) {
      return;
    }

    statusElement.textContent = message;
    statusElement.className = `label-s contact__status contact__status--visible contact__status--${statusType}`;
  };
}

function bindContactFormSubmit(
  elements: ContactFormElements,
  syncFileField: () => void,
): void {
  const writeStatus = createStatusWriter(elements.statusElement);

  elements.form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const endpoint = elements.form.dataset.endpoint;
    const apiKey = elements.form.dataset.apiKey;
    const leadSource = elements.form.dataset.source || DEFAULT_LEAD_SOURCE;

    if (!endpoint || !apiKey) {
      writeStatus(FORM_MESSAGES.NOT_CONFIGURED, 'error');
      return;
    }

    const formData = new FormData(elements.form);
    const approximateConsumption = String(
      formData.get('approximate_consumption') ?? '',
    ).trim();

    const body = buildLeadBody({
      source: leadSource,
      fullName: String(formData.get('name') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      clientType: String(formData.get('client_type') ?? '').trim(),
      approximateConsumption: approximateConsumption || undefined,
      serviceLuz: Boolean(formData.get('service_luz')),
      serviceGas: Boolean(formData.get('service_gas')),
      invoice: extractInvoiceFile(formData),
    });

    if (elements.submitButton) {
      elements.submitButton.disabled = true;
      elements.submitButton.textContent = SUBMITTING_LABEL;
    }

    try {
      await submitLandingLead(endpoint, apiKey, body);
      elements.form.reset();
      syncFileField();
      showSuccessView(elements.form, elements.successPanel);
    } catch (error) {
      writeStatus(getErrorMessage(error, FORM_MESSAGES.SUBMIT_FAILED), 'error');
    } finally {
      if (elements.submitButton) {
        elements.submitButton.disabled = false;
        elements.submitButton.textContent =
          elements.submitLabel ?? DEFAULT_SUBMIT_LABEL;
      }
    }
  });
}

export function initContactForm(): void {
  const elements = getContactFormElements();

  if (!elements) {
    return;
  }

  const syncFileField = createFileFieldSync(elements.form);
  bindFileUploadHandlers(elements.form, syncFileField);
  bindContactFormSubmit(elements, syncFileField);
}
