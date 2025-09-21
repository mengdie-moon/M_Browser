<template>
	<view class="footer">
		<view class="toolbar">
			<u-icon class="toolbarIcon" name="arrow-left" size="45" :color="canBack ? '#333' : '#ccc'"
				@click="goBack" />
			<u-icon class="toolbarIcon" name="arrow-right" size="45" :color="canForward ? '#333' : '#ccc'"
				@click="goForward" />
			<u-icon class="toolbarIcon" name="home" size="45" @click="goHome" />
			<u-icon class="toolbarIcon" name="search" size="45" @click="goSearch" />
			<u-icon class="toolbarIcon" name="list" size="45" />
		</view>
	</view>
</template>

<script>
	export default {
		name: 'BottomBar',
		data() {
			return {
				canBack: false,
				canForward: false,
			}
		},
		mounted() {
			// #ifdef APP-PLUS
			this.$nextTick(() => {
				const pages = getCurrentPages()
				const self = pages[pages.length - 1].$getAppWebview()
				this.wv = self.children()[0]
				if (this.wv) {
					this.wv.addEventListener('loaded', this.updateState)
					this.updateState()
				}
			})
			// #endif

			// #ifndef APP-PLUS
			this.canBack = getCurrentPages().length > 1
			// #endif
		},
		beforeDestroy() {
			// #ifdef APP-PLUS
			if (this.wv) this.wv.removeEventListener('loaded', this.updateState)
			// #endif
		},
		methods: {
			updateState() {
				// #ifdef APP-PLUS
				if (this.wv) {
					this.canBack = this.wv.canBack()
					this.canForward = this.wv.canForward()
				}
				// #endif
			},
			goBack() {
				// #ifdef APP-PLUS
				if (this.canBack) this.wv.back()
				// #endif
				// #ifndef APP-PLUS
				uni.navigateBack()
				// #endif
			},
			goForward() {
				// #ifdef APP-PLUS
				if (this.canForward) this.wv.forward()
				// #endif
			},
			goHome() {
				uni.reLaunch({
					url: '/pages/index/index'
				})
			},
			goSearch() {},
		},
	}
</script>

<style lang="scss" scoped>
	.footer {
		padding: 16rpx 0;
		background: #fff;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
		position: relative;
		z-index: 100;
	}

	.toolbar {
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 0 64rpx;
	}

	.toolbarIcon {
		position: relative;
		padding: 6rpx;
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