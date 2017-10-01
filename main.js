currentTabs = {};
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
		
		
		var mouse = new THREE.Vector2();
		var raycaster = new THREE.Raycaster();
		scene.background = new THREE.Color(0x0A2E2E);
		renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		renderer.setSize(window.innerWidth, window.innerHeight);



		document.body.appendChild(renderer.domElement);


		//Add OrbitControls so we can pan around with the mouse
		controls = new THREE.OrbitControls(camera, renderer.domElement);

		document.addEventListener('mouseup', function(event) {
			onDocumentMouseUp(event, renderer,raycaster,mouse,camera,scene);
		}, false);

		function animate() {
			requestAnimationFrame(animate);
			separateTabs(tabObjects,0.7);
			renderer.render(scene, camera);
			controls.update();
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
					tabObjects.push(textMesh)
					currentTabs[textMesh.uuid] = tab;
					scene.add(textMesh);
				}, {

				});
			}

			animate();
		});
		
	} // end init

}


function onDocumentMouseUp( event,renderer,raycaster,mouse ,camera,scene ) {
	event.preventDefault();
	mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( scene.children ,true);	
	if ( intersects.length > 0 ) {			
		var tabClicked = currentTabs[intersects[0].object.parent.uuid]		
		chrome.tabs.update(tabClicked.id, {selected:true});
	}
}

// Uses bounding boxes to determine intersection with other tab objects.
// If there is a collision it translates an arbitrary distance away from the tab object.
// This method is meant to be called from a render loop (i.e. animate function)
function separateTabs(tabs,moveDistance){

	tabs.forEach(function(tabObj) {
		var tabObjGeometry = tabObj.children[1].geometry;
		var tabObjUUID = tabObj.uuid;				
		var tabObjBoundingBox = new THREE.Box3().setFromObject(tabObj);				
		for (var i = 0; i < tabs.length; i++) {					
			if (tabObjUUID !== tabs[i].uuid) {						
				var tabObjToCompareBoundingBox = new THREE.Box3().setFromObject(tabs[i]);
				if (tabObjToCompareBoundingBox.intersectsBox(tabObjBoundingBox)) {								
					var fromVector = tabObj.getWorldPosition();
					var toVector = tabs[i].getWorldPosition();					
					var dir = new THREE.Vector3();
					dir.subVectors(toVector,fromVector).normalize();	
					if(dir.x === 0 && dir.y === 0 && dir.z === 0){
						dir = new THREE.Vector3(getRandomInt(0,100),getRandomInt(0,100), 0).normalize();
					}							
					tabs[i].translateOnAxis(dir, moveDistance);
				}
			}
		}
	});
}
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}


//generate a PlaneGeometry Mesh based off of tab properties (notably title and url)
function createTab(tab, callback, options) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	ctx.font = '16pt verdana, sans-serif';
	var textWidth = ctx.measureText(tab.title);

	canvas.width = textWidth.width
	canvas.height = 16;
	ctx.fillStyle = 'rgba(0,0,0,0.0)'
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#ffffff'
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(tab.title, canvas.width / 2, canvas.height / 2);

	var texture = new THREE.Texture(canvas);
	texture.needsUpdate = true;

	var material = new THREE.MeshBasicMaterial({
		map: texture,
		transparent: true,
		side: THREE.DoubleSide
	});
	var geometry = new THREE.PlaneGeometry(canvas.width, canvas.height);

	var plane = new THREE.Mesh(geometry, material);

	var boundingBoxGeometry = new THREE.BoxGeometry(canvas.width, canvas.height, 2);
	var boundingBoxMaterial = new THREE.MeshBasicMaterial()
	boundingBoxMaterial.visible = false;
	var boxMesh = new THREE.Mesh(boundingBoxGeometry, boundingBoxMaterial);
	var tab = new THREE.Group();
	tab.add(plane);
	tab.add(boxMesh);

	callback(tab);
}

document.addEventListener('DOMContentLoaded', function() {
	bootStrap();
});
