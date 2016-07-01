interface Window {
    nativeHost: any;
}

class WebNativeHost {
    showAbout() {
        alert("Gistlyn - ServiceStack + React");
    }

    toggleFormBorder() {}

    quit() {
        window.close();
    }
	
    ready() {}
}

window.nativeHost = window.nativeHost || new WebNativeHost();
