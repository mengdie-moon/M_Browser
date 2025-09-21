<template>
	<view class="container">
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
		<view class="header" ref="header">
			<u-icon name="arrow-left" size="45" @click="goBack" />
			<view class="searchbox">
				<u-input v-model="searchText" class="headerSearch" placeholder="搜索或输入网址" :border="false"
					confirm-type="search" @confirm="handleSearch">
					<template slot="prefix">
						<u-icon name="search" size="45" color="#999" />
					</template>
				</u-input>
			</view>
		</view>

		<view class="webview-container">
			<web-view v-show="bingSearchUrl" :src="bingSearchUrl" class="web-view" />

			<view v-if="!bingSearchUrl" class="placeholder">
				<u-icon name="search" size="80" color="#e0e0e0" />
				<view class="placeholder-text">输入搜索内容或网址开始浏览</view>
				<button class="search-btn" :class="searchText ? 'search-btn-true' : ''" @click="handleSearch">
					开始搜索
				</button>
			</view>
		</view>

		<BottomBar />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				searchText: '',
				bingSearchUrl: '',
				statusBarHeight: 0,
			}
		},
		onLoad(options) {
			const sys = uni.getSystemInfoSync()
			this.statusBarHeight = sys.statusBarHeight

			if (options?.query) {
				this.searchText = decodeURIComponent(options.query)
				this.updateSearchUrl()
			}
		},
		mounted() {
			// #ifdef APP-PLUS
			this.$nextTick(() => {
				this.adjustWebviewLayout()
			})
			// #endif
		},
		methods: {
			updateSearchUrl() {
				if (!this.searchText) return
				if (this.searchText.includes('.') && !this.searchText.includes(' ')) {
					if (!/^https?:\/\//.test(this.searchText)) {
						this.bingSearchUrl = 'https://' + this.searchText
					} else {
						this.bingSearchUrl = this.searchText
					}
				} else {
					this.bingSearchUrl = `https://www.bing.com/search?q=${encodeURIComponent(this.searchText)}`
				}
			},
			handleSearch() {
				if (!this.searchText) {
					uni.showToast({
						icon: 'none',
						title: '请输入网址/搜索内容'
					})
					return
				}
				this.updateSearchUrl()
				// #ifdef APP-PLUS
				this.$nextTick(() => this.adjustWebviewLayout())
				// #endif
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
					if (wv) {
						wv.setStyle({
							top,
							height,
							scalable: false
						})
					}
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

	.placeholder {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
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
			padding: 5rpx 30rpx;
			font-size: 32rpx;
			transition: all 0.4s;

			&.search-btn-true {
				background: #87cbef;
			}
		}
	}
</style>