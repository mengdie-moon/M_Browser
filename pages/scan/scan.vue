<template>
	<view class="result-container">
		<view class="result-content">
			<view class="mylogo">
				<image src="/static/index/logo.png" mode="aspectFill"></image>
			</view>
			<view class="otherBox">
				<view v-if="scanResult">
					<text class="result-label">扫码成功</text>
					<view class="result-text" selectable="true">{{ scanResult.result }}</view>
					<view class="result-info">类型: {{ scanResult.scanType }}</view>
					<view class="action-buttons">
						<button class="copy-btn" @click="copyResult">复制结果</button>
						<button class="search-btn" @click="searchResult" v-if="scanResult.scanType === 'QR_CODE'">搜索内容
						</button>
					</view>
				</view>
				<view v-if="scanError" class="error-tip">
					<text>{{ scanError }}</text>
				</view>
				<button class="result-btn" @click="startScan">开始扫码</button>
				<button class="album-btn" @click="chooseImageFromAlbum">
					打开相册
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				scanResult: null,
				scanError: null,
				scanTask: null
			};
		},
		methods: {
			startScan() {
				this.scanResult = null;
				this.scanError = null;
				this.scanTask = uni.scanCode({
					onlyFromCamera: true,
					scanType: ['qrCode', 'barCode'],
					success: (res) => {
						this.scanResult = res;
					},
					fail: (err) => {
						if (err.errMsg.includes('cancel')) {
							this.scanError = '已取消扫码';
						} else {
							this.scanError = '扫码失败，请重试';
						}
					},
					complete: () => {
						this.scanTask = null;
					}
				});
			},
			chooseImageFromAlbum() {
				uni.chooseImage({
					count: 1,
					sourceType: ['album'],
					sizeType: ['original'],
					success: (imgRes) => {
						const imgPath = imgRes.tempFilePaths[0];
						uni.scanCode({
							onlyFromCamera: false,
							path: imgPath,
							scanType: ['qrCode', 'barCode'],
							success: (scanRes) => {
								this.scanResult = scanRes;
								this.scanError = null;
							},
							fail: (err) => {
								this.scanError = '未识别到二维码/条形码';
								this.scanResult = null;
							}
						});
					},
					fail: (err) => {
						if (!err.errMsg.includes('cancel')) {
							this.scanError = '选择图片失败，请检查相册权限';
						}
					}
				});
			},
			copyResult() {
				uni.setClipboardData({
					data: this.scanResult.result,
					success: () => {
						uni.showToast({
							title: '复制成功',
							icon: 'success',
							duration: 1500
						});
					},
					fail: () => {
						uni.showToast({
							title: '复制失败',
							icon: 'none',
							duration: 1500
						});
					}
				});
			},
			searchResult() {
				uni.navigateTo({
					url: `/pages/searchPage/searchPage?query=${encodeURIComponent(this.scanResult.result)}`
				});
			}
		},
		onUnload() {
			if (this.scanTask) {
				this.scanTask.abort();
			}
		}
	};
</script>

<style lang="scss" scoped>
	.result-container {
		width: 100%;
		min-height: 100vh;
		padding: 50rpx 30rpx;
		box-sizing: border-box;
		display: flex;
		align-items: center;
	}
	
	.mylogo{
		margin: 0 auto 40rpx;
		width: 400rpx;
		height: 400rpx;
		image{
			width: 100%;
			height: 100%;
		}
	}
	
	.result-content {
		width: 100%;
		background: #fff;
		border-radius: 16rpx;
		padding: 40rpx;
	}

	.result-label {
		display: block;
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
	}

	.result-text {
		font-size: 28rpx;
		color: #666;
		word-break: break-all;
		padding: 25rpx 0;
		border-top: 1px solid #f0f0f0;
		border-bottom: 1px solid #f0f0f0;
		margin-bottom: 25rpx;
	}

	.result-info {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 40rpx;
	}

	.error-tip {
		color: #ff4d4f;
		font-size: 28rpx;
		text-align: center;
		padding: 30rpx 0;
		margin-bottom: 40rpx;
	}

	.result-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background-color: #007aff;
		color: #fff;
		font-size: 30rpx;
		border-radius: 44rpx;
		border: none;
		margin-bottom: 20rpx;
	}

	.album-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background-color: #fff;
		color: #007aff;
		font-size: 30rpx;
		border-radius: 44rpx;
		border: 1px solid #007aff;
	}
	
	.action-buttons {
		display: flex;
		justify-content: space-between;
		margin-bottom: 40rpx;
	}
	
	.copy-btn, .search-btn {
		flex: 1;
		height: 76rpx;
		line-height: 76rpx;
		font-size: 28rpx;
		border-radius: 38rpx;
		border: none;
	}
	
	.copy-btn {
		background-color: #5eb78f;
		color: #fff;
		margin-right: 20rpx;
	}
	
	.search-btn {
		background-color: #007aff;
		color: #fff;
	}
</style>