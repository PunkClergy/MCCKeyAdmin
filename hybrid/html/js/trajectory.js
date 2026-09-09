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
let currentLang = 'zhCn';
// ============ 新增Google Key常量 ============
const GOOGLE_API_KEY = 'AIzaSyDGzLnrbvfiqdmemX8yR4CTc6n2SzjOaBM';
const DEFAULT_LANG = 'zhCn';

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

// ============ 新增：逆地理解析函数 resolveAddress ============
/**
 * 地址解析：根据经纬度+当前语言，调用谷歌Geocode获取对应语言地址
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string>}
 */
async function resolveAddress(lat, lng) {
	try {
		// zhCn -> zh-cn，enUs -> en-us，适配google geocode language参数
		const mapLang = currentLang.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
		const url =
			`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}&language=${mapLang}`;
		const res = await fetch(url);
		const data = await res.json();
		if (data.status === 'OK' && data.results.length) {
			return data.results[0].formatted_address;
		}
	} catch (err) {
		console.error('地址解析失败:', err);
	}
	return '地址获取失败';
}

// ============ 修改 onAppMessage 为async，createMarkers前面加await ============
window.onAppMessage = async function(data) {
	console.log("==== onAppMessage接收全部data ====", data);
	info = data.payload || [];
	vehicle_info = data.vehicle_info || {};
	trackPointsData = Array.isArray(data.lat) ? data.lat : [];
	if (data.lang) {
		currentLang = data.lang;
	}
	if (isMapInitialized) {
		await createMarkers();
		renderCurrentTrack();
	}
	const langData = buttonTexts[currentLang] || buttonTexts['zhCn'];
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
	// 点击地图空白处关闭弹窗、取消选中
	map.addListener('click', () => {
		if (openInfoWindow) {
			openInfoWindow.close();
			openInfoWindow = null;
		}
		if (lastClickedMarker) {
			lastClickedMarker.setAnimation(null);
			lastClickedMarker = null;
		}
	});
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

// ============ 修改 createMarkers：async + for...of串行，调用resolveAddress ============
async function createMarkers() {
	console.log('创建标记点:', vehicle_info);
	clearMarkers();
	for (const item of info) {
		if (!item || !item.latitude || !item.longitude) {
			console.warn('无效项:', item);
			continue;
		}
		// 不再读取item.address / address_enUs，改为调用谷歌逆地理
		const markerAddress = await resolveAddress(item.latitude, item.longitude);
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
			address: markerAddress,
			sn: item.sn,
			map: map
		});
		markers.push(marker);
		setupMarkerEvents(marker);
	}
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
// ============ setupMarkerEvents 去掉index参数 ============
function setupMarkerEvents(marker) {
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
		// 点击车辆图标向上层uni-app发送选中车辆SN+车牌号
		console.log('点击车辆图标，选中SN：', marker.sn, marker.title);
		uni.postMessage({
			data: {
				source: 'sn',
				sn: marker.sn,
				plateNumber: marker.title
			}
		});
	});
}

function clearMarkers() {
	markers.forEach(m => m.setMap(null));
	markers = [];
}
// 按钮事件绑定
document.getElementById('btn1').addEventListener('click', () => {
	uni.postMessage({
		data: {
			source: 1
		}
	});
});
document.getElementById('btn3').addEventListener('click', () => {
	uni.postMessage({
		data: {
			source: 3,
			payload: info
		}
	});
});
document.getElementById('btn5').addEventListener('click', () => {
	uni.postMessage({
		data: {
			source: 5,
			payload: info
		}
	});
});
document.getElementById('btn8').addEventListener('click', () => {
	uni.postMessage({
		data: {
			source: 8,
			payload: info
		}
	});
});
document.getElementById('btn6').addEventListener('click', () => {
	uni.postMessage({
		data: {
			source: 6,
			payload: info
		}
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