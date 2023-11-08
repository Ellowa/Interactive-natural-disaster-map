async function storeVideoWithMetadata() {
	const uavVideoTitle = document.getElementById('uavVideoTitle').value;
	const uavVideoEventId = document.getElementById('uavVideoEventId').value;
	const uavVideoDate = document.getElementById('uavVideoDate').value;
	const uavVideoLongitude = document.getElementById('uavVideoLongitude').value;
	const uavVideoLatitude = document.getElementById('uavVideoLatitude').value;

	const videoInput = document.getElementById('videoInput');
	const videoFile = videoInput.files[0];

	// Write video and metadata
	try {
		const metadata = [];

		metadata.title = uavVideoTitle;
		metadata.eventId = uavVideoEventId;
		metadata.startDate = uavVideoDate;
		metadata.longitude = uavVideoLongitude;
		metadata.latitude = uavVideoLatitude;

		// request to save video file and update metadata should be here

		const updatedBlob = new Blob([videoFile], {
			type: videoFile.type,
		});

		const videoURL = URL.createObjectURL(updatedBlob);

		const videoPlayer = document.getElementById('videoPlayer');
		videoPlayer.src = videoURL;
	} catch (error) {
		console.error('Error updating metadata:', error);
	}
}

function readVideoMetadata() {
	const videoInput = document.getElementById('videoInput');
	const videoFile = videoInput.files[0];

	if (videoFile.type.match('video.*')) {
		fetch('./uavVideos/videoInfo.json')
			.then(response => response.json())
			.then(data => 
				{
					let currentMetaData = data.features.find(el => el.properties.title == videoInput.files[0].name);
					console.log(currentMetaData);
				})
			.catch(error => console.error('Error fetching JSON:', error));
	} else {
		console.error('Please select a video file');
	}
}

function addVideoOnMap(){
	fetch('../uavVideoSystem/uavVideos/videoInfo.json')
		.then(response => response.json())
		.then(videoInfo => {
			for (const videoFeature of videoInfo.features) {
				let layerID = videoFeature.properties.category;
				let fullLayerID = videoFeature.properties.src;

				map.addSource(fullLayerID, {
					type: 'geojson',
					data: videoFeature,
				});

				// Add video image
				let videoElement = addVideoIconSync(fullLayerID, videoFeature.properties.src);
				
				// Add new map layer for each video
				//allLayersID.push(fullLayerID);
				map.addLayer({
					id: fullLayerID,
					type: 'symbol',
					source: fullLayerID,
					layout: {
						'icon-image': `${fullLayerID}`,
						'icon-size': 1,
						'text-field': `Video date: ${videoFeature.properties.startDate}`,
						'text-size': 15,
						'text-offset': [0, 3.9],
					},
					paint: {
						'text-color': 'black',
					},
					filter: ['==', 'category', layerID],
				});
				// Add video event filter
				addEventListenerToEventFilterSync(layerID, fullLayerID);

				// Click on video image
				UavVideoMarkerOnClick(fullLayerID, videoElement);
			}
		})
		.catch(error => console.error('Error fetching JSON:', error));
}

function addVideoIconSync(fullLayerID, videoSrc) {
	let video = document.createElement('video');
	video.style = 'max-width: 500px';
	video.src = videoSrc;
	video.controls = true;
	video.currentTime = 1;

	video.autoplay = true;

	video.addEventListener('loadeddata', function () {
		let canvas = document.createElement('canvas');
		canvas.style = 'max-width: 100px';
		let ctx = canvas.getContext('2d');

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

		let imgDataUrl = canvas.toDataURL('image/png');

		let image = new Image();
		image.src = imgDataUrl;
		image.width = 147;
		image.height = 82;

		document.body.append(image);
		if (!map.hasImage(`${fullLayerID}`)){
			map.addImage(`${fullLayerID}`, image);
		} 
		else{
			map.updateImage(`${fullLayerID}`, image);
		}
	});

	return video;
}

function UavVideoMarkerOnClick(LayerId, videoElement) {
	map.on('click', LayerId, e => {
		const coordinates = e.features[0].geometry.coordinates;

		// Формируем html описание события
		let eventDescription =
			`<div class='uavVideoPopup'>
        <p>Event Id: ${e.features[0].properties.eventId}</p>
        <p>Video title: ${e.features[0].properties.title}</p>
        <p>Coordinates: ${coordinates}</p>
        <p>Video date: ${e.features[0].properties.startDate}</p>` + videoElement.outerHTML + '</div>';

		new mapboxgl.Popup().setLngLat(coordinates).setHTML(eventDescription).addTo(map);
	});

	// Меняем тип курсора при наведение на маркер
	map.on('mouseenter', LayerId, e => {
		map.getCanvas().style.cursor = 'pointer';
		map.getCanvas().title = 'Play ' + e.features[0].properties.title + ' video';
	});

	// Меняем тип курсора при выходе из маркера
	map.on('mouseleave', LayerId, () => {
		map.getCanvas().style.cursor = '';
	});
}