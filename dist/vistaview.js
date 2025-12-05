function getElmProperties(e) {
	let t = window.getComputedStyle(e).getPropertyValue("object-fit"), n = window.getComputedStyle(e).getPropertyValue("border-radius"), r = window.getComputedStyle(e).getPropertyValue("object-position"), i = window.getComputedStyle(e).getPropertyValue("overflow"), a = e.getBoundingClientRect();
	return {
		width: e instanceof HTMLImageElement ? e.width : a.width,
		height: e instanceof HTMLImageElement ? e.height : a.height,
		naturalWidth: e instanceof HTMLImageElement ? e.naturalWidth : a.width,
		naturalHeight: e instanceof HTMLImageElement ? e.naturalHeight : a.height,
		objectFit: t,
		borderRadius: n,
		objectPosition: r,
		overflow: i
	};
}
var VistaView = class {
	elements;
	currentIndex = 0;
	constructor(e) {
		this.elements = e;
	}
	open(e = 0) {
		console.log(`VistaView: open called with index ${e}`);
	}
	close() {
		console.log("VistaView: close called");
	}
	view(e) {
		console.log(`VistaView: view called with index ${e}`);
	}
	next() {
		this.currentIndex = (this.currentIndex + 1) % this.elements.length, console.log("VistaView: next called");
	}
	prev() {
		this.currentIndex = (this.currentIndex - 1 + this.elements.length) % this.elements.length, console.log("VistaView: previous called");
	}
	getCurrentIndex() {
		return this.currentIndex;
	}
	destroy() {
		console.log("VistaView: destroy called");
	}
};
function vistaView(n) {
	let { parent: r, elements: i } = n;
	if (!r && !i) throw Error("VistaView: No parent or elements specified.");
	if (r) {
		let t = Array.from(r.querySelectorAll("[data-vistaview-src]"));
		t.length || (t = Array.from(r.querySelectorAll("a[href]"))), i = t.map((t) => ({
			src: t.dataset.vistaviewSrc || t.getAttribute("href") || "",
			width: t.dataset.vistaviewWidth ? parseInt(t.dataset.vistaviewWidth) : t.querySelector("img") ? t.querySelector("img").naturalWidth : 0,
			height: t.dataset.vistaviewHeight ? parseInt(t.dataset.vistaviewHeight) : t.querySelector("img") ? t.querySelector("img").naturalHeight : 0,
			smallSrc: t.querySelector("img") ? t.querySelector("img").src : t.dataset.vistaviewSmallsrc || t.getAttribute("src") || "",
			anchorProps: t instanceof HTMLAnchorElement ? getElmProperties(t) : void 0,
			anchor: t instanceof HTMLAnchorElement ? t : void 0,
			imageProps: t instanceof HTMLImageElement ? getElmProperties(t) : t.querySelector("img") ? getElmProperties(t.querySelector("img")) : void 0,
			image: t instanceof HTMLImageElement ? t : t.querySelector("img") ? t.querySelector("img") : void 0
		}));
	} else if (i) if (typeof i == "string" && (i = document.querySelectorAll(i)), i instanceof NodeList) i = Array.from(i).map((t) => ({
		src: t.dataset.vistaviewSrc || t.getAttribute("href") || "",
		width: t.dataset.vistaviewWidth ? parseInt(t.dataset.vistaviewWidth) : t.querySelector("img") ? t.querySelector("img").naturalWidth : 0,
		height: t.dataset.vistaviewHeight ? parseInt(t.dataset.vistaviewHeight) : t.querySelector("img") ? t.querySelector("img").naturalHeight : 0,
		smallSrc: t.querySelector("img") ? t.querySelector("img").src : t.dataset.vistaviewSmallsrc || t.getAttribute("src") || "",
		anchorProps: t instanceof HTMLAnchorElement ? getElmProperties(t) : void 0,
		anchor: t instanceof HTMLAnchorElement ? t : void 0,
		imageProps: t instanceof HTMLImageElement ? getElmProperties(t) : t.querySelector("img") ? getElmProperties(t.querySelector("img")) : void 0,
		image: t instanceof HTMLImageElement ? t : t.querySelector("img") ? t.querySelector("img") : void 0
	}));
	else if (Array.isArray(i)) i.forEach((e, t) => {
		if (typeof e.src != "string") throw Error(`VistaView: Invalid src type in elements array at index ${t}. Should be a string.`);
		if (typeof e.width != "number") throw Error(`VistaView: Invalid width type in elements array at index ${t}. Should be a number.`);
		if (typeof e.height != "number") throw Error(`VistaView: Invalid height type in elements array at index ${t}. Should be a number.`);
		if (e.smallSrc && typeof e.smallSrc != "string") throw Error(`VistaView: Invalid smallSrc in elements array at index ${t}. Should be a string.`);
	});
	else throw Error("VistaView: Invalid elements option.");
	if (!Array.isArray(i) || !i.length) throw Error("VistaView: No elements found to display.");
	let a = new VistaView(i);
	return {
		open: (e) => {
			e ||= 0, a.open(e);
		},
		close: () => {
			a.close();
		},
		view: (e) => {
			a.view(e);
		},
		next: () => {
			a.next();
		},
		prev: () => {
			a.prev();
		},
		destroy: () => {
			a.destroy();
		},
		getCurrentIndex: () => a.getCurrentIndex()
	};
}
export { vistaView };
