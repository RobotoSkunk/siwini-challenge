
(() => {
	/**
	 * @type {NodeListOf<HTMLInputElement>}
	 */
	const forms = document.querySelectorAll('input[type="file"]');

	for (const form of forms) {
		form.addEventListener('change', (ev) => {
			/**
			 * @type {string}
			 */
			const file = ev.target.files[0];
			const div = document.getElementById(ev.target.dataset.preview);
			const hidden = document.getElementById(`${ev.target.dataset.name}-input`);

			div.classList.toggle('ready', false);
			div.style.backgroundImage = '';
			hidden.value = '';

			if (!file) {
				ev.target.value = '';
				return;
			}


			const reader = new FileReader();
			notifyLoading();

			reader.onload = (e) => {
				if (!e.target.result.startsWith('data:image/')) {
					ev.target.value = '';
					notify('Por favor, elije una imagen válida.', true);
					return;
				}

				if (e.target.result.length > 3 * 1024 * 1024) {
					ev.target.value = '';
					notify('El archivo no debe pesar más de 3MB.', true);
					return;
				}


				const img = new Image();

				img.onload = () => {
					if (img.width > 1200 || img.height > 1200) {
						ev.target.value = '';
						notify('La imagen no debe ser mayor a 1200 x 1200 píxeles.', true);
						return;
					}

					div.style.backgroundImage = `url(${e.target.result})`;
					div.classList.toggle('ready', true);
					hidden.value = e.target.result;
					hideNotify();
				};

				img.src = e.target.result;
			};

			reader.readAsDataURL(file);
		});
	}
})();
