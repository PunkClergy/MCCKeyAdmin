// 使用模块模式封装，避免全局污染
(() => {
	// ===================== 常量配置 =====================
	const CONFIG = {
		MARKERS: {
			USER: {
				url: "https://k3a.wiselink.net.cn/img/app/currentLocation.png",
				size: 50
			},
			CAR: {
				url: "https://k3a.wiselink.net.cn/img/app/g_location.png",
				width: 17,
				height: 36
			}
		},
		MAP: {
			DEFAULT_ZOOM: 15,
			OPTIONS: {
				disableDefaultUI: true,
				gestureHandling: "greedy",
				mapTypeControl: false,
				fullscreenControl: false
			}
		},
		BUTTONS: [{
				id: 'btn1',
				type: 1,
				label: '锁门'
			},
			{
				id: 'btn3',
				type: 3,
				label: '开门'
			},
			{
				id: 'btn5',
				type: 5,
				label: '寻车'
			},
			{
				id: 'btnReturn',
				type: 'btnReturn',
				label: '归还车辆'
			},
			{
				id: 'btnSee',
				type: 'btnSee',
				label: '查看照片'
			},
			{
				id: 'btn8',
				type: 8,
				label: '风控拦截'
			},
			{
				id: 'btn6',
				type: 6,
				label: '取消风控'
			}
		],
		VISIBILITY: {
			desk: ['btn1', 'btn3', 'btn5', 'btnSee', 'btnReturn'],
			fk: ['btn6', 'btn8']
		},
		GEO_ERRORS: {
			1: '位置服务被拒绝，请在设置中开启权限',
			2: '暂时获取不到位置信息，请确保网络畅通',
			3: '获取位置信息超时，请重试'
		}
	};

	// ===================== 状态管理 =====================
	const state = {
		position: {
			lat: '',
			lng: ''
		},
		map: null,
		marker: null,
		info: null,
		source: '',
		initialized: false
	};
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
	// ===================== 核心功能 =====================

	/**
	 * 消息处理中枢
	 * @param {MessageEvent} event - 消息事件对象
	 */
	const handleMessage = ({
		data
	}) => {
		if (data.type === 'desk') {
			Object.assign(state, {
				info: data.payload,
				source: data.type
			});

			if (state.initialized && state.info?.latitude) {
				updatePosition(
					state.info.latitude,
					state.info.longitude,
					true
				);
			}
			updateButtonVisibility();
		}

		const langData = buttonTexts[data.lang] || buttonTexts['zh-CN']; // 默认中文

		Object.entries(langData).forEach(([id, text]) => {
			const element = document.getElementById(id);
			if (element) element.innerText = text;
		});
	};

	/**
	 * 更新地图位置和标记
	 * @param {number} lat - 纬度
	 * @param {number} lng - 经度
	 * @param {boolean} isCar - 是否为车辆标记
	 */
	const updatePosition = (lat, lng, isCar = false) => {
		Object.assign(state.position, {
			lat,
			lng
		});

		if (state.marker) {
			state.marker.setPosition(state.position);
			updateMarkerIcon(isCar);
		} else if (state.map) {
			createMarker(isCar);
		}

		if (state.map) {
			state.map.setCenter(state.position);
			state.map.setZoom(CONFIG.MAP.DEFAULT_ZOOM);
		}
	};

	/**
	 * 更新标记图标
	 * @param {boolean} isCar - 是否为车辆图标
	 */
	const updateMarkerIcon = (isCar) => {
		const {
			USER,
			CAR
		} = CONFIG.MARKERS;
		const config = isCar ? CAR : USER;

		state.marker.setIcon({
			url: config.url,
			scaledSize: new google.maps.Size(
				isCar ? config.width : config.size,
				isCar ? config.height : config.size
			)
		});
	};

	/**
	 * 创建地图标记
	 * @param {boolean} isCar - 是否为车辆标记
	 */
	const createMarker = (isCar = false) => {
		if (!state.map) return;

		state.marker = new google.maps.Marker({
			position: state.position,
			map: state.map,
			optimized: false,
			icon: {
				url: isCar ? CONFIG.MARKERS.CAR.url : CONFIG.MARKERS.USER.url,
				scaledSize: new google.maps.Size(
					isCar ? CONFIG.MARKERS.CAR.width : CONFIG.MARKERS.USER.size,
					isCar ? CONFIG.MARKERS.CAR.height : CONFIG.MARKERS.USER.size
				)
			}
		});
	};

	/**
	 * 初始化地图核心
	 * @param {GeolocationPosition} position - 地理位置对象
	 */
	const initMapCore = (position) => {
		const useDeskData = state.source === 'desk' && state.info?.latitude;
		const coords = useDeskData ? state.info : position.coords;

		updatePosition(coords.latitude, coords.longitude, useDeskData);

		if (!state.map) {
			state.map = new google.maps.Map(
				document.getElementById('map'),
				Object.assign({}, CONFIG.MAP.OPTIONS, {
					zoom: CONFIG.MAP.DEFAULT_ZOOM,
					center: state.position
				})
			);

			if (!state.marker) createMarker(useDeskData);
			setupEventListeners();
		}

		state.initialized = true;
	};

	// ===================== UI 控制 =====================

	/**
	 * 设置事件监听器（配置驱动）
	 */
	const setupEventListeners = () => {
		CONFIG.BUTTONS.forEach(({
			id,
			type
		}) => {
			document.getElementById(id)?.addEventListener('click', () => {
				uni.postMessage({
					data: {
						source: state.source,
						type,
						timestamp: Date.now()
					}
				});
			});
		});
	};

	/**
	 * 更新按钮可见性（声明式配置）
	 */
	const updateButtonVisibility = () => {
		// 收集所有配置按钮
		const allButtons = [...new Set(
			Object.values(CONFIG.VISIBILITY).flat()
		)];

		// 默认隐藏所有按钮
		allButtons.forEach(id => {
			const el = document.getElementById(id);
			if (el) el.style.display = 'none';
		});

		// 显示当前场景的按钮
		if (state.source && CONFIG.VISIBILITY[state.source]) {
			CONFIG.VISIBILITY[state.source].forEach(id => {
				const el = document.getElementById(id);
				if (el) el.style.display = 'block';
			});
		}
	};

	// ===================== 工具函数 =====================

	/**
	 * 处理地理位置错误
	 * @param {GeolocationPositionError} error - 错误对象
	 */
	const handleGeoError = (error) => {
		const message = CONFIG.GEO_ERRORS[error.code] ||
			`获取位置失败: ${error.message}`;
		console.error('定位错误:', message);
	};

	/**
	 * 主初始化函数
	 */
	const initMap = () => {
		if (!navigator.geolocation) {
			console.error('浏览器不支持定位功能');
			return;
		}

		navigator.geolocation.getCurrentPosition(
			initMapCore,
			handleGeoError, {
				enableHighAccuracy: true,
				timeout: 8000,
				maximumAge: 0
			}
		);
	};

	// ===================== 初始化 =====================
	window.addEventListener('message', handleMessage);
	window.initMap = initMap;
})();