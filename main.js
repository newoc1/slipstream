tabs = {};
tabIds = [];
focusedWindowId = undefined;
currentWindowId = undefined;
var tabObjects = []
var fontDirectory = 'node_modules/three/examples/fonts/helvetiker_regular.typeface.json';

function bootStrap() {
	var camera, scene, renderer;	

	init();
	

	function init() {
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);

		scene.background = new THREE.Color(0x0A2E2E);
		renderer = new THREE.WebGLRenderer({
			antialias: false
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);		

		function animate() {
			requestAnimationFrame(animate);
			// renderer.clear();
			//TODO: there are better ways to do this using THREE.js apis and object ids
			for(var i = 0; i < tabObjects.length; i++){
				tabObjects[i].rotateY(0.05);
				
			}
			renderer.render(scene, camera);
		}
		camera.position.z = 350;
		camera.position.y = 50
			
		chrome.windows.getCurrent({
			populate: true
		}, function(currentWindow) {
			currentWindowId = currentWindow.id;
			var tabs = currentWindow.tabs;
			for (var i = 0; i < tabs.length; i++) {
				var tab = tabs[i];
				createTab(tab, (textMesh) => {
					textMesh.translateY(getRandomInt(-100, 200));
					textMesh.rotateY(getRandomInt(0,2))
					tabObjects.push(textMesh)
					scene.add(textMesh);
				}, {
				
				});
			}
			animate();				
		});
	} // end init

}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
//generate a PlaneGeometry Mesh based off of tab properties (notabley title and url)
function createTab(tab, callback,options){
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
    ctx.font = '12pt verdana, sans-serif';
    var textWidth = ctx.measureText(tab.title);

    canvas.width = textWidth.width
    canvas.height = 16;
    ctx.fillStyle = 'rgba(0,0,0,0.0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tab.title, canvas.width / 2, canvas.height / 2);

	var texture =  new THREE.Texture(canvas);
	texture.needsUpdate = true;

	var material = new THREE.MeshBasicMaterial({map:texture,transparent:true, side: THREE.DoubleSide});
	var geometry = new THREE.PlaneGeometry( canvas.width,canvas.height, 1 );	
	var plane = new THREE.Mesh( geometry, material );
	
	callback(plane);
}

//WARNING: This probably won't be used. Justed keeping it around in case we want to have procedurally
//generated 3d text in some cases
//
//Used to convert chrome tab data into a webgl object
// The callback parameter is a function that takes a THREE Mesh object as a parameter
//options include:
// textGeometryOptions: see THREE.TextGeometry for more details. May also include a THREE Font object.
// basicMaterialOptions: see THREE.MeshBasicMaterial for more details
// font: A constructed THREE Font object usually provided by a FontLoader
// context: The function context with which to call the callback
// material: A configured THREE material to use instead of MeshBasicMaterial
function create3DTab(tab, callback, options) {

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