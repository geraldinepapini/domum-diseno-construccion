// Archivo: js/porfolio.js
function openModal(image) {
  const modal = document.getElementById("modal");
  const modalImage = document.getElementById("modal-image");
  
  modalImage.src = image.src;
  modal.style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
}
