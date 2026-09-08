var currentLat = '';
var currentLng = '';
var zoom = 18;
var meMarker = '';
var img = "https://k3a.wiselink.net.cn/img/app/currentLocation.png"
var markers = []
var lastClickedMarker = null;
let openInfoWindow;
var info = [];
var map;
var isMapInitialized = false;
var isFirstLoad = true;
var hasMyLocation = false;
var vehicle_info = {};

var trackPolyline = null;
var trackPointsData = [];

const buttonTexts = {
	'enUs': {
		btnReturnLang: "Return",
		btn3Lang: "Unlock",
		btn1Lang: "Lock",
		btn5Lang: "Locate",
		btnSeeLang: "Photos",
		btn8Lang: "Block",
		btn6Lang: "Unblock",
		trajectory: 'Track Playback'
	},
	'zhCn': {
		btnReturnLang: "归还车辆",
		btn3Lang: "开锁",
		btn1Lang: "关锁",
		btn5Lang: "寻车",
		btnSeeLang: "送车拍照",
		btn8Lang: "风控拦截",
		btn6Lang: "取消拦截",
		trajectory: '轨迹查询'
	}
};

window.onAppMessage = function(data) {
	console.log("==== onAppMessage接收全部data ====", data);
	info = data.payload || [];
	vehicle_info = data.vehicle_info || {};
	trackPointsData = Array.isArray(data.lat) ? data.lat : [];


	if (isMapInitialized) {
		createMarkers();
		renderCurrentTrack();
	}
	const langData = buttonTexts[data.lang] || buttonTexts['zhCn'];
	Object.entries(langData).forEach(([id, text]) => {
		const element = document.getElementById(id);
		if (element) element.textContent = text;
	});
};

function renderCurrentTrack() {
	if (trackPointsData.length > 0) {
		drawTrack(trackPointsData);
	} else {
		clearTrack();
	}
}

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: zoom,
		center: {
			lat: 22.5431,
			lng: 114.0579
		}
	});
	isMapInitialized = true;
	console.log("地图初始化完成");
	if (info.length > 0) {
		createMarkers();
	}
	renderCurrentTrack();
	if (hasMyLocation) {
		setMePositioning();
		if (markers.length === 0) {
			map.setCenter({
				lat: currentLat,
				lng: currentLng
			});
		}
	}
}

function requestGeolocation() {
	if (!navigator.geolocation) return;
	navigator.geolocation.getCurrentPosition(position => {
		currentLat = position.coords.latitude;
		currentLng = position.coords.longitude;
		hasMyLocation = true;
		if (isMapInitialized) {
			setMePositioning();
			if (markers.length === 0) {
				map.setCenter({
					lat: currentLat,
					lng: currentLng
				});
			}
		}
	}, fail => {
		console.warn('获取位置失败:', fail);
	}, {
		enableHighAccuracy: false,
		timeout: 5000
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', requestGeolocation);
} else {
	requestGeolocation();
}

function setMePositioning() {
	meMarker = new google.maps.Marker({
		position: {
			lat: currentLat,
			lng: currentLng
		},
		icon: {
			url: img,
			scaledSize: new google.maps.Size(50, 50)
		},
		animation: 'BOUNCE',
		map: map
	});
}

function createMarkers() {
	console.log('创建标记点:', vehicle_info);
	clearMarkers();
	info.forEach((item, index) => {
		if (!item || !item.latitude || !item.longitude) {
			console.warn('无效项:', item);
			return;
		}
		const marker = new google.maps.Marker({
			position: {
				lat: item.latitude,
				lng: item.longitude
			},
			title: item.plateNumber,
			icon: {
				url: 'https://k3a.wiselink.net.cn/img/app/g_location.png',
				scaledSize: new google.maps.Size(17, 36)
			},
			address: item.address,
			sn: item.sn,
			map: map
		});
		markers.push(marker);
		setupMarkerEvents(marker, index);
	});
	if (isFirstLoad && markers.length > 0) {
		openMatchingMarkerInfoWindow();
		isFirstLoad = false;
	}
}

function drawTrack(pointList) {
	try {
		clearTrack();
		console.log("drawTrack原始点：", pointList);

		// 兼容两种字段 lat/lng ｜ latitude/longitude
		const pathArr = pointList.filter(p => {
			const la = p.lat ?? p.latitude;
			const ln = p.lng ?? p.longitude;
			return la && ln && Number(la) !== 0 && Number(ln) !== 0;
		}).map(p => {
			return {
				lat: Number(p.lat ?? p.latitude),
				lng: Number(p.lng ?? p.longitude)
			};
		});

		console.log("组装pathArr：", pathArr);

		if (pathArr.length < 2) {
			console.warn("轨迹点不足2个，放弃绘制");
			return;
		}

		trackPolyline = new google.maps.Polyline({
			path: pathArr,
			strokeColor: "#FF0000",
			strokeOpacity: 0.9,
			strokeWeight: 6,
			map: map
		});

		console.log("✅Polyline创建完成", trackPolyline);

		// 强制镜头缩放到轨迹范围，必开！
		const bounds = new google.maps.LatLngBounds();
		pathArr.forEach(p => bounds.extend(p));
		map.fitBounds(bounds);

	} catch (e) {
		console.error("drawTrack异常", e);
	}
}

function clearTrack() {
	if (trackPolyline) {
		trackPolyline.setMap(null);
		trackPolyline = null;
		console.log("清除旧轨迹");
	}
}

function openMatchingMarkerInfoWindow() {
	if (!vehicle_info || !vehicle_info.sn) return;
	let matchingMarker = markers.find(m => m.sn === vehicle_info.sn) || markers.find(m => m.sn.toString() ===
		vehicle_info.sn.toString());
	if (matchingMarker) {
		map.panTo(matchingMarker.getPosition());
		setTimeout(() => google.maps.event.trigger(matchingMarker, 'click'), 500);
	}
}

function setupMarkerEvents(marker, index) {
	const contentString = `<div><div class="infoWindow-title">${marker.title}</div><p>${marker.address}</p></div>`;
	const infowindow = new google.maps.InfoWindow({
		content: contentString,
		maxWidth: 200,
		disableAutoPan: true
	});
	marker.addListener('click', () => {
		if (lastClickedMarker) lastClickedMarker.setAnimation(null);
		marker.setAnimation(google.maps.Animation.BOUNCE);
		lastClickedMarker = marker;
		if (openInfoWindow) openInfoWindow.close();
		infowindow.open(map, marker);
		openInfoWindow = infowindow;
		map.panTo(marker.getPosition());
	});
}

function clearMarkers() {
	markers.forEach(m => m.setMap(null));
	markers = [];
}
// 修复按钮点击事件，type字段
document.getElementById('btn1').addEventListener('click', () => {
	uni.postMessage({
		source: 1
	});
});
document.getElementById('btn3').addEventListener('click', () => {
	uni.postMessage({
		source: 3,
		payload: info
	});
});
document.getElementById('btn5').addEventListener('click', () => {
	uni.postMessage({
		source: 5,
		payload: info
	});
});
document.getElementById('btn8').addEventListener('click', () => {
	uni.postMessage({
		source: 8,
		payload: info
	});
});
document.getElementById('btn6').addEventListener('click', () => {
	uni.postMessage({
		source: 6,
		payload: info
	});
});

document.getElementById('trajectory').addEventListener('click', () => {
	console.log('【5】点击了轨迹查询按钮');
	uni.postMessage({
		data: {
		source: 100,
		payload: info
		}
	});
});
window.initMap = initMap;
uni.postMessage({
	data: {
		type: 'webview-ready'
	}
});