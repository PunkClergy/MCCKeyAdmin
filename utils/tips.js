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
module.exports = {
  showLoading,
  hideLoading,
  showToast
};