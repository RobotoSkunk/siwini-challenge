
(() => {
	const form = document.querySelector('form');


	form.addEventListener('submit', async (ev) => {
		if (!form.checkValidity()) {
			form.reportValidity();
			return;
		}

		ev.preventDefault();
		notifyLoading();


		try {
			const res = await fetch('/registro/formulario', {
				method: 'POST',
				body: new URLSearchParams(new FormData(form))
			});

			const data = await res.json();

			if (data.success) {
				window.location.href = `/registro/formulario?id=${encodeURIComponent(data.code)}`;
			} else {
				notify(data.message, true);
			}
		} catch (e) {
			console.error(e);
			notify('Ocurrió un error al intentar subir el formulario.', true);
		}
	});
})();
