<template>
  <view class="page-container">
    <!-- 统计卡片 -->
    <view class="stats-card">
      <view class="stats-item">
        <text class="stats-num risky">{{ totalCount }}</text>
        <text class="stats-label">异常记录总数</text>
      </view>
      <view class="stats-item">
        <text class="stats-num risky">{{ todayCount }}</text>
        <text class="stats-label">今日新增异常</text>
      </view>
    </view>

    <!-- 异常记录列表 -->
    <view class="record-list-container">
      <view class="record-list">
        <view class="list-title">
          <text>出/入围栏异常记录</text>
          <view class="filter-btn" @tap="openFilterModal">筛选 📋</view>
        </view>

        <view class="record-item" v-for="item in filteredRecords" :key="item.recordId" @tap="goRecordDetail" :data-record="item">
          <view class="record-left">
            <text>{{ item.efencename }}</text>
            <text class="record-time">{{ item.alarmtime }}</text>
            <text class="record-desc">⚠️ {{ item.efencestateName }}</text>
            <text class="record-vehicle">涉及车辆：{{ item.vehicleSerialName }}{{ item.vehicleModeName }}（{{ item.platenumber }}）</text>
          </view>
          <view class="record-right">
            <button class="nav-btn" size="mini" @tap="showAddressModal" :data-record="item" catchtap>
              查看位置
            </button>
          </view>
        </view>

        <view class="empty" v-if="filteredRecords.length === 0">
          暂无符合条件的异常记录
        </view>
      </view>
    </view>

    <!-- 地址信息弹窗 -->
    <view class="address-modal" v-if="showAddressPop">
      <view class="modal-mask" @tap="closeAddressModal"></view>
      <view class="modal-content">
        <view class="modal-title">位置信息</view>
        <view class="address-box">
          <text class="address-text">{{ currentAddress || '暂无地址信息' }}</text>
        </view>
        <button class="close-btn" @tap="closeAddressModal">关闭</button>
      </view>
    </view>

    <!-- 筛选弹窗 -->
    <view class="filter-modal" v-if="showFilterModal">
      <view class="modal-mask" @tap="closeFilterModal"></view>
      <view class="modal-content">
        <view class="modal-title">筛选条件</view>

        <view class="filter-item">
          <text class="filter-label">选择日期：</text>
          <picker mode="date" :value="selectedDate" @change="onDateChange">
            <view class="picker-input">{{ selectedDate || '请选择日期' }}</view>
          </picker>
        </view>

        <view class="filter-item">
          <text class="filter-label">车牌号：</text>
          <input class="input-box" placeholder="请输入车牌号" v-model="inputCarNumber" @input="onCarNumberInput" :focus="focusCarInput" />

          <view class="car-list" v-if="carCandidateList.length > 0">
            <view class="car-item" v-for="item in carCandidateList" :key="item.platenumber" @tap="selectCarNumber" :data-carnumber="item.platenumber">
              {{ item.vehicleSerialName }}{{ item.vehicleModeName }}（{{ item.platenumber }}）
            </view>
          </view>
        </view>

        <!-- 修复：按钮组布局 -->
        <view class="btn-group">
          <button class="reset-btn" @tap="resetFilter">重置</button>
          <button class="confirm-btn" @tap="confirmFilter">确认筛选</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { u_efenceAlarmList } from '@/api/index'

