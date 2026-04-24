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
var info =''



// 初始化消息监听
window.addEventListener('message', (e) => {
	console.log(222)
  if (e.data.type === 'INIT_DATA') {
    console.log('收到初始化数据:', e.data.payload);
	info = e.data.payload
    // 处理初始化数据...
  }
});
/**
 * 初始化
 * 
 */
function initMap() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			coords = {

				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			lats = position.coords.latitude;
			lngs = position.coords.longitude
			map = new google.maps.Map(document.getElementById('map'), {
				zoom: zoom,
				center: coords,
				// mapId: MAPID,
				animation: 'BOUNCE'
			});
			setMePositioning();
			myBtn1();
			foldLine();
			ListenclickStartRun()
		}, fail => {}, {
			enableHighAccuracy: true, //高精度
			timeout: 5000, //超时时间,以ms为单位
			maximumAge: 24 * 60 * 60 * 1000, //位置缓存时间,以ms为单位
		});
	} else {
		Toast('运您的浏览器不支持Geolocation API', 1000)
		console.log('您的浏览器不支持Geolocation API');
	}
}
/**
 * setMePositioning
 * 定位 ：显示自己当前当位置
 * 
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
// 当前定位点
function myBtn1() {
	let min = 500;
	let max = 1000;
	let randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
	for (let i = 0; i < 20; i++) {
		var locObj = {
			lat: (lats + (Math.floor(Math.random() * 21) - 15) / randomNum) * 1,
			lng: (lngs - (Math.floor(Math.random() * 21) - 15) / randomNum) * 1,
			title: 123423
		}
		/**
		 * 以下title 和 imgUrl 在這裏設置的目的是為了點擊marker標記點時 信息彈出框有數據   無此業務邏輯時  可選擇性去除該功能
		 * 以及注釋ListeningMarkerClick 方法即可
		 * */
		const marker = new google.maps.Marker({
			position: locObj,
			title: locObj.title + '-' + i,
			imgUrl: 'https://k3a.wiselink.net.cn/img/app/g_location.png',
			icon: {
				url: 'https://k3a.wiselink.net.cn/img/app/g_location.png',
				scaledSize: new google.maps.Size(17, 36),
			},
			map: map
		});
		markers.push(marker)
		ListeningMarkerClick(marker, i)
		// 标记点点击事件
		marker.addListener("click", () => {
			Toast("点击了第" + i + "个marker标记点",
				1000)

		});
		markerClickAnimation(marker)
	}
}
// 自定义点
function markerClickAnimation(marker) {
	marker.addListener('click', function() {
		if (lastClickedMarker && lastClickedMarker.getAnimation() !== null) {
			lastClickedMarker.setAnimation(null);
		}
		// 设置当前点击的 Marker 动画效果
		marker.setAnimation(google.maps.Animation.BOUNCE);
		// 记录当前点击的 Marker
		lastClickedMarker = marker;
	});
}
// 轨迹图
function foldLine() {
	var locationArr = [{
		lng: 116.403568,
		lat: 39.973114,
	}, {
		lng: 116.385029,
		lat: 39.982848,
	}, {
		lng: 116.383141,
		lat: 39.962458
	}, {
		lng: 116.356533,
		lat: 39.952984
	}, {
		lng: 116.342629,
		lat: 39.959037
	}, {
		lng: 116.341427,
		lat: 39.970746
	}, {
		lng: 116.314304,
		lat: 39.971141
	}]
	var polylinePathPoints = locationArr;
	// map：指定要放在哪個地圖上，如果沒有設定，可以再用 setMap 的方法把折線放到地圖裡。
	// path：折線的路徑，使用陣列來表示，每個陣列元素是經緯度的物件，必須包含對應的經緯度座標才能繪製。
	// icons：折線上每個座標的圖示，使用陣列來表示，如果沒有 icon 則不會有圖案顯示。
	// strokeColor：折線線條的顏色。
	// strokeOpacity：折線的線條透明度，0.0 ~ 1.0 之間，越接近 0 表示越透明。
	// strokeWeight：折線的線條寬度，使用 pixel 表示。
	// zIndex：折線的階層，數字越大在越上面。
	// visible：是否可以看見折線，預設值 true，如果設定 false 就看不見折線。
	// clickable：是否可以點擊折線，預設值 true，如果設為 false 則不能點擊。
	// draggable：是否可以拖曳折線，預設值為 false，如果設為 true，則可以把整個線段形狀拖曳到別的地方 ( 如果是要個別修改折線上的點，可以使用 editable )。
	// editable：是否可以編輯折線上的每個點，預設值為 false，如果設為 true，在折線上就會出現可以拖曳的圓點標記，透過滑鼠就可以更改每個點的位置。
	// geodesic：是否要依照「地球弧度」繪製折線，預設值為 flase，表示一律採「直線」顯示，若設定為 true，在地圖縮小到一定比例， 類似可以在同個畫面看到完整的台灣，就會看到折線變成「弧線」，因為地球本身是橢圓形，所以如果有看過飛機航線就知道，航線都會是弧線顯示 ( 在地球表面，最短的距離不是直線，是弧線 )。

	var polylinePath = new google.maps.Polyline({
		path: polylinePathPoints,
		geodesic: true,
		strokeColor: '#008800',
		strokeOpacity: 0.8,
		strokeWeight: 3,
		editable: false,
		geodesic: false,
		draggable: false,
	});

	polylinePath.setMap(map);
	setMePositioningstart(39.973114, 116.403568)
	setMePositioningend(39.971141, 116.314304)
}
// 起点
function setMePositioningstart(lat1, lng1) {
	startMarker = new google.maps.Marker({
		position: {
			lat: lat1,
			lng: lng1
		},
		icon: {
			url: img,
			scaledSize: new google.maps.Size(50, 50),
		},
		animation: 'BOUNCE',
		map: map
	});
}
// 终点
function setMePositioningend(lat1, lng1) {
	endMarker = new google.maps.Marker({
		position: {
			lat: lat1,
			lng: lng1
		},
		icon: {
			url: img,
			scaledSize: new google.maps.Size(50, 50),
		},
		animation: 'BOUNCE',
		map: map
	});
}

