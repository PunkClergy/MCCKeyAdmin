<template>
	<view class="container" :style="{ backgroundImage: `url(${s_background_picture_of_the_front_page})` }">
		<view class="content-container"
			:style="{ top: `${c_navBarHeight}px`, height: `${c_screen_height - (c_statusBarHeight + c_navBarHeight + 2)}px` }">
			<view class="card-head">
				<text>{{ tips.MyProfile[lang] }}</text>
			</view>

			<view class="card-info">
				<view class="card-info-item">
					<label>{{ tips.CompanyName[lang] }}</label>
					<view class="card-info-item-input">
						<input :placeholder="tips.PleaseEnterCompanyName[lang]" v-model="params.name"
							@input="handleBindinput" data-item="name" />
					</view>
				</view>

				<view class="card-info-item">
					<label>{{ tips.ContactPerson[lang] }}</label>
					<view class="card-info-item-input">
						<input :placeholder="tips.PleaseEnterContactPerson[lang]" v-model="params.chargename"
							@input="handleBindinput" data-item="chargename" />
					</view>
				</view>

				<view class="card-info-item">
					<label>{{ tips.ContactPhone[lang] }}</label>
					<view class="card-info-item-input">
						<input type="number" :placeholder="tips.PleaseEnterContactPhone[lang]"
							v-model="params.chargemobile" @input="handleBindinput" data-item="chargemobile" />
					</view>
				</view>

				<view class="card-info-item">
					<label>{{ tips.Remarks[lang] }}</label>
					<view class="card-info-item-input">
						<input :placeholder="tips.PleaseEnterRemarks[lang]" v-model="params.bak"
							@input="handleBindinput" data-item="bak" />
					</view>
				</view>

				<view class="card-info-item">
					<label style="font-weight:bold">{{ tips.BillingInfo[lang] }}</label>
				</view>

				<view class="card-info-item">
					<label>{{ tips.BillingName[lang] }}</label>
					<view class="card-info-item-input">
						<input :placeholder="tips.PleaseEnterBillingName[lang]" v-model="params.invoiceHeader"
							@input="handleBindinput" data-item="invoiceHeader" />
					</view>
				</view>

				<view class="card-info-item">
					<label>{{ tips.TaxpayerId[lang] }}</label>
					<view class="card-info-item-input">
						<input :placeholder="tips.PleaseEnterTaxpayerId[lang]" v-model="params.invoiceNum"
							@input="handleBindinput" data-item="invoiceNum" />
					</view>
				</view>

				<view class="card-info-item">
					<label>{{ tips.Phone[lang] }}</label>
					<view class="card-info-item-input">
						<input :placeholder="tips.PleaseEnterPhone[lang]" v-model="params.invoiceMobile"
							@input="handleBindinput" data-item="invoiceMobile" />
					</view>
				</view>

				<view class="card-info-item">
					<label>{{ tips.Address[lang] }}</label>
					<view class="card-info-item-input">
						<input :placeholder="tips.PleaseEnterAddress[lang]" v-model="params.invoiceAddress"
							@input="handleBindinput" data-item="invoiceAddress" />
					</view>
				</view>

				<view class="card-info-item">
					<label>{{ tips.BankName[lang] }}</label>
					<view class="card-info-item-input">
						<input :placeholder="tips.PleaseEnterBankName[lang]" v-model="params.accountsBank"
							@input="handleBindinput" data-item="accountsBank" />
					</view>
				</view>

				<view class="card-info-item">
					<label>{{ tips.BankAccount[lang] }}</label>
					<view class="card-info-item-input">
						<input :placeholder="tips.PleaseEnterBankAccount[lang]" v-model="params.bankCardNumber"
							@input="handleBindinput" data-item="bankCardNumber" />
					</view>
				</view>
			</view>

			<view class="card-footer">
				<view @click="handleSubmit">{{ tips.Confirm[lang] }}</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		u_getCitys,
		u_getProvinces,
		u_companyImprove,
		u_companyInfo,
		u_getUserlnfo
	} from '@/api/index.js'
	import {
		tips
	} from '@/utils/langtips.js'
	import {
		titles
	} from '@/utils/langtitle.js'

	export default {
		data() {
			return {
				tips: tips,
				lang: 'zhCn',
				c_screen_height: 0,
				c_statusBarHeight: 0,
				c_navBarHeight: 20,
				s_platform_height: 60,
				s_background_picture_of_the_front_page: '/static/images/home/car-bg.png',

				params: {},
				currentArea: '国内',
				items: [],
				provinces: [],
				provincesIndex: null,
				citys: [],
				cityIndex: null
			}
		},
		onShow() {
			this.lang = uni.getStorageSync('language') || 'zh-Cn'
			const pageRoute = 'zoneCenter/completeCustomerInfo'
			uni.setNavigationBarTitle({
				title: titles[pageRoute][this.lang]
			})
		},
		onLoad() {
			this.initialiProvinces()
		},
		onReady() {
			this.initialiImageBaseConversion()
		},
		methods: {
			initialiImageBaseConversion() {},

			async initialiProvinces() {
				try {
					const res = await u_getProvinces({})
					if (res.code === 1000) {
						this.provinces = res.content || []
						this.handleInquiryDetails()
					}
				} catch (e) {}
			},

			handleBindinput(e) {
				const key = e.currentTarget.dataset.item
				this.params[key] = e.detail.value
			},

			async handleInquiryDetails() {
				try {
					const res = await u_companyInfo({})
					if (res.code !== 1000) return

					const data = res.content || {}
					const businessTypes = data.businessTypes?.split(',') || []

					this.params = {
						id: data.id || '',
						name: data.name || '',
						chargemobile: data.chargemobile || '',
						chargename: data.chargename || '',
						province: data.province || '',
						city: data.city || '',
						rentCarCount: data.rentCarCount || '',
						rentCitys: data.rentCitys || '',
						serviceArea: data.serviceArea || '',
						largeCustomer: data.largeCustomer || '',
						bak: data.bak || '',
						businessTypes: businessTypes,

						invoiceHeader: data.invoiceHeader || '',
						invoiceNum: data.invoiceNum || '',
						invoiceMobile: data.invoiceMobile || '',
						invoiceAddress: data.invoiceAddress || '',
						accountsBank: data.accountsBank || '',
						bankCardNumber: data.bankCardNumber || ''
					}

					this.currentArea = data.serviceArea || '国内'
					this.provincesIndex = this.provinces.findIndex(item => item.id == data.province)

					if (data.province) {
						const cityRes = await u_getCitys({
							provinceId: data.province
						})
						this.citys = cityRes.content || []
						this.cityIndex = this.citys.findIndex(item => item.id == data.city)
					}
				} catch (e) {}
			},

			async handleSubmit() {
				try {
					const submitData = {
						...this.params,
						serviceArea: this.currentArea,
						businessTypes: this.params.businessTypes?.join()
					}

					const res = await u_companyImprove(submitData)
					if (res.code !== 1000) return

					const userRes = await u_getUserlnfo({})
					const userKey = userRes.content
					uni.setStorageSync('userKey', userKey)
					uni.redirectTo({
						url: '/pages/userCenter/index'
					})
				} catch (e) {}
			}
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		position: relative;
	}

	.content-container {
		background-color: #fff;
		position: absolute;
		bottom: 10rpx;
		left: 0;
		right: 0;
		width: 96%;
		margin: auto;
		border-radius: 10rpx;
		display: flex;
		flex-direction: column;
	}

	.card-head {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 0 20rpx;
		height: 30px;
	}

	.card-head text {
		font-weight: bold;
		font-size: 28rpx;
		color: #333;
	}

	.card-info {
		flex: 1;
		overflow-y: auto;
	}

	.card-info-item {
		display: flex;
		justify-content: space-between;
		border-bottom: 1px solid #f0f0f0;
		padding: 20rpx;
	}

	.card-info-item label {
		font-weight: 500;
		font-size: 26rpx;
		color: #333;
		display: flex;
		gap: 6rpx;
		align-items: center;
	}

	.card-info-item label text {
		color: red;
	}

	.picker {
		font-weight: 500;
		font-size: 26rpx;
		color: #757575;
		display: flex;
		align-items: center;
	}

	.card-info input {
		text-align: right;
		font-weight: 500;
		font-size: 26rpx;
		color: #333;
	}

	.card-footer {
		height: 50px;
		color: white;
		text-align: center;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		font-weight: bold;
		font-size: 34rpx;
	}

	.card-footer view {
		width: 40%;
		padding: 10rpx;
		background: linear-gradient(88deg, #1576dc, #1b64b1);
		border-radius: 36rpx;
		text-align: center;
	}
</style>