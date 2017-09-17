tabs = {};
tabIds = [];
focusedWindowId = undefined;
currentWindowId = undefined;

function bootStrap() {
	var camera, scene, renderer;
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

		var loader = new THREE.FontLoader();
		function animate() {
			requestAnimationFrame(animate);
			renderer.clear();
			textMesh.translateX(0.1);
			renderer.render(scene, camera);
		}
		var textMesh;
		loader.load('node_modules/three/examples/fonts/helvetiker_regular.typeface.json', function(font) {
			var textMaterial = new THREE.MeshBasicMaterial({
				color: 0x00ff00
			});
			var textGeometry = new THREE.TextGeometry("Tab Name", {
				font: font,
				size: 3,
				height: 0.5
			});
			textMesh = new THREE.Mesh(textGeometry, textMaterial);
			

			scene.add(textMesh);
			camera.position.z = 50;
			

			animate();
		}); //end load function
		
	} // end init

	chrome.windows.getCurrent({populate:true},function(currentWindow) {
		currentWindowId = currentWindow.id;		
		var tabs = currentWindow.tabs;
		
	});
}

document.addEventListener('DOMContentLoaded', function() {
	bootStrap();
});