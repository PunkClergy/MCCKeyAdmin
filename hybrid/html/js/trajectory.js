var lats = '';
var lngs = '';
var elats = ''; //结束lat
var elngs = ''; //结束lng
var zoom = 18; //地图缩放比例
var coords = "";
var meMarker = ''; //个人位置标记点
var startMarker = '';
var endMarker = '';
var dis = 0; //目标距离
var img = "https://k3a.wiselink.net.cn/img/app/currentLocation.png"
var markers = []
var lastClickedMarker = ""; //记录当前点击的marker
let openInfoWindow; //信息窗口

// 状态管理变量
let isMapInitialized = false;
let receivedInfo = null;
// 使用配置对象集中管理多语言文本
const buttonTexts = {
	'en-US': {
		btnReturn: "Return",
		btn3: "Unlock",
		btn1: "Lock",
		btn5: "Locate",
		btnSee: "Photos",
		btn8: "Block",
		btn6: "Unblock"
	},
	'zh-CN': { // 假设中文标识为 zh-CN
		btnReturn: "归还车辆",
		btn3: "开锁",
		btn1: "关锁",
		btn5: "寻车",
		btnSee: "查看照片",
		btn8: "风控拦截",
		btn6: "取消拦截"
	}
};

// 初始化消息监听
window.addEventListener('message', (e) => {
	if (e.data.type === 'trajectory') {
		console.log('收到初始化数据:', e.data.payload);
		receivedInfo = e.data.info; // 存储轨迹数据

		// 如果地图已初始化，立即绘制轨迹
		if (isMapInitialized) {
			foldLine();
		}
	}
	const langData = buttonTexts[e.data.lang] || buttonTexts['zh-CN']; // 默认中文

	Object.entries(langData).forEach(([id, text]) => {
		const element = document.getElementById(id);
		if (element) element.innerText = text;
	});
});

/**
 * 初始化地图
 */
function initMap() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			coords = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			lats = position.coords.latitude;
			lngs = position.coords.longitude;

			map = new google.maps.Map(document.getElementById('map'), {
				zoom: zoom,
				center: coords,
				animation: 'BOUNCE'
			});

			setMePositioning();
			isMapInitialized = true; // 标记地图初始化完成

			// 如果已收到轨迹数据，立即绘制
			if (receivedInfo) {
				foldLine();
			}
		}, fail => {
			console.error('获取位置失败:', fail);
		}, {
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 24 * 60 * 60 * 1000,
		});
	} else {
		console.error('您的浏览器不支持Geolocation API');
		// 创建基础地图即使没有位置信息
		map = new google.maps.Map(document.getElementById('map'), {
			zoom: zoom,
			center: {
				lat: 39.90469,
				lng: 116.40717
			} // 默认北京中心
		});
		isMapInitialized = true;
	}
}

/**
 * 定位：显示自己当前位置
 */
function setMePositioning() {
	meMarker = new google.maps.Marker({
		position: {
			lat: lats,
			lng: lngs
		},
		icon: {
			url: img,
			scaledSize: new google.maps.Size(50, 50),
		},
		animation: 'BOUNCE',
		map: map
	});
}

/**
 * 绘制轨迹
 */
function foldLine() {
	if (!receivedInfo) {
		console.error("轨迹数据未就绪，无法绘制");
		return;
	}

	// 清除已有轨迹（如果存在）
	if (window.polylinePath) {
		window.polylinePath.setMap(null);
	}

	const locationArr = receivedInfo;
	var polylinePathPoints = locationArr;

	window.polylinePath = new google.maps.Polyline({
		path: polylinePathPoints,
		geodesic: true,
		strokeColor: '#008800',
		strokeOpacity: 0.8,
		strokeWeight: 3,
		editable: false,
		geodesic: false,
		draggable: false,
	});

	window.polylinePath.setMap(map);

	// 自动适配视图
	const bounds = new google.maps.LatLngBounds();
	locationArr.forEach(point => {
		bounds.extend(point);
	});
	map.fitBounds(bounds);

	// 设置起点终点（示例坐标，实际应从数据中获取）
	const startPoint = locationArr[0];
	const endPoint = locationArr[locationArr.length - 1];

	setMePositioningstart(startPoint.lat, startPoint.lng);
	setMePositioningend(endPoint.lat, endPoint.lng);
}

// 起点标记
function setMePositioningstart(lat1, lng1) {
	// 清除已有起点标记
	if (startMarker) {
		startMarker.setMap(null);
	}

	startMarker = new google.maps.Marker({
		position: {
			lat: lat1,
			lng: lng1
		},
		icon: {
			url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
			scaledSize: new google.maps.Size(40, 40),
		},
		title: '起点',
		map: map
	});
}

// 终点标记
function setMePositioningend(lat1, lng1) {
	// 清除已有终点标记
	if (endMarker) {
		endMarker.setMap(null);
	}

	endMarker = new google.maps.Marker({
		position: {
			lat: lat1,
			lng: lng1
		},
		icon: {
			url: "https://k3a.wiselink.net.cn/img/app/g_location.png",
			scaledSize: new google.maps.Size(17, 36),
		},
		title: '终点',
		map: map
	});
}

window.initMap = initMap;