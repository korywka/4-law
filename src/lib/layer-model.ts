import type { CustomLayerInterface, LngLatLike } from 'maplibre-gl';
import maplibregl from 'maplibre-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function LayerModel(origin: LngLatLike): CustomLayerInterface {
	let map: maplibregl.Map;
	let scene: THREE.Scene;
	let camera: THREE.Camera;
	let renderer: THREE.WebGLRenderer;

	return {
		id: '3d-model',
		type: 'custom',
		renderingMode: '3d',
		onAdd(_, gl) {
			map = _;
			scene = new THREE.Scene();
			camera = new THREE.Camera();

			const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
			scene.add(hemisphereLight);

			const ambientLight = new THREE.AmbientLight(0xffffff, 1);
			scene.add(ambientLight);

			const loader = new GLTFLoader();
			loader.load('/4-law/vehicle.glb', (model) => {
				scene.add(model.scene);
			});

			renderer = new THREE.WebGLRenderer({
				canvas: map.getCanvas(),
				context: gl,
				antialias: true,
			});

			renderer.autoClear = false;
			renderer.toneMapping = THREE.ACESFilmicToneMapping;
			renderer.toneMappingExposure = 30;
		},
		render(gl, options) {
			const altitude = 0;
			const modelMatrix = map.transform.getMatrixForModel(origin, altitude);
			const m = new THREE.Matrix4().fromArray(options.defaultProjectionData.mainMatrix);
			const l = new THREE.Matrix4().fromArray(modelMatrix);

			camera.projectionMatrix = m.multiply(l);
			renderer.resetState();
			renderer.render(scene, camera);
			map.triggerRepaint();
		},
	};
}
