<template>
  <div class="file-content-viewer">
    <div v-if="loading" class="loading">Loading file content...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <h3>{{ fileName }}</h3>
      <pre v-if="isTextFile" class="text-content">{{ content }}</pre>
      <img v-if="isImageFile" :src="content" class="image-content" />
    </div>
    <button @click="$emit('close')" class="close-btn">Close</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';

const props = defineProps({ fileName: String });
const loading = ref(false);
const content = ref(null);
const error = ref(null);
const isTextFile = ref(false);
const isImageFile = ref(false);

const fetchFileContent = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/files/content/${props.fileName}`);
    content.value = response.data.content;
    const type = response.data.type;
    isTextFile.value = type.startsWith('text/');
    isImageFile.value = type.startsWith('image/');
  } catch (err) {
    error.value = 'Failed to load file content.';
  } finally {
    loading.value = false;
  }
};

watch(() => props.fileName, fetchFileContent, { immediate: true });
</script>

<style scoped>
.file-content-viewer {
  max-width: 800px;
  margin: 0 auto;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.text-content {
  background-color: white;
  border: 1px solid #ddd;
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.image-content {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.loading, .error, .no-content, .unsupported {
  text-align: center;
  color: #666;
  padding: 20px;
}

.retry-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>