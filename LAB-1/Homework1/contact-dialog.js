const contactDialog = document.querySelector('#contact-dialog');
const openDialogBtn = document.querySelector('#open-contact-dialog');
const closeDialogBtn = document.querySelector('#close-dialog-btn');

if (openDialogBtn && contactDialog) {
  openDialogBtn.addEventListener('click', () => {
    contactDialog.showModal();
  });

  if (closeDialogBtn) {
    closeDialogBtn.addEventListener('click', () => {
      contactDialog.close();
      openDialogBtn.focus();
    });
  }

  contactDialog.addEventListener('close', () => {
    openDialogBtn.focus();
  });
}