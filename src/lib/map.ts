import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LayerModel } from './layer-model';
import { LayerTrajectory } from './layer-trajectory';

const style = 'https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/openStreetMap.json';
const center: [number, number] = [30.5198271, 50.4407942];

export function map(container: HTMLElement) {
	const map = new maplibregl.Map({
		container: container,
		style,
		// style: {
		// 	version: 8,
		// 	sources: {},
		// 	layers: [],
		// },
		center: center,
		zoom: 17,
		canvasContextAttributes: { antialias: true },
	});

	map.on('load', () => {
		const model = LayerModel(center);
		const trajectory = LayerTrajectory();
		map.addLayer(model);
		map.addLayer(trajectory);
	});
}
