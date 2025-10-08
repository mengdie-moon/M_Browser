<template>
	<view class="container">
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
		<view class="header">
			<u-icon name="arrow-left" size="45" @click="goBack" />
			<view class="searchbox">
				<u-input v-model="searchText" class="headerSearch" placeholder="搜索或输入网址" :border="false"
					confirm-type="search" @confirm="debouncedSearch">
					<template slot="prefix">
						<u-icon name="search" size="45" color="#999" />
					</template>
				</u-input>
			</view>
		</view>

		<view class="webview-container">
			<web-view v-if="bingSearchUrl" :key="bingSearchUrl" :src="bingSearchUrl" class="web-view" />
			<view v-if="!bingSearchUrl || showFailBox" class="placeholder-box">
				<view v-if="!showFailBox" class="placeholder">
					<u-icon name="search" size="80" color="#e0e0e0" />
					<view class="placeholder-text">输入搜索内容或网址开始浏览</view>
					<button class="search-btn" :class="searchText ? 'search-btn-true' : ''"
						@click="debouncedSearch">开始搜索</button>
				</view>
				<view v-else class="fail-card">
					<u-icon :name="failIcon" size="80" :color="failColor" />
					<view class="fail-title">{{ failTitle }}</view>
					<view class="fail-desc">{{ failDesc }}</view>
					<button class="search-btn-true" @click="debouncedSearch">重新搜索</button>
				</view>
			</view>
		</view>

		<BottomBar ref="bottomBar" />
	</view>
</template>