function ListeningMarkerClick(marker, clickIndex) {
	var contentString = '<div id="myButton_' + clickIndex + '">' +
		'<div class="infoWindow-title">' + marker.title + '</div>' +
		'<p class="textoverflow">' +
		1234455 + '</p >' +
		'< img class="imgs" src=' + marker.imgUrl +
		'/>' +
		'</div>';
	var infowindow = new google.maps.InfoWindow({
		content: contentString,
		maxWidth: 200,
		disableAutoPan: true,
		zIndex: 100,
		pixelOffset: new google.maps.Size(-35, 0),

	});
	/**
	 * 监听点击maker标记点弹出信息窗
	 * 
	 * */
	google.maps.event.addListener(marker, 'click', function() {
		// infowindow.open(map, marker); //多个信息窗口显示
		if (openInfoWindow) { //单个信息窗口
			openInfoWindow.close();
		}
		infowindow.open(map, marker);
		openInfoWindow = infowindow;
		setTimeoutInfoWindowClick(clickIndex);
	});
	// 关闭信息窗口
	infowindow.addListener('closeclick', () => {
		Toast('关闭了信息窗口', 500)
	});
}

function markerClickAnimation(marker) {
	marker.addListener('click', function() {
		if (lastClickedMarker && lastClickedMarker.getAnimation() !== null) {
			lastClickedMarker.setAnimation(null);
		}
		// 设置当前点击的 Marker 动画效果
		marker.setAnimation(google.maps.Animation.BOUNCE);
		// 记录当前点击的 Marker
		lastClickedMarker = marker;
	});
}

function setTimeoutInfoWindowClick(clickIndex) {
	setTimeout(() => {
		var element = document.getElementById('myButton_' + clickIndex);
		element.addEventListener("click", function() {
			Toast('点击了第' + clickIndex + '个信息窗口元素')
		});
	}, 50)
}
// 点击归还车辆
function ListenclickStartRun() {
	document.getElementById('btn').addEventListener('click', function() {
		uni.postMessage({
			data: {
				source: 1,
				sss: '1'
			},
		});

	})
	document.getElementById('btn1').addEventListener('click', function() {
		uni.postMessage({
			data: {
				source: 2,
				sss: '222222',
				ddd:info
			},
		});
	
	})
}
window.initMap = initMap;