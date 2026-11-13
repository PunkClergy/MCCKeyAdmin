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
var trackPointsData = [];
// ============ 轨迹回放状态 ============
var trackPath = [];
var trackPolylineDone = null;
var trackPolylineRest = null;
var playbackMarker = null;
var playbackTimer = null;
var PLAYBACK_SPEEDS = [1, 2, 4, 8];
var PLAYBACK_TICK = 60;
var playback = {
	playing: false,
	speed: 1,
	elapsed: 0,
	duration: 0,
	trackKey: ''
};
let currentLang = 'enUs';
// ============ 新增Google Key常量 ============
const GOOGLE_API_KEY = 'AIzaSyDGzLnrbvfiqdmemX8yR4CTc6n2SzjOaBM';
const DEFAULT_LANG = 'enUs';

const buttonTexts = {
	'zhCn': {
		btnReturnLang: "归还车辆",
		btn3Lang: "开锁",
		btn1Lang: "关锁",
		btn5Lang: "寻车",
		btnSeeLang: "送车拍照",
		btn8Lang: "风控拦截",
		btn6Lang: "取消拦截",
		trajectory: "轨迹查询",
	},
	'enUs': {
		btnReturnLang: "Return",
		btn3Lang: "Unlock",
		btn1Lang: "Lock",
		btn5Lang: "Locate",
		btnSeeLang: "Photos",
		btn8Lang: "Block",
		btn6Lang: "Unblock",
		trajectory: "Track Playback",
	},
	'msMy': {
		btnReturnLang: "Pulang Kenderaan",
		btn3Lang: "Buka Kunci",
		btn1Lang: "Tutup Kunci",
		btn5Lang: "Cari Kereta",
		btnSeeLang: "Gambar",
		btn8Lang: "Sekat Risiko",
		btn6Lang: "Batal Sekatan",
		trajectory: "Main Semula Laluan",
	},
	'ptBr': {
		btnReturnLang: "Devolver Veículo",
		btn3Lang: "Destravar",
		btn1Lang: "Travar",
		btn5Lang: "Localizar",
		btnSeeLang: "Fotos",
		btn8Lang: "Bloquear",
		btn6Lang: "Desbloquear",
		trajectory: "Reprodução de Trajeto",
	},
	'taSg': {
		btnReturnLang: "வாகனத்தைத் திருப்பி",
		btn3Lang: "திற",
		btn1Lang: "பூட்டு",
		btn5Lang: "கண்டுபிடி",
		btnSeeLang: "புகைப்படங்கள்",
		btn8Lang: "தடு",
		btn6Lang: "தடுப்பை நீக்கு",
		trajectory: "பாதை மீண்டும் இயக்கம்",
	},
	'thTh': {
		btnReturnLang: "คืนรถ",
		btn3Lang: "ปลดล็อก",
		btn1Lang: "ล็อก",
		btn5Lang: "ค้นหารถ",
		btnSeeLang: "รูปถ่าย",
		btn8Lang: "สกัดกั้น",
		btn6Lang: "ยกเลิกสกัดกั้น",
		trajectory: "เล่นย้อนรอยเส้นทาง",
	},
	'idId': {
		btnReturnLang: "Kembalikan Kendaraan",
		btn3Lang: "Buka Kunci",
		btn1Lang: "Kunci",
		btn5Lang: "Cari Kendaraan",
		btnSeeLang: "Foto",
		btn8Lang: "Blokir",
		btn6Lang: "Buka Blokir",
		trajectory: "Pemutaran Jejak Perjalanan",
	},
	'miNz': {
		btnReturnLang: "Whakahoki waka",
		btn3Lang: "Wewete",
		btn1Lang: "Muku",
		btn5Lang: "Kimihia",
		btnSeeLang: "Whakaahua",
		btn8Lang: "Aukati",
		btn6Lang: "Wewete aukati",
		trajectory: "Takahanga ara",
	},
	'esEs': {
		btnReturnLang: "Devolver",
		btn3Lang: "Desbloquear",
		btn1Lang: "Bloquear",
		btn5Lang: "Localizar",
		btnSeeLang: "Fotos",
		btn8Lang: "Bloquear",
		btn6Lang: "Desbloquear",
		trajectory: "Reproducción de trayecto",
	},

};
const addressFail = {
	'zhCn': "地址获取失败",
	'enUs': "Address unavailable",
	'msMy': "Alamat tidak tersedia",
	'ptBr': "Endereço indisponível",
	'taSg': "முகவரி கிடைக்கவில்லை",
	'thTh': "ไม่พบที่อยู่",
	'idId': "Alamat tidak tersedia",
	'miNz': "Kāore te wāhi wātea",
	'esEs': "Dirección no disponible",

};
const mapSdkNotReady = {
	'zhCn': "地图SDK未就绪",
	'enUs': "Map SDK not ready",
	'msMy': "SDK peta belum sedia",
	'ptBr': "SDK do mapa não pronto",
	'taSg': "வரைபடம் SDK தயாராகவில்லை",
	'thTh': "SDK แผนที่ยังไม่พร้อม",
	'idId': "SDK peta belum siap",
	'miNz': "Kāore te SDK mahere i te rite",
	'esEs': "SDK del mapa no disponible",

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
	return addressFail[currentLang] || addressFail.enUs;
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
	const langData = buttonTexts[currentLang] || buttonTexts[DEFAULT_LANG];
	Object.entries(langData).forEach(([id, text]) => {
		const element = document.getElementById(id);
		if (element) element.textContent = text;
	});
};

