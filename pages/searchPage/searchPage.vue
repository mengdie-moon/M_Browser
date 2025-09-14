<template>
	<view class="container">
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		<view class="header">
			<u-icon name="arrow-left" size="45" @click="goBack"></u-icon>
			<view class="searchbox">
				<u-input class="headerSearch" placeholder="搜索或输入网址" :border="false" v-model="searchText" @confirm="handleSearch">
					<template slot="prefix">
						<u-icon name="search" size="45" color="#999"></u-icon>
					</template>
				</u-input>
			</view>
		</view>
		<view class="webview-container">
			<web-view v-if="bingSearchUrl" :src="bingSearchUrl" class="web-view"></web-view>
			<view v-else class="placeholder">
				<u-icon name="search" size="80" color="#e0e0e0"></u-icon>
				<view class="placeholder-text">输入搜索内容或网址开始浏览</view>
				<button class="search-btn" @click="handleSearch">开始搜索</button>
			</view>
		</view>
		<view class="footer">
			<view class="toolbar">
				<u-icon class="toolbarIcon" name="arrow-left" size="45" @click="goBack"></u-icon>
				<u-icon class="toolbarIcon" name="arrow-right" size="45" color="#ccc"></u-icon>
				<u-icon class="toolbarIcon" name="home" size="45" @click="goHome"></u-icon>
				<u-icon class="toolbarIcon" name="order" size="45"></u-icon>
				<u-icon class="toolbarIcon" name="list" size="45"></u-icon>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				searchText: '',
				bingSearchUrl: '',
				statusBarHeight: 0,
				headerHeight: 0,
				footerHeight: 0
			}
		},
		onLoad(options) {
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight;
			
			if (options?.query) {
				this.searchText = decodeURIComponent(options.query)
				this.updateSearchUrl()
			}
		},
		mounted() {
			uni.$on('updateSearchText', (text) => {
				this.searchText = text
			})
			this.$nextTick(() => {
				const query = uni.createSelectorQuery().in(this);
				query.select('.header').boundingClientRect(data => {
					this.headerHeight = data.height;
				}).exec();
				
				query.select('.footer').boundingClientRect(data => {
					this.footerHeight = data.height;
				}).exec();
			});
		},
		beforeDestroy() {
			uni.$off('updateSearchText')
		},
		methods: {
			updateSearchUrl() {
				if (this.searchText) {
					if (this.searchText.includes('.') && !this.searchText.includes(' ')) {
						if (!this.searchText.startsWith('http://') && !this.searchText.startsWith('https://')) {
							this.bingSearchUrl = 'https://' + this.searchText;
						} else {
							this.bingSearchUrl = this.searchText;
						}
					} else {
						this.bingSearchUrl = `https://www.bing.com/search?q=${encodeURIComponent(this.searchText)}`;
					}
				}
			},
			handleSearch() {
				if (this.searchText) {
					this.updateSearchUrl()
				}
			},
			goBack() {
				uni.navigateBack({
					delta: 1,
					success: () => {
						uni.$emit('updateSearchText', this.searchText)
					}
				})
			},
			goHome() {
				uni.switchTab({
					url: '/pages/index/index'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #fff;
		position: relative;
	}
	
	.status-bar {
		background-color: #fff;
	}
	
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16rpx 32rpx;
		height: 88rpx;
		box-sizing: border-box;
		background-color: #fff;
		box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
		z-index: 100;
		position: absolute;
		top: var(--status-bar-height);
		left: 0;
		right: 0;
		
		.searchbox {
			width: 100%;
			
			.headerSearch {
				width: 100%;
				border-radius: 40rpx;
				background-color: #f5f5f5;
				margin: 0 30rpx;
				box-sizing: border-box;
				display: flex;
				align-items: center;
				z-index: 100;
				position: relative;
				padding: 10rpx 20rpx;
			}
		}
	}
	
	.webview-container {
		flex: 1;
		overflow: hidden;
		position: relative;
		/* 添加顶部和底部内边距 */
		padding-top: calc(var(--status-bar-height) + 88rpx);
		padding-bottom: 100rpx;
	}
	
	.web-view {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}
	
	.placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 40rpx;
		text-align: center;
		color: #999;
		
		.placeholder-text {
			font-size: 36rpx;
			margin: 40rpx 0;
		}
		
		.search-btn {
			background-color: #007aff;
			color: white;
			border: none;
			border-radius: 16rpx;
			padding: 20rpx 40rpx;
			font-size: 32rpx;
		}
	}
	
	.footer {
		padding: 16rpx 0;
		background-color: #fff;
		box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
		z-index: 100;
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		
		.toolbar {
			display: flex;
			justify-content: space-around;
			align-items: center;
			padding: 0 64rpx;
		}
	}
	
	.toolbarIcon {
		position: relative;
		padding: 6px;
		border-radius: 4px;
		outline: 0;
		border: 0;
		cursor: pointer;
		overflow: hidden;
		transition: background-color .25s;
		
		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-image: radial-gradient(circle, #ccc 10%, transparent 10.1%);
			transform: scale(10);
			opacity: 0;
			transition: all .6s;
		}
		
		&:active::after {
			transform: scale(0);
			opacity: .5;
			transition: 0s;
		}
	}
</style>