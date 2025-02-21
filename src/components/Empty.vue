<template>
  <div class="full-page-container">
    <a-empty
      image="https://gw.alipayobjects.com/mdn/miniapp_social/afts/img/A*pevERLJC9v0AAAAAAAAAAABjAQAAAQ/original"
      :image-style="{
        height: '60px',
      }"
    >
      <template #description>
        <span> 暂无数据 </span>
      </template>
      <a-button type="primary">Create Now</a-button>
    </a-empty>
  </div>
</template>

<style scoped>
.full-page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
}
</style>
