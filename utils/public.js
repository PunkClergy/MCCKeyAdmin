/**
 * 显示加载框
 * @param {string} [msg='加载中...'] - 加载框的提示信息
 */
function showLoading(msg = '加载中...') {
  if (!uni.getStorageSync('loadingShown')) {
    uni.showLoading({
      title: msg,
      mask: true
    });
    uni.setStorageSync('loadingShown', true);
  }
}

/**
 * 隐藏加载框
 */
function hideLoading() {
  if (uni.getStorageSync('loadingShown')) {
    uni.hideLoading();
    uni.removeStorageSync('loadingShown');
  }
}

/**
 * 显示吐司提示框
 * @param {string} msg - 吐司提示的信息
 * @param {string} [icon='none'] - 吐司提示的图标 ('success', 'fail', 'none')
 * @param {number} [duration=1500] - 吐司提示的持续时间（毫秒）
 */
function showToast(msg, icon = 'none', duration = 1500) {
  uni.showToast({
    title: msg,
    icon: icon,
    duration: duration
  });
}

// 同步获取系统全部信息
const systemInfo = uni.getSystemInfoSync();

/**
 * 获取窗口信息（对应 wx.getWindowInfo()）
 */
const _handleWindowInfo = {
  pixelRatio: systemInfo.pixelRatio,
  screenWidth: systemInfo.screenWidth,
  screenHeight: systemInfo.screenHeight,
  windowWidth: systemInfo.windowWidth,
  windowHeight: systemInfo.windowHeight,
  statusBarHeight: systemInfo.statusBarHeight,
  screenTop: systemInfo.screenTop,
  safeArea: systemInfo.safeArea
};

/**
 * 获取系统设置信息
 */
const _handleSystemSetting = {
  bluetoothEnabled: systemInfo.bluetoothEnabled,
  locationEnabled: systemInfo.locationEnabled,
  wifiEnabled: systemInfo.wifiEnabled,
  deviceOrientation: systemInfo.deviceOrientation
};

/**
 * 获取设备基础信息
 */
const _handleDeviceInfo = {
  brand: systemInfo.brand,
  model: systemInfo.model,
  system: systemInfo.system,
  platform: systemInfo.platform
};

/**
 * 应用基础信息
 */
const _handleAppBaseInfo = {
  appId: systemInfo.appId,
  appName: systemInfo.appName,
  version: systemInfo.version,
  uniPlatform: systemInfo.uniPlatform
};

/**
 * 应用授权设置
 */
const _handleAppAuthorizeSetting = systemInfo.appAuthorizeSetting || {};

// 统一导出（必须全部写在这里，才能被外部引入）
export default {
  showLoading,
  hideLoading,
  showToast,
  _handleWindowInfo,
  _handleSystemSetting,
  _handleAppAuthorizeSetting,
  _handleDeviceInfo,
  _handleAppBaseInfo
}