export default {
  data() {
    return {
      isSubscribed: false,
      totalCount: 0,
      todayCount: 0,
      warningRecords: [],
      showFilterModal: false,
      selectedDate: '',
      inputCarNumber: '',
      carCandidateList: [],
      focusCarInput: false,
      filteredRecords: [],
      // 地址弹窗
      showAddressPop: false,
      currentAddress: ''
    }
  },
  onLoad() {
    this.handleCarList('', '')
  },
  methods: {
    async handleCarList(inputCarNumber = '', selectedDate = '') {
      try {
        const params = {
          plateNumber: inputCarNumber,
          startDate: selectedDate
        }
        const res = await u_efenceAlarmList(params)
        
        if (res.code === 1000) {
          const list = res.content || []
          const today = new Date().toLocaleDateString()
          const todayCount = list.filter(item => {
            if (!item.alarmtime) return false
            return new Date(item.alarmtime).toLocaleDateString() === today
          }).length

          const isAllEmpty = !inputCarNumber && !selectedDate

          this.warningRecords = list
          this.filteredRecords = [...this.warningRecords]
          this.inputCarNumber = ''
          this.selectedDate = ''
          
          if (isAllEmpty) {
            this.totalCount = res.count || 0
            this.todayCount = todayCount
          }
          
          this.closeFilterModal()
        }
      } catch (e) {}
    },

    openFilterModal() {
      this.showFilterModal = true
      this.focusCarInput = true
    },
    closeFilterModal() {
      this.showFilterModal = false
      this.carCandidateList = []
    },
    onDateChange(e) {
      this.selectedDate = e.detail.value
    },
    onCarNumberInput(e) {
      const inputVal = (e.detail.value || '').trim().toUpperCase()
      this.inputCarNumber = inputVal

      if (!inputVal) {
        this.carCandidateList = []
        return
      }

      const candidateList = this.warningRecords.filter(item => {
        return item.platenumber?.toUpperCase().includes(inputVal) || item.vehicleSerialName.includes(inputVal)
      }).map(item => ({
        vehicleSerialName: item.vehicleSerialName,
        platenumber: item.platenumber
      }))

      const uniqueList = Array.from(new Set(candidateList.map(item => item.platenumber)))
        .map(plate => candidateList.find(item => item.platenumber === plate))

      this.carCandidateList = uniqueList
    },
    selectCarNumber(e) {
      this.inputCarNumber = e.currentTarget.dataset.carnumber
      this.carCandidateList = []
    },
    resetFilter() {
      this.selectedDate = ''
      this.inputCarNumber = ''
      this.carCandidateList = []
      this.filteredRecords = [...this.warningRecords]
    },
    confirmFilter() {
      this.handleCarList(this.inputCarNumber, this.selectedDate)
    },
    goRecordDetail(e) {
      const record = e.currentTarget.dataset.record
      uni.navigateTo({
        url: `/pages/recordDetail/recordDetail?recordId=${record.recordId}`
      })
    },
    // 打开地址弹窗
    showAddressModal(e) {
      const record = e.currentTarget.dataset.record
      this.currentAddress = record.address || '暂无地址信息'
      this.showAddressPop = true
    },
    // 关闭地址弹窗
    closeAddressModal() {
      this.showAddressPop = false
    }
  }
}
</script>

<style scoped>
page {
  background: #EFF1FC;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.page-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 30rpx;
  width: 100%;
  box-sizing: border-box;
}
.stats-card {
  display: flex;
  margin: 20rpx 30rpx;
  padding: 30rpx 0;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
}
.stats-item {
  flex: 1;
  text-align: center;
}
.stats-num {
  font-size: 44rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  color: #fa4143;
}
.stats-label {
  font-size: 24rpx;
  color: #999;
}
.record-list-container {
  margin: 0 30rpx;
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.record-list {
  width: 100%;
}
.list-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  font-size: 32rpx;
  font-weight: bold;
  position: sticky;
  top: 0;
  background: #f5f7fa;
}
.filter-btn {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}
.record-item {
  display: flex;
  justify-content: space-between;
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border-left: 6rpx solid #fa4143;
}
.record-left {
  flex: 1;
}
.record-time {
  font-size: 28rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}
.record-desc {
  font-size: 28rpx;
  color: #fa4143;
  display: block;
  margin-bottom: 8rpx;
}
.record-vehicle {
  font-size: 24rpx;
  color: #666;
  display: block;
}
.record-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.nav-btn {
  background: #fa4143;
  color: #fff;
  border-radius: 20rpx;
  font-size: 24rpx;
}
.empty {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 28rpx;
}

/* 地址弹窗样式 */
.address-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
}
.modal-mask {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}
.address-modal .modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 560rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-sizing: border-box;
}
.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
}
.address-box {
  background: #f5f7fa;
  border-radius: 12rpx;
  padding: 30rpx;
  min-height: 120rpx;
  margin-bottom: 40rpx;
}
.address-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.7;
  word-break: break-all;
}
.close-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: #fa4143;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
}

/* 筛选弹窗 */
.filter-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 998;
}
.filter-modal .modal-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  padding: 30rpx;
  max-height: 80vh;
  overflow-y: auto;
  box-sizing: border-box;
}
.filter-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 24rpx;
}
.filter-label {
  font-size: 28rpx;
  margin-bottom: 12rpx;
}
.picker-input, .input-box {
  height: 80rpx;
  line-height: 80rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 26rpx;
  color: #666;
}
.car-list {
  max-height: 200rpx;
  overflow-y: auto;
  border: 1rpx solid #eee;
  border-top: none;
  background: #fff;
}
.car-item {
  padding: 20rpx;
  font-size: 26rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

/* ========== 重点修复：按钮组布局（彻底解决错位） ========== */
.btn-group {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 40rpx;
  width: 100%;
}
.reset-btn, .confirm-btn {
  /* 强制均分宽度 */
  flex: 1;
  width: 0;
  height: 80rpx;
  line-height: 80rpx;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}
.reset-btn {
  background: #f5f5f5;
  color: #333;
  margin-right: 10rpx;
}
.confirm-btn {
  background: #fa4143;
  color: #fff;
  margin-left: 10rpx;
}
</style>