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
          <text>疑似拆除异常记录</text>
          <view class="filter-btn" @click="openFilterModal">筛选 📋</view>
        </view>

        <view 
          class="record-item" 
          v-for="item in filteredRecords" 
          :key="item.recordId"
          @click="goRecordDetail" 
          :data-record="item"
        >
          <view class="record-left">
            <text class="record-time">{{ item.alarmtime }}</text>
            <text class="record-desc">⚠️ 疑似拆除</text>
            <text class="record-vehicle">
              涉及车辆：{{ item.vehicleSerialName }}{{ item.vehicleModeName }}（{{ item.platenumber }}）
            </text>
          </view>
          <view class="record-right">
            <button 
              class="nav-btn" 
              size="mini"
              @click.stop="handleNavToRecord"
              :data-record="item"
            >
              导航到位置
            </button>
          </view>
        </view>

        <view class="empty" v-if="filteredRecords.length === 0">
          暂无符合条件的疑似拆除异常记录
        </view>
      </view>
    </view>

    <!-- 筛选弹窗 -->
    <view class="filter-modal" v-if="showFilterModal">
      <view class="modal-mask" @click="closeFilterModal"></view>
      <view class="modal-content">
        <view class="modal-title">筛选条件</view>

        <!-- 日期 -->
        <view class="filter-item">
          <text class="filter-label">选择日期：</text>
          <picker mode="date" :value="selectedDate" @change="onDateChange">
            <view class="picker-input">{{ selectedDate || '请选择日期' }}</view>
          </picker>
        </view>

        <!-- 车牌号 -->
        <view class="filter-item">
          <text class="filter-label">车牌号：</text>
          <input 
            class="input-box" 
            placeholder="请输入车牌号（如京A00293）"
            v-model="inputCarNumber"
            @input="onCarNumberInput"
            :focus="focusCarInput"
          />

          <view class="car-list" v-if="carCandidateList.length > 0">
            <view 
              class="car-item" 
              v-for="item in carCandidateList" 
              :key="item.platenumber"
              @click="selectCarNumber"
              :data-carnumber="item.platenumber"
            >
              {{ item.vehicleSerialName }}{{ item.vehicleModeName }}（{{ item.platenumber }}）
            </view>
          </view>
        </view>

        <!-- 按钮 -->
        <view class="btn-group">
          <button class="reset-btn" @click="resetFilter">重置</button>
          <button class="confirm-btn" @click="confirmFilter">确认筛选</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  u_dismantleAlarmList
} from '@/api/index'

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
      filteredRecords: []
    }
  },

  onLoad() {
    this.handleCarList()
  },

  methods: {
    // 获取拆除报警列表
    async handleCarList(inputCarNumber, selectedDate) {
      const param = {
        plateNumber: inputCarNumber || '',
        startDate: selectedDate || ''
      }

      try {
        const res = await u_dismantleAlarmList(param)
        if (res.code === 1000) {
          const list = res.content || []
          const today = new Date().toLocaleDateString()
          
          const todayCount = list.filter(item => {
            if (!item.alarmtime) return false
            const itemDate = new Date(item.alarmtime).toLocaleDateString()
            return itemDate === today
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

    // 打开筛选
    openFilterModal() {
      this.showFilterModal = true
      this.focusCarInput = true
    },

    // 关闭筛选
    closeFilterModal() {
      this.showFilterModal = false
      this.carCandidateList = []
    },

    // 日期选择
    onDateChange(e) {
      this.selectedDate = e.detail.value
    },

    // 车牌输入
    onCarNumberInput(e) {
      const inputVal = (e.detail.value || '').trim().toUpperCase()
      this.inputCarNumber = inputVal

      if (!inputVal) {
        this.carCandidateList = []
        return
      }

      const candidateList = this.warningRecords.filter(item => {
        const plate = (item.platenumber || '').toUpperCase()
        const name = item.vehicleSerialName || ''
        return plate.includes(inputVal) || name.includes(inputVal)
      })

      const uniqueList = Array.from(
        new Map(candidateList.map(item => [item.platenumber, item])).values()
      )

      this.carCandidateList = uniqueList
    },

    // 选择车牌
    selectCarNumber(e) {
      const carno = e.currentTarget.dataset.carnumber
      this.inputCarNumber = carno
      this.carCandidateList = []
    },

    // 重置
    resetFilter() {
      this.selectedDate = ''
      this.inputCarNumber = ''
      this.carCandidateList = []
      this.filteredRecords = [...this.warningRecords]
    },

    // 确认筛选
    confirmFilter() {
      this.handleCarList(this.inputCarNumber, this.selectedDate)
    },

    // 进入详情
    goRecordDetail(e) {
      const record = e.currentTarget.dataset.record
      uni.navigateTo({
        url: `/pages/recordDetail/recordDetail?recordId=${record.recordId}`
      })
    },

    // 导航
    handleNavToRecord(e) {
      const record = e.currentTarget.dataset.record
      const { latitude, longitude, vehicleSerialName, vehicleModeName, platenumber } = record

      uni.openLocation({
        latitude: Number(latitude),
        longitude: Number(longitude),
        name: `${vehicleSerialName}${vehicleModeName}（${platenumber}）疑似拆除`,
        address: `${vehicleSerialName}${vehicleModeName}（${platenumber}）疑似拆除异常位置`,
        scale: 18,
        fail: () => {
          uni.showModal({
            title: '导航失败',
            content: '无法打开地图',
            showCancel: false
          })
        }
      })
    }
  }
}
</script>

<style scoped>
page {
  background: #f5f7fa;
}
.page-container {
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
  width: calc(100% - 60rpx);
  box-sizing: border-box;
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
  width: calc(100% - 60rpx);
  box-sizing: border-box;
  max-height: calc(100vh - 300rpx);
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
  width: 100%;
  padding: 20rpx 0;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  position: sticky;
  top: 0;
  background: #f5f7fa;
  z-index: 5;
}
.filter-btn {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  background: #f5f5f5;
  color: #333;
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
  width: 100%;
  box-sizing: border-box;
}
.record-left {
  flex: 1;
}
.record-time {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}
.record-desc {
  font-size: 28rpx;
  color: #fa4143;
  display: block;
  margin-bottom: 8rpx;
  font-weight: 500;
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
  width: 100%;
}
.filter-modal {
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
  background: rgba(0,0,0,0.5);
}
.modal-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  padding: 30rpx;
  box-sizing: border-box;
  max-height: 80vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  text-align: center;
}
.filter-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 24rpx;
}
.filter-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
}
.picker-input {
  height: 80rpx;
  line-height: 80rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 26rpx;
  color: #666;
}
.input-box {
  height: 80rpx;
  line-height: 80rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 26rpx;
  color: #666;
}
.car-list {
  width: 100%;
  max-height: 200rpx;
  overflow-y: auto;
  border: 1rpx solid #eee;
  border-top: none;
  border-radius: 0 0 8rpx 8rpx;
  margin-top: -1rpx;
  background: #fff;
}
.car-item {
  padding: 20rpx;
  font-size: 26rpx;
  color: #333;
  border-bottom: 1rpx solid #f5f5f5;
}
.car-item:last-child {
  border-bottom: none;
}
.btn-group {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}
.reset-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  background: #f5f5f5;
  color: #333;
  border-radius: 8rpx;
  font-size: 28rpx;
}
.confirm-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  background: #fa4143;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
}
</style>