<script>
	import {
		debounce
	} from '@/utils/common.js'

	export default {
		data() {
			return {
				searchText: '',
				bingSearchUrl: '',
				statusBarHeight: 0,
				isSearching: false,
				loadEventLock: false,
				searchTimer: null,
				SEARCH_TIMEOUT: 6000,
				showFailBox: false,
				failIcon: 'close-circle',
				failColor: '#f44336',
				failTitle: '',
				failDesc: '',
				isNeedAutoRetry: false,
				lastSearchText: ''
			}
		},
		onLoad(options) {
			const sys = uni.getSystemInfoSync()
			this.statusBarHeight = sys.statusBarHeight
			if (options?.query) {
				this.searchText = decodeURIComponent(options.query)
				this.lastSearchText = this.searchText
				this.$nextTick(() => this.updateSearchUrl())
			}
			this.checkNetwork()
			this.listenNetChange()
		},
		onUnload() {
			this.clearSearchTimer()
			uni.offNetworkStatusChange(this._netChange)
			this.isNeedAutoRetry = false
			this.lastSearchText = ''
			const pages = getCurrentPages()
			const page = pages[pages.length - 1]
			const wv = page.$getAppWebview().children()[0]
			if (wv) {
				wv.removeEventListener('loaded', this.SearchLoad)
				wv.removeEventListener('error', this.SearchFailLoad)
			}
		},
		mounted() {
			this.$nextTick(() => {
				const pages = getCurrentPages()
				const page = pages[pages.length - 1]
				const wv = page.$getAppWebview().children()[0]
				if (wv) this.bindWebviewEvents(wv)
			})
		},
		methods: {
			checkNetwork() {
				uni.getNetworkType({
					success: (res) => {
						const {
							networkType
						} = res
						if (networkType === 'none') {
							this.showFail('offline')
						} else if (networkType === '3g') {
							if (this.showFailBox) this.showFailBox = false
							uni.showToast({
								icon: 'none',
								title: '当前网络较慢，加载可能延迟',
								duration: 2000
							})
						} else {
							if (this.showFailBox) this.showFailBox = false
						}
					},
					fail: () => this.showFail('offline')
				})
			},

			listenNetChange() {
				this._netChange = (res) => {
					const {
						isConnected,
						networkType
					} = res
					if (!isConnected || networkType === 'none') {
						this.showFail('offline')
					} else {
						this.showFailBox = false
						if (this.isNeedAutoRetry && this.lastSearchText) {
							this.searchText = this.lastSearchText
							this.debouncedSearch()
							this.isNeedAutoRetry = false
						}
					}
				}
				uni.onNetworkStatusChange(this._netChange)
			},

			showFail(type = 'fail', title = '搜索失败', desc = '请稍后重试') {
				const map = {
					fail: {
						icon: 'close-circle',
						color: '#f44336',
						title,
						desc
					},
					timeout: {
						icon: 'clock',
						color: '#ff9800',
						title: '搜索超时',
						desc: '请求超时，请重试'
					},
					empty: {
						icon: 'file-text',
						color: '#999',
						title: '无结果',
						desc: '换关键词再试一次'
					},
					offline: {
						icon: 'wifi-off',
						color: '#ff9800',
						title: '网络连接已断开',
						desc: '请检查 Wi-Fi 或移动数据后重试'
					},
				}
				const cfg = map[type] || map.fail
				this.failIcon = cfg.icon
				this.failColor = cfg.color
				this.failTitle = cfg.title
				this.failDesc = cfg.desc
				this.showFailBox = true
				uni.hideLoading()
			},

			clearSearchTimer() {
				if (this.searchTimer) {
					clearTimeout(this.searchTimer)
					this.searchTimer = null
				}
			},

			debouncedSearch: debounce(function() {
				this.handleSearch()
			}, 400),

			handleSearch() {
				if (this.showFailBox && this.failTitle === '网络连接已断开') {
					uni.showToast({
						icon: 'none',
						title: '您的网络/移动数据已断开'
					})
					this.isNeedAutoRetry = true
					return
				}
				if (!this.searchText.trim()) {
					uni.showToast({
						icon: 'none',
						title: '请输入网址/搜索内容'
					})
					this.isNeedAutoRetry = false
					return
				}
				if (this.isSearching) return

				this.isSearching = true
				this.showFailBox = false
				this.loadEventLock = false
				this.lastSearchText = this.searchText
				this.isNeedAutoRetry = true

				uni.showLoading({
					title: '🔍ing...',
					mask: true
				})
				this.clearSearchTimer()
				this.searchTimer = setTimeout(() => {
					this.showFail('timeout')
					this.isSearching = false
				}, this.SEARCH_TIMEOUT)

				this.updateSearchUrl()
				this.$nextTick(() => this.adjustWebviewLayout())
			},

			updateSearchUrl() {
				const txt = this.searchText.trim()
				if (!txt) return
				this.bingSearchUrl = txt.includes('.') && !txt.includes(' ') ?
					(/^https?:\/\//.test(txt) ? txt : 'https://' + txt) :
					`https://www.bing.com/search?q=${encodeURIComponent(txt)}`
				this.$nextTick(() => {
					const pages = getCurrentPages()
					const page = pages[pages.length - 1]
					const wv = page.$getAppWebview().children()[0]
					if (wv) this.bindWebviewEvents(wv)
				})
			},

			bindWebviewEvents(wv) {
				if (!wv) return
				wv.removeEventListener('loaded', this.SearchLoad)
				wv.removeEventListener('error', this.SearchFailLoad)
				wv.addEventListener('loaded', this.SearchLoad)
				wv.addEventListener('error', this.SearchFailLoad)
				this.$refs.bottomBar && this.$refs.bottomBar.setWebview(wv)
			},

			SearchLoad() {
				if (this.loadEventLock) return
				this.loadEventLock = true
				this.clearSearchTimer()
				this.isSearching = false
				this.isNeedAutoRetry = false
				uni.hideLoading()
			},

			SearchFailLoad() {
				if (this.loadEventLock) return
				this.loadEventLock = true
				this.clearSearchTimer()
				this.isSearching = false

				uni.getNetworkType({
					success: (res) => {
						if (res.networkType === 'none') {
							this.showFail('offline')
							this.isNeedAutoRetry = true
						} else {
							this.showFail('fail', '网页加载失败', '可能是网址无效或服务器异常')
							this.isNeedAutoRetry = false
						}
					},
					fail: () => {
						this.showFail('offline')
						this.isNeedAutoRetry = true
					}
				})
			},

			adjustWebviewLayout() {
				const sys = uni.getSystemInfoSync()
				const headerHeight = uni.upx2px(88)
				const footerHeight = uni.upx2px(100)
				const top = this.statusBarHeight + headerHeight
				const height = sys.windowHeight - top - footerHeight
				const pages = getCurrentPages()
				const page = pages[pages.length - 1]
				const currentWebview = page.$getAppWebview()
				setTimeout(() => {
					const wv = currentWebview.children()[0]
					if (wv) wv.setStyle({
						top,
						height,
						scalable: false
					})
				}, 150)
			},

			goBack() {
				uni.navigateBack({
					delta: 1
				})
			},

			goHome() {
				uni.navigateTo({
					url: '/pages/index/index'
				})
			},
		},
	}
</script>

<style lang="scss" scoped>
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #fff;
		position: relative;
	}

	.status-bar {
		background: #fff;
	}

	.header {
		display: flex;
		align-items: center;
		padding: 0 32rpx;
		height: 88rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		background: #fff;
		z-index: 100;
		position: relative;

		.searchbox {
			flex: 1;
			margin-left: 20rpx;

			.headerSearch {
				background: #f5f5f5;
				border-radius: 40rpx;
				padding: 10rpx 20rpx;
				display: flex;
				align-items: center;
			}
		}
	}

	.webview-container {
		flex: 1;
		position: relative;
		padding-top: calc(var(--status-bar-height) + 88rpx);
		padding-bottom: 100rpx;
	}

	.web-view {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}

	.placeholder-box {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #999;

		.placeholder-text {
			font-size: 36rpx;
			margin: 40rpx 0;
		}

		.search-btn {
			background: #b39999;
			color: #fff;
			border: none;
			border-radius: 16rpx;
			padding: 10rpx 40rpx;
			font-size: 32rpx;
			transition: all 0.4s;
		}
	}

	.fail-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0 60rpx;
		text-align: center;

		.fail-title {
			font-size: 32rpx;
			color: #333;
			font-weight: 600;
			margin-top: 24rpx;
		}

		.fail-desc {
			font-size: 28rpx;
			color: #999;
			margin: 12rpx 0 40rpx;
		}

		.search-btn-true {
			background: #b39999;
			color: #fff;
			border: none;
			border-radius: 16rpx;
			padding: 10rpx 40rpx;
			font-size: 28rpx;
			transition: all 0.4s;
		}
	}
</style>