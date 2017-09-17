tabs = {};
tabIds = [];
focusedWindowId = undefined;
currentWindowId = undefined;
var fontDirectory = 'node_modules/three/examples/fonts/helvetiker_regular.typeface.json';

function bootStrap() {
	var camera, scene, renderer;
	var loader;
	init();


	function init() {
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

		scene.background = new THREE.Color(0x000000);
		renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);

		loader = new THREE.FontLoader();

		function animate() {
			requestAnimationFrame(animate);
			// renderer.clear();

			renderer.render(scene, camera);
		}
		camera.position.z = 50;
		animate();
	} // end init

	function getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
	}
	var fontPromise = new Promise((resolve, reject) => {
		loader.load(fontDirectory, (font) => {
			resolve(font);
		});
	});

	chrome.windows.getCurrent({
		populate: true
	}, function(currentWindow) {
		currentWindowId = currentWindow.id;
		var tabs = currentWindow.tabs;

		// loader.load(fontDirectory, function(font) {
		fontPromise.then((font) => {
			for (var i = 0; i < tabs.length; i++) {
				var tab = tabs[i];
				createTab(tab, (textMesh) => {
					textMesh.translateY(getRandomInt(-50, 50));
					scene.add(textMesh);
				}, {
					font: font
				});
			}
		})

		// });

	});
}
//Used to convert chrome tab data into a webgl object
// The callback parameter is a function that takes a THREE Mesh object as a parameter
//options include:
// textGeometryOptions: see THREE.TextGeometry for more details. May also include a THREE Font object.
// basicMaterialOptions: see THREE.MeshBasicMaterial for more details
// font: A constructed THREE Font object usually provided by a FontLoader
// context: The function context with which to call the callback
// material: A configured THREE material to use instead of MeshBasicMaterial
function createTab(tab, callback, options) {

	var fontPromise;
	if (!options && !options.font) {
		console.warn('You should really be passing a font in to the function.');
		loader = new THREE.FontLoader();
		loader.load(fontDirectory, (font) => fontPromise = Promise.resolve(font))
	} else {
		if (options.textGeometryOptions && options.textGeometryOptions.font) {
			font = options.textGeometryOptions.font
		} else {
			font = options.font;
		}
		fontPromise = Promise.resolve(font);
	}
	fontPromise.then((font) => {
		//set up MeshBasicMaterial to use for the TextGeometry
		if (options.material) {
			var textMaterial = options.material;
		} else if (options.basicMaterialOptions) {
			var textMaterial = new THREE.MeshBasicMaterial(options.basicMaterialOptions);
		} else {
			var textMaterial = new THREE.MeshBasicMaterial({
				color: 0xffffff
			});
		}
		//Set up the TextGeometry
		if (options.textGeometryOptions) {
			var textGeometry = new THREE.TextGeometry(tab.title, options.textGeometryOptions);
		} else {
			var textGeometry = new THREE.TextGeometry(tab.title, {
				font: font,
				size: 1,
				height: 0
			})
		}
		var textMesh = new THREE.Mesh(textGeometry, textMaterial);

		if (options.context) {
			callback.call(options.context, textMesh);
		} else {
			callback(textMesh)
		}
	});


}
document.addEventListener('DOMContentLoaded', function() {
	bootStrap();
});