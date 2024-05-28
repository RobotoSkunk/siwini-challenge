
declare global {
	namespace Gay {
		type HeadTag = HeadTag_CSS | HeadTag_JS | HeadTag_Link;

		interface HeadTag_Template {
			type: 'js' | 'css' | 'link';
			source: string;
		}

		interface HeadTag_CSS extends HeadTag_Template {
			type: 'css';
		}

		interface HeadTag_JS extends HeadTag_Template {
			type: 'js';
			defer?: boolean;
		}

		interface HeadTag_Link extends HeadTag_Template {
			type: 'link';
			as?: string;
			rel?: string;
			mimeType?: string;
		}
	}

	namespace Express {
		interface Locals {
			title?: string;
			nonce: string;
			subtitle?: string;
			description?: string;
			headTags: string;

			[key: string]: any;
		}

		interface Response {
			setSubtitle(subtitle: string): void;
			addHeadTag(... tag: Gay.HeadTag[]): void;

			renderLayout(file: string, options?: object): Promise<void>;
		}
	}

	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'development' | 'production';
			PORT?: string;
			WEBSITE_NAME?: string;
		}
	}
}


export { };
