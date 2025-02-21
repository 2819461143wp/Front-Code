<template>
  <a-switch v-model:checked="ellipsis" />
  <a-typography-paragraph
    :ellipsis="ellipsis"
    content=" Ant Design, a design language for background applications, is refined by Ant UED Team. Ant
    Design, a design language for background applications, is refined by Ant UED Team. Ant
    Design, a design language for background applications, is refined by Ant UED Team. Ant
    Design, a design language for background applications, is refined by Ant UED Team. Ant
    Design, a design language for background applications, is refined by Ant UED Team. Ant
    Design, a design language for background applications, is refined by Ant UED Team."
  />

  <a-typography-paragraph
    :ellipsis="ellipsis ? { rows: 2, expandable: true, symbol: 'more' } : false"
    content="Ant Design, a design language for background applications, is refined by Ant UED Team. Ant
    Design, a design language for background applications, is refined by Ant UED Team. Ant
    Design, a design language for background applications, is refined by Ant UED Team. Ant
    Design, a design language for background applications, is refined by Ant UED Team. Ant
    Design, a design language for background applications, is refined by Ant UED Team. Ant
    Design, a design language for background applications, is refined by Ant UED Team."
  />

  <a-typography-text
    :style="ellipsis ? { width: '100px' } : {}"
    :ellipsis="ellipsis ? { tooltip: 'I am ellipsis now!' } : false"
    content="Ant Design, a design language for background applications, is refined by Ant UED Team."
  />
  <br />
  <a-comment>
    <template #actions>
      <span key="comment-nested-reply-to">Reply to</span>
    </template>
    <template #author>
      <a>Han Solo</a>
    </template>
    <template #avatar>
      <a-avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />
    </template>
    <template #content>
      <p>
        We supply a series of design principles, practical patterns and high
        quality design resources (Sketch and Axure).
      </p>
    </template>
    <a-comment>
      <template #actions>
        <span>Reply to</span>
      </template>
      <template #author>
        <a>Han Solo</a>
      </template>
      <template #avatar>
        <a-avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />
      </template>
      <template #content>
        <p>
          We supply a series of design principles, practical patterns and high
          quality design resources (Sketch and Axure).
        </p>
      </template>
      <a-comment>
        <template #actions>
          <span>Reply to</span>
        </template>
        <template #author>
          <a>Han Solo</a>
        </template>
        <template #avatar>
          <a-avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />
        </template>
        <template #content>
          <p>
            We supply a series of design principles, practical patterns and high
            quality design resources (Sketch and Axure).
          </p>
        </template>
      </a-comment>
      <a-comment>
        <template #actions>
          <span>Reply to</span>
        </template>
        <template #author>
          <a>Han Solo</a>
        </template>
        <template #avatar>
          <a-avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />
        </template>
        <template #content>
          <p>
            We supply a series of design principles, practical patterns and high
            quality design resources (Sketch and Axure).
          </p>
        </template>
      </a-comment>
    </a-comment>
  </a-comment>
</template>

<script lang="ts" setup>
import { ref } from "vue";
const ellipsis = ref(true);
</script>

<style scoped></style>
