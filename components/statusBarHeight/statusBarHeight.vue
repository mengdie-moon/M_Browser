<template>
	<view :style="{ paddingTop: statusBarHeight + 'px' }"></view>
</template>
<script>
	export default {
		name: "statusBarHeight",
		data() {
			return {
				statusBarHeight: 0
			};
		},
		onLoad() {
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight || 0;
		}
	}
</script>
<style lang="scss"></style>