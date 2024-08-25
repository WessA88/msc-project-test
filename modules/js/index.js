import * as THREE from 'three';

			import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
			import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';



			let camera, scene, renderer, controls;

			const objects = [];

			let raycaster;

			let moveForward = false;
			let moveBackward = false;
			let moveLeft = false;
			let moveRight = false;


			let prevTime = performance.now();
			const velocity = new THREE.Vector3();
			const direction = new THREE.Vector3();

			// Setting teh artwork paintings to an array.
			let artworks = [];
			const PROXIMITY_THRESHOLD = 4; // Adjust this value as needed

			// ArtworkInfo object 
			const artworkInfo = {
				"artwork11": {
					title: "Black Panther",
					artist: "Tolu Adegbite",
					year: 2020,
					description: "A beautiful digital painting of Black Panther. An icon to Black people worldwide."
				},
				"artwork31": {
					title: "Neo City",
					artist: "Ayo Adewumi",
					year: 2019,
					description: "A bold interpretation of how the future would look like for Nigeria. A hopeful wish."
				},
				"artwork_2001": {
					title: "Drowning",
					artist: "Kachi Azogu",
					year: 2019,
					description: "The feeling of how intense our emotions can be and how much it takes a toll on us everyday."
				},
				"artwork3003": {
					title: "Train Journey",
					artist: "Viv Kamwi",
					year: 2019,
					description: "A 3D artwork of a young girl on a train, looking out for a bright future."
				},
				"artwork3005": {
					title: "Ekaete",
					artist: "Kachi Azogu",
					year: 2021,
					description: "A 3D rendition of a day in the life of a local pure water seller."
				},
				"artwork3007": {
					title: "The Beginning",
					artist: "Kachi Azogu",
					year: 2022,
					description: "An amazing work filled with vibrant colours that engages and stuns."
					},
				"artwork3009": {
					title: "Future Past",
					artist: "Ayonete Icha",
					year: 2023,
					description: "A truly amazing work of art. Stunning entry in the 'Time' series by young artist Ayonete Icha."
					},
				"artwork4_painting": {
					title: "Ride For You",
					artist: "Ayo Adewumi",
					year: 2024,
					description: "A 3D rendition from a scene of lovers."
					},
				"artwork5_painting001": {
					title: "Present",
					artist: "Ayonete Icha",
					year: 2023,
					description: "Another wonderful entry in the 'Time' series by Ayonete Icha."
					},
				"artwork5_painting": {
					title: "Mami Water",
					artist: "Ayo Adewumi",
					year: 2023,
					description: "Classic folklore about the water spirits in Nigeria retold but with a modern, futuristic and colorful twist."
					},
				
			};

			// Add these variables at the top of your file, with the other global variables
			let audioElement, playPauseBtn, stopBtn, musicPlayer;
			let isAudioPlaying = false;


			init();

			function init() {

				camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 1000 );
				camera.position.set(4, 2, 4);

				scene = new THREE.Scene();

				scene.background = new THREE.Color( 0xffffff );
				const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 2.5 );
				light.position.set( 0.5, 1, 0.75 );
				scene.add( light );

				controls = new PointerLockControls( camera, document.body );

				const blocker = document.getElementById( 'blocker' );
				const instructions = document.getElementById( 'instructions' );

				instructions.addEventListener( 'click', function () {

					controls.lock();

				} );

				controls.addEventListener( 'lock', function () {

					instructions.style.display = 'none';
					blocker.style.display = 'none';

				} );

				controls.addEventListener( 'unlock', function () {

					blocker.style.display = 'block';
					instructions.style.display = '';

				} );

				scene.add( controls.getObject() );

				const onKeyDown = function ( event ) {

					switch ( event.code ) {

						case 'ArrowUp':
						case 'KeyW':
							moveForward = true;
							break;

						case 'ArrowLeft':
						case 'KeyA':
							moveLeft = true;
							break;

						case 'ArrowDown':
						case 'KeyS':
							moveBackward = true;
							break;

						case 'ArrowRight':
						case 'KeyD':
							moveRight = true;
							break;

					}

				};

				const onKeyUp = function ( event ) {

					switch ( event.code ) {

						case 'ArrowUp':
						case 'KeyW':
							moveForward = false;
							break;

						case 'ArrowLeft':
						case 'KeyA':
							moveLeft = false;
							break;

						case 'ArrowDown':
						case 'KeyS':
							moveBackward = false;
							break;

						case 'ArrowRight':
						case 'KeyD':
							moveRight = false;
							break;

					}

					setupAudio();

					//Allows users control music on the menu 
					controls.addEventListener('lock', function () {
						instructions.style.display = 'none';
						blocker.style.display = 'none';
						if (isAudioPlaying) {
						audioElement.play();
						}
					});

					// Modify the 'unlock' event listener
					controls.addEventListener('unlock', function () {
						blocker.style.display = 'block';
						instructions.style.display = '';
						audioElement.pause();
					});

				};

				document.addEventListener( 'keydown', onKeyDown );
				document.addEventListener( 'keyup', onKeyUp );

				raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );


				// This loads the glt/glb file for our scene.

				const gltfLoader = new GLTFLoader();
				gltfLoader.load("models/newartgallery.glb", (gltf)=>{
					console.log(gltf);
					const model = gltf.scene
					scene.add(model);

				// Identify paintings and add them to the paintings array
				model.traverse((child) => {
					if (child.isMesh && child.name.includes('artwork')) {
						artworks.push(child);
						// Create an info card for each painting
						createInfoCard(child);
					}
				});

				});

				//Unique way to set up a boundary system by using a low poly mesh and using it for mesh detection.
				gltfLoader.load("models/boundary.glb", (gltf2)=>{
					console.log(gltf2);
					gltf2.scene.traverse((n) => {
						if (n.isMesh) {
							n.material.opacity = 0;
							n.material.transparent = true;
						}
					});
					scene.add(gltf2.scene);
					objects.push(gltf2.scene);
				});


				//

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );
				document.body.appendChild( renderer.domElement );

				//

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}


			function createInfoCard(artwork) {
				const infoCard = document.createElement('div');
				infoCard.className = 'info-card';
				infoCard.style.display = 'none';

				const info = artworkInfo[artwork.name] || {
					title: "Unknown Artwork",
					artist: "Unknown Artist",
					year: "Unknown Year",
					description: "No description available."
				  };
				
				infoCard.innerHTML = `
					<h2>${info.title}</h2>
					<p>Artist: ${info.artist}</p>
					<p>Year: ${info.year}</p>
					<p>${info.description}</p>
				`;


				document.body.appendChild(infoCard);
				artwork.userData.infoCard = infoCard;
			}

			function updateInfoCards() {
				artworks.forEach(artwork => {
					const distance = camera.position.distanceTo(artwork.position);
					console.log(`Distance to ${artwork.name}: ${distance}`);  // Log the distance
			
					if (distance < PROXIMITY_THRESHOLD) {
						console.log(`Displaying info card for ${artwork.name}`);
						artwork.userData.infoCard.style.display = 'block';
					} else {
						artwork.userData.infoCard.style.display = 'none';
					}
				});
			}
			
			// Add this function after your init() function
			function setupAudio() {
				audioElement = document.getElementById('backgroundAudio');
				playPauseBtn = document.getElementById('playPauseBtn');
				stopBtn = document.getElementById('stopBtn');
	
			
				playPauseBtn.addEventListener('click', toggleAudio);
				stopBtn.addEventListener('click', stopAudio);
			}

			function toggleAudio() {
				if (isAudioPlaying) {
				  audioElement.pause();
				  playPauseBtn.textContent = 'Play';
				} else {
				  audioElement.play();
				  playPauseBtn.textContent = 'Pause';
				}
				isAudioPlaying = !isAudioPlaying;
			  }
			  
			  function stopAudio() {
				audioElement.pause();
				audioElement.currentTime = 0;
				playPauseBtn.textContent = 'Play';
				isAudioPlaying = false;
			  }
			  




			function animate() {

				const time = performance.now();

				if ( controls.isLocked === true ) {

				//COLLISION SYSTEM SETUP
				// DETECT OBSTACLE IN W
				raycaster.ray.set(camera.position, camera.getWorldDirection(new THREE.Vector3()));
				const far = 2;
				raycaster.far = far;
				const intersectsW = raycaster.intersectObjects(objects, true);
				let ObstacleW = false;
				if (intersectsW.length > 0) {
					ObstacleW = true;
				} else {
					ObstacleW = false;
				}

				// DETECT OBSTACLE IN A, S, D
				const directionRaycasterW = camera.getWorldDirection(new THREE.Vector3());
				const rotationAxis = new THREE.Vector3(0, 1, 0);
				const angles = [Math.PI * 0.5, Math.PI, Math.PI * 1.5];
				const results = [];
				for (let i = 0; i < angles.length; i++) {
					const angle = angles[i];
					const quaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle);
					const rotatedVector = directionRaycasterW
						.clone()
						.applyQuaternion(quaternion);
					const raycaster = new THREE.Raycaster(camera.position, rotatedVector);
					raycaster.far = far;
					const intersects = raycaster.intersectObjects(objects, true);
					const hasObstacle = intersects.length > 0;
					results.push(hasObstacle);
				}
				const [ObstacleA, ObstacleS, ObstacleD] = results;



				//MOVE
				const delta = ( time - prevTime ) / 1000;

				velocity.z -= velocity.z * 10.0 * delta;
				direction.z = Number(moveForward) - Number(moveBackward);
				if (ObstacleW) {
					if (moveBackward) velocity.z -= direction.z * 60.0 * delta;
				} else if (ObstacleS) {
					if (moveForward) velocity.z -= direction.z * 60.0 * delta;
				} else {
					if (moveForward || moveBackward) velocity.z -= direction.z * 60.0 * delta;
				}
				controls.moveForward(-velocity.z * delta);
				
				velocity.x -= velocity.x * 10.0 * delta;
				direction.x = Number(moveRight) - Number(moveLeft);
				if (ObstacleA) {
					if (moveRight) velocity.x -= direction.x * 60.0 * delta;
				} else if (ObstacleD) {
					if (moveLeft) velocity.x -= direction.x * 60.0 * delta;
				} else {
					if (moveLeft || moveRight) velocity.x -= direction.x * 60.0 * delta;
				}
				controls.moveRight(-velocity.x * delta);

				// Updates the visibility of info cards based on proximity
				updateInfoCards();
				

				}

				
				

				prevTime = time;


				renderer.render( scene, camera );
				

			}

