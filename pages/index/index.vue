<template>
	<view class="container">
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		<view class="header">
			<view class="header-left">
				<u-icon class="HeaderLeftSearch" name="search" size="45"></u-icon>
				<text class="header-text">主页</text>
			</view>
			<view class="header-right">
				<u-icon name="scan" size="45"></u-icon>
			</view>
		</view>
		<view class="main-content">
			<view class="logo">
				<image src="../../static/index/logo.png" mode="aspectFill"></image>
			</view>
			<view class="search-box">
				<u-input class="search" placeholder="搜索或输入网址" border="none" v-model="searchText" @confirm="handleSearch"
					:animation="true" :clearabled="false">
					<template slot="prefix">
						<u-icon name="search" size="45" color="#999"></u-icon>
					</template>
				</u-input>
			</view>
		</view>

		<BottomBarNav />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				searchText: '',
				statusBarHeight: 0
			}
		},
		onLoad(options) {
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight;
			if (options?.backQuery) {
				this.searchText = decodeURIComponent(options.backQuery)
			}
		},
		methods: {
			handleSearch() {
				if (this.searchText) {
					uni.navigateTo({
						url: `/pages/searchPage/searchPage?query=${encodeURIComponent(this.searchText)}`
					})
				}
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
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16rpx 32rpx;
		box-sizing: border-box;

		.header-left {
			display: flex;
			align-items: center;
		}

		.HeaderLeftSearch {
			position: relative;
			padding: 13rpx;
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

		.header-text {
			font-size: 32rpx;
			font-weight: 450;
		}

		.header-right {
			position: relative;
			padding: 13rpx;
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
	}

	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 0 64rpx;
		margin-bottom: 30%;
	}

	.logo {
		width: 350rpx;
		height: 350rpx;

		image {
			width: 100%;
			height: 100%;
		}
	}

	.search-box {
		width: 100%;
		height: 90rpx;
		border-radius: 50rpx;
		border: 1px solid #dddddd;
		padding: 0 32rpx;
		box-sizing: border-box;
		display: flex;
		align-items: center;

		.search {
			border: none;
		}
	}

	.footer {
		padding: 16rpx 0;

		.toolbar {
			display: flex;
			justify-content: space-around;
			align-items: center;
			padding: 0 64rpx;
		}
	}
	
	.footer{
		box-shadow: none;
	}
</style>