
(() => {
	/**
	 * @type {HTMLDivElement[]}
	 */
	const options = document.querySelectorAll('.chooser-options .option');

	/**
	 * @type {HTMLSelectElement}
	 */
	const chooser = document.querySelector('#chooser');


	function toggleOption(option) {
		for (const i in options) {
			options[i].classList.toggle('selected', i === option);
		}
	}

	chooser.addEventListener('change', (e) => {
		/**
		 * @type {string}
		 */
		const value = e.target.value;

		toggleOption(value);
	});

	toggleOption(chooser.value);
})();

