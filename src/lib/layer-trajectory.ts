import type { CustomLayerInterface } from 'maplibre-gl';
import maplibregl from 'maplibre-gl';
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

const path: [number, number, number][] = [
	[30.5198271, 50.4407942, 0],
	[30.5200271, 50.4409942, 50],
	[30.5203271, 50.4411942, 20],
	[30.5206271, 50.4413942, 200],
	[30.5206271, 50.4513942, 200],
];

function epsg4326toEpsg3857([lng, lat]: [number, number]): [number, number] {
	const R = 6378137.0;
	const x = (R * lng * Math.PI) / 180;
	const y = R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 180 / 2));
	return [x, y];
}

export function LayerTrajectory(): CustomLayerInterface {
	let map: maplibregl.Map;
	let scene: THREE.Scene;
	let camera: THREE.Camera;
	let renderer: THREE.WebGLRenderer;
	let mercator: maplibregl.MercatorCoordinate;

	return {
		id: '3d-trajectory',
		type: 'custom',
		renderingMode: '3d',

		onAdd(_, gl) {
			map = _;
			scene = new THREE.Scene();
			camera = new THREE.Camera();

			const origin = path[0];
			// const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(20, 30, 0), new THREE.Vector3(40, 0, 50)];
			//

			const originCoord = maplibregl.MercatorCoordinate.fromLngLat([origin[0], origin[1]]);
			const scale = originCoord.meterInMercatorCoordinateUnits();

			const points = path.map((p) => {
				const coord = maplibregl.MercatorCoordinate.fromLngLat([p[0], p[1]], p[2]);
				// const pointMeters = maplibregl.MercatorCoordinate.fromLngLat([p[0], p[1]]);
				// const scale = pointMeters.meterInMercatorCoordinateUnits();
				return new THREE.Vector3(
					(coord.x - originCoord.x) / scale,
					(coord.z - originCoord.z) / scale,
					-(coord.y - originCoord.y) / scale,
				);
			});

			console.log(points);

			const spline = new THREE.CatmullRomCurve3(points);
			const divisions = Math.round(12 * points.length);
			const sampled = spline.getPoints(divisions);

			const positions = [];
			for (const pt of sampled) {
				positions.push(pt.x, pt.y, pt.z);
			}

			const geometry = new LineGeometry();
			geometry.setPositions(positions);

			const material = new LineMaterial({
				color: 0xff0000,
				linewidth: 10,
				dashed: false,
			});

			const line = new Line2(geometry, material);
			line.computeLineDistances();
			scene.add(line);

			// const geometry = new THREE.BoxGeometry(100, 100, 100);
			// const material = new THREE.MeshStandardMaterial({
			// 	color: 0x10ff10,
			// 	transparent: true,
			// 	opacity: 0.2,
			// });
			// const cube = new THREE.Mesh(geometry, material);
			// cube.translateZ(0);
			// scene.add(cube);

			scene.add(new THREE.AxesHelper(200));

			renderer = new THREE.WebGLRenderer({
				canvas: map.getCanvas(),
				context: gl,
				antialias: true,
			});
			renderer.autoClear = false;
		},

		render(gl, options) {
			const modelMatrix = map.transform.getMatrixForModel([30.5198271, 50.4407942], 0);
			const m = new THREE.Matrix4().fromArray(options.defaultProjectionData.mainMatrix);
			const l = new THREE.Matrix4().fromArray(modelMatrix);
			camera.projectionMatrix = m.multiply(l);
			renderer.resetState();
			renderer.render(scene, camera);
			map.triggerRepaint();
		},
	};
}
