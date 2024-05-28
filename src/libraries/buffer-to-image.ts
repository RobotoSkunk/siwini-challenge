import canvas from '@napi-rs/canvas';


export default async function (imageData: Buffer): Promise<canvas.Image>
{
	try {
		return await canvas.loadImage(imageData);
	} catch (e) {
		console.error(e);
		throw e;
	}
}