// 同一条轨迹重复下发时不重建，避免打断正在进行的回放
function trackFingerprint(list) {
	if (!list || !list.length) return '';
	var first = list[0] || {};
	var last = list[list.length - 1] || {};
	return [
		list.length,
		first.gpstime || first.gpsTime || first.latitude || first.lat || '',
		first.longitude || first.lng || '',
		last.gpstime || last.gpsTime || ''
	].join('|');
}

function normalizeTrack(pointList) {
	var list = [];
	(pointList || []).forEach(function (p, i) {
		if (!p) return;
		var la = Number(p.lat != null ? p.lat : p.latitude);
		var ln = Number(p.lng != null ? p.lng : p.longitude);
		if (!isFinite(la) || !isFinite(ln)) return;
		if (la === 0 && ln === 0) return;
		var t = Number(p.gpstime != null ? p.gpstime : (p.gpsTime != null ? p.gpsTime : p.time));
		list.push({
			lat: la,
			lng: ln,
			time: isFinite(t) ? t : NaN,
			idx: i
		});
	});
	var allTimed = list.length > 0;
	for (var i = 0; i < list.length; i++) {
		if (!isFinite(list[i].time)) {
			allTimed = false;
			break;
		}
	}
	if (allTimed) {
		list.sort(function (a, b) {
			return a.time - b.time;
		});
	}
	return {
		list: list,
		timed: allTimed
	};
}

// 无时间戳时按 1 秒/点补一条单调时间轴；有时间戳时保证严格递增
function buildTimedPath(list, timed) {
	var out = [];
	var lastTime = -Infinity;
	for (var i = 0; i < list.length; i++) {
		var t;
		if (timed) {
			t = list[i].time;
			if (!(t > lastTime)) t = lastTime + 1;
			lastTime = t;
		} else {
			t = i * 1000;
		}
		out.push({
			lat: list[i].lat,
			lng: list[i].lng,
			time: t
		});
	}
	return out;
}

