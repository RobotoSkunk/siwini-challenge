
window.dataLayer = window.dataLayer || [];

function gtag() {
	dataLayer.push(arguments);
}

async function loadGoogleTag() {
	return new Promise(function (resolve, reject) {
		const s = document.createElement('script');
		s.src = 'https://www.googletagmanager.com/gtag/js?id=G-6LGVDH12QB';
		s.onload = resolve;
		s.onerror = reject;

		document.head.appendChild(s);
	});
}



// #region Notification
/**
 * @type {HTMLDivElement}
 */
const notification = document.getElementById('notification');
const notificationButton = notification.querySelector('button');

/**
 * @param {string} message 
 * @param {boolean} showButton 
 */
function notify(message, showButton)
{
	notification.style.display = 'block';
	notification.querySelector('p').innerText = message;

	notificationButton.style.display = showButton ? 'block' : 'none';
}

function notifyLoading()
{
	notification.style.display = 'block';
	notification.querySelector('p').innerHTML = '<div class="lds-ripple"><div></div><div></div></div>';

	notificationButton.style.display = 'none';
}

function hideNotify()
{
	notification.style.display = 'none';
}

notificationButton.addEventListener('click', () => {
	notification.style.display = 'none';
});


// #endregion

(() => {
	// #region Dropdowns
	/**
	 * @type {NodeListOf<HTMLDivElement>}
	 */
	const dropdowns = document.querySelectorAll('.dropdown');


	for (let i = 0; i < dropdowns.length; i++) {
		const dropdown = dropdowns[i];

		/**
		 * @type {HTMLButtonElement}
		 */
		const toggle = dropdown.querySelector('button');

		/**
		 * @type {HTMLDivElement}
		 */
		const content = dropdown.querySelector('.options');


		toggle.addEventListener('click', (ev) => {
			for (let j = 0; j < dropdowns.length; j++) {
				const otherDropdown = dropdowns[j];

				if (otherDropdown !== dropdown) {
					otherDropdown.classList.remove('open');
					otherDropdown.querySelector('.options').style.height = '0px';
				}
			}

			dropdown.classList.toggle('open');
			content.style.height = dropdown.classList.contains('open') ? content.scrollHeight + 'px' : '0';
		});

		content.addEventListener('focusin', () => {
			dropdown.classList.add('open');
			content.style.height = content.scrollHeight + 'px';
		});

		content.addEventListener('focusout', () => {
			dropdown.classList.remove('open');
			content.style.height = '0px';
		});

		document.addEventListener('click', (ev) => {
			if (!dropdown.contains(ev.target)) {
				dropdown.classList.remove('open');
				content.style.height = '0px';
			}
		});
	}
	// #endregion

	// #region Mobile header

	const nav = document.querySelector('nav');
	const navToggle = document.querySelectorAll('header .toggle');
	const html = document.querySelector('html');

	var open = false;

	/**
	 * @param {boolean} toggle 
	 */
	function toggleNav(toggle) {
		nav.style.top = toggle ? '0' : '-100%';
		html.classList.toggle('no-scroll', toggle);
	}

	toggleNav(false);

	navToggle.forEach((toggle) => {
		toggle.addEventListener('click', () => {
			open = !open;
			toggleNav(open);
		});
	});

	document.addEventListener('resize', () => {
		if (window.innerWidth > 850) {
			open = false;
			toggleNav(open);
		}
	});

	// #endregion

	// #region Google Analytics Event Tracking

	if (!navigator.doNotTrack) {
		// Initialize Google Analytics
		loadGoogleTag().then(() => {

			gtag('js', new Date());
			gtag('config', 'G-6LGVDH12QB');

		}).catch((err) => {
			console.error('Error loading Google Tag Manager', err);
		});

		// Tell the user that we're tracking them
		if (window.localStorage.getItem('consent') !== '1') {
			const cookieBanner = document.createElement('div');
			cookieBanner.classList.add('just-enable-dnt-dude');
	
			cookieBanner.innerHTML = `
				<p style="text-align: center">
					Usamos cookies para rastrear tu actividad en este sitio web con fines estadísticos.<br>
					Puedes desactivar esta funcionalidad en tu navegador activando la opción <b>Do Not Track</b>.<br>
					<a href="https://www.google.com/policies/technologies/partner-sites/">Leer más.</a>
				</p>
				<button>Entendido</button>
			`;
	
			cookieBanner.querySelector('button').addEventListener('click', () => {
				cookieBanner.remove();
				window.localStorage.setItem('consent', '1');
			});

			document.body.appendChild(cookieBanner);
		}
	} else {
		console.warn('Do Not Track is enabled. Google Analytics will not be loaded.');
	}

	// #endregion
})();
