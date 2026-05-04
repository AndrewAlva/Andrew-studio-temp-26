// Modal open/close helpers with focus trap and focus return
let triggerEl: HTMLElement | null = null;

export function openModal(trigger: HTMLElement): void {
  // TODO:
  // 1. Store trigger reference for focus return on close
  // 2. Call dialog.showModal()
  // 3. Move focus to first focusable field inside modal
  triggerEl = trigger;
  const dialog = document.getElementById('contact-modal') as HTMLDialogElement | null;
  if (!dialog) return;
  dialog.showModal();
}

export function closeModal(): void {
  // TODO:
  // 1. Call dialog.close()
  // 2. Return focus to triggerEl
  const dialog = document.getElementById('contact-modal') as HTMLDialogElement | null;
  if (!dialog) return;
  dialog.close();
  triggerEl?.focus();
  triggerEl = null;
}