function renderCurrentTrack() {
	try {
		var list = trackPointsData || [];
		var key = trackFingerprint(list);
		if (key === playback.trackKey) {
			return;
		}
		stopPlayback();
		clearTrack();
		playback.trackKey = key;
		playback.elapsed = 0;
		if (!list.length) {
			return;
		}
		var normalized = normalizeTrack(list);
		if (!normalized.list.length) {
			return;
		}
		if (normalized.list.length < 2) {
			// 单点轨迹没有回放意义：只把镜头挪过去
			map.setZoom(16);
			map.setCenter({
				lat: normalized.list[0].lat,
				lng: normalized.list[0].lng
			});
			return;
		}
		trackPath = buildTimedPath(normalized.list, normalized.timed);
		playback.duration = trackPath[trackPath.length - 1].time - trackPath[0].time;
		if (!(playback.duration > 0)) {
			playback.duration = (trackPath.length - 1) * 1000;
		}
		drawTrackBase();
		fitTrackBounds();
		showPlaybackBar();
		renderPlaybackAt(0);
		console.log('轨迹就绪，共 ' + trackPath.length + ' 点，时长 ' + playback.duration + 'ms');
	} catch (e) {
		console.error('renderCurrentTrack异常', e);
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

// ============ 轨迹绘制 ============
function drawTrackBase() {
	if (!map || trackPath.length < 2) return;
	var fullPath = trackPath.map(function (p) {
		return {
			lat: p.lat,
			lng: p.lng
		};
	});
	// 未走段：主题蓝灰；已走段：红（沿用原轨迹色）
	trackPolylineRest = new google.maps.Polyline({
		path: fullPath,
		strokeColor: "#9BB4C4",
		strokeOpacity: 0.85,
		strokeWeight: 6,
		map: map,
		zIndex: 10,
		clickable: false
	});
	trackPolylineDone = new google.maps.Polyline({
		path: [{
			lat: trackPath[0].lat,
			lng: trackPath[0].lng
		}],
		strokeColor: "#FF0000",
		strokeOpacity: 0.95,
		strokeWeight: 6,
		map: map,
		zIndex: 11,
		clickable: false
	});
}

function fitTrackBounds() {
	if (!map || trackPath.length < 2) return;
	var bounds = new google.maps.LatLngBounds();
	trackPath.forEach(function (p) {
		bounds.extend({
			lat: p.lat,
			lng: p.lng
		});
	});
	// 底部留出播放条空间，避免轨迹被端
	map.fitBounds(bounds, {
		top: 40,
		right: 30,
		bottom: 200,
		left: 30
	});
	// 直线轨迹 fitBounds 会贴到最大层级，限一下
	google.maps.event.addListenerOnce(map, 'idle', function () {
		if (map.getZoom() > 17) map.setZoom(17);
	});
}

function clearTrack() {
	if (trackPolylineDone) {
		trackPolylineDone.setMap(null);
		trackPolylineDone = null;
	}
	if (trackPolylineRest) {
		trackPolylineRest.setMap(null);
		trackPolylineRest = null;
	}
	if (playbackMarker) {
		playbackMarker.setMap(null);
		playbackMarker = null;
	}
	trackPath = [];
	playback.duration = 0;
	hidePlaybackBar();
	console.log("清除旧轨迹");
}

// ============ 回放控制 ============
function fmtDuration(ms) {
	if (!isFinite(ms) || ms < 0) ms = 0;
	var total = Math.round(ms / 1000);
	var m = Math.floor(total / 60);
	var s = total % 60;
	return (m < 10 ? '0' + m : '' + m) + ':' + (s < 10 ? '0' + s : '' + s);
}

function bearingBetween(a, b) {
	var dLng = (b.lng - a.lng) * Math.PI / 180;
	var la1 = a.lat * Math.PI / 180;
	var la2 = b.lat * Math.PI / 180;
	var y = Math.sin(dLng) * Math.cos(la2);
	var x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLng);
	if (x === 0 && y === 0) return 0;
	return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function playbackPointAt(elapsed) {
	var t0 = trackPath[0].time;
	var target = t0 + elapsed;
	var n = trackPath.length;
	var i = 0;
	for (i = 0; i < n - 1; i++) {
		if (trackPath[i + 1].time >= target) break;
	}
	var seg = Math.min(i, n - 2);
	var a = trackPath[seg];
	var b = trackPath[seg + 1];
	var span = b.time - a.time;
	var ratio = span > 0 ? (target - a.time) / span : 0;
	if (ratio < 0) ratio = 0;
	if (ratio > 1) ratio = 1;
	return {
		lat: a.lat + (b.lat - a.lat) * ratio,
		lng: a.lng + (b.lng - a.lng) * ratio,
		bearing: bearingBetween(a, b),
		seg: seg
	};
}

function playbackIcon(bearing) {
	return {
		path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
		scale: 6,
		fillColor: '#1E90FF',
		fillOpacity: 1,
		strokeColor: '#FFFFFF',
		strokeWeight: 2,
		rotation: Math.round(bearing || 0)
	};
}

function renderPlaybackAt(elapsed) {
	if (!map || trackPath.length < 2) return;
	if (!isFinite(elapsed)) elapsed = 0;
	if (elapsed < 0) elapsed = 0;
	if (elapsed > playback.duration) elapsed = playback.duration;
	var pt = playbackPointAt(elapsed);
	var pos = {
		lat: pt.lat,
		lng: pt.lng
	};
	if (!playbackMarker) {
		playbackMarker = new google.maps.Marker({
			position: pos,
			map: map,
			zIndex: 30,
			clickable: false,
			icon: playbackIcon(pt.bearing)
		});
	} else {
		playbackMarker.setPosition(pos);
		playbackMarker.setIcon(playbackIcon(pt.bearing));
	}
	if (trackPolylineDone) {
		var donePath = trackPath.slice(0, pt.seg + 1).map(function (p) {
			return {
				lat: p.lat,
				lng: p.lng
			};
		});
		donePath.push(pos);
		trackPolylineDone.setPath(donePath);
	}
	if (trackPolylineRest) {
		var restPath = [pos].concat(trackPath.slice(pt.seg + 1).map(function (p) {
			return {
				lat: p.lat,
				lng: p.lng
			};
		}));
		trackPolylineRest.setPath(restPath);
	}
	updatePlaybackUI(elapsed);
}

function updatePlaybackButton() {
	var btn = document.getElementById('pbPlay');
	if (!btn) return;
	if (playback.playing) {
		// 暂停态交给 CSS 双竖条绘制，不依赖字体字符
		btn.classList.add('is-playing');
		btn.textContent = '';
		return;
	}
	btn.classList.remove('is-playing');
	if (playback.duration > 0 && playback.elapsed >= playback.duration - 1) {
		btn.textContent = '↻';
	} else {
		btn.textContent = '▶';
	}
}

function updatePlaybackUI(elapsed) {
	if (!isFinite(elapsed)) elapsed = 0;
	var curEl = document.getElementById('pbTimeCur');
	var allEl = document.getElementById('pbTimeAll');
	var rangeEl = document.getElementById('pbRange');
	var speedEl = document.getElementById('pbSpeed');
	if (curEl) curEl.textContent = fmtDuration(elapsed);
	if (allEl) allEl.textContent = fmtDuration(playback.duration);
	if (rangeEl) {
		rangeEl.value = playback.duration > 0 ? String(Math.round(elapsed / playback.duration * 1000)) : '0';
	}
	if (speedEl) speedEl.textContent = playback.speed + 'x';
	updatePlaybackButton();
}

function showPlaybackBar() {
	var bar = document.getElementById('playbackBar');
	var pill = document.getElementById('trajectory');
	if (bar) bar.classList.add('visible');
	if (pill) pill.classList.add('shifted');
	updatePlaybackUI(playback.elapsed);
}

function hidePlaybackBar() {
	var bar = document.getElementById('playbackBar');
	var pill = document.getElementById('trajectory');
	if (bar) bar.classList.remove('visible');
	if (pill) pill.classList.remove('shifted');
	updatePlaybackUI(0);
}

function stopPlayback() {
	playback.playing = false;
	if (playbackTimer) {
		clearInterval(playbackTimer);
		playbackTimer = null;
	}
	updatePlaybackButton();
}

function startPlayback() {
	if (trackPath.length < 2 || playback.duration <= 0) return;
	if (playback.elapsed >= playback.duration) {
		playback.elapsed = 0;
	}
	stopPlayback();
	playback.playing = true;
	updatePlaybackButton();
	var lastTick = Date.now();
	playbackTimer = setInterval(function () {
		if (!playback.playing) {
			stopPlayback();
			return;
		}
		var now = Date.now();
		var dt = now - lastTick;
		lastTick = now;
		playback.elapsed += dt * playback.speed;
		if (playback.elapsed >= playback.duration) {
			playback.elapsed = playback.duration;
			renderPlaybackAt(playback.elapsed);
			stopPlayback();
			return;
		}
		renderPlaybackAt(playback.elapsed);
	}, PLAYBACK_TICK);
}

function seekPlayback(ratio) {
	if (playback.duration <= 0) return;
	if (ratio < 0) ratio = 0;
	if (ratio > 1) ratio = 1;
	playback.elapsed = ratio * playback.duration;
	renderPlaybackAt(playback.elapsed);
}

function bindPlaybackUI() {
	var playBtn = document.getElementById('pbPlay');
	var rangeEl = document.getElementById('pbRange');
	var speedEl = document.getElementById('pbSpeed');
	if (playBtn) {
		playBtn.addEventListener('click', function () {
			if (!trackPath.length) return;
			if (playback.playing) {
				stopPlayback();
				return;
			}
			startPlayback();
		});
	}
	if (rangeEl) {
		rangeEl.addEventListener('input', function () {
			seekPlayback(Number(rangeEl.value) / 1000);
		});
	}
	if (speedEl) {
		speedEl.addEventListener('click', function () {
			var pos = PLAYBACK_SPEEDS.indexOf(playback.speed);
			playback.speed = PLAYBACK_SPEEDS[(pos + 1) % PLAYBACK_SPEEDS.length];
			updatePlaybackUI(playback.elapsed);
		});
	}
	updatePlaybackUI(0);
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
// 播放条事件绑定（脚本在 body 末尾，DOM 已就绪）
bindPlaybackUI();
window.initMap = initMap;
uni.postMessage({
	data: {
		type: 'webview-ready'
	}
});