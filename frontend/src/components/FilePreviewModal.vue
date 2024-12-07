<template>
  <div v-if="isVisible" class="modal">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <div v-if="file && file.type.startsWith('image/')">
        <img :src="fileUrl" alt="Preview" />
      </div>
      <div v-else-if="file && file.type === 'application/pdf'">
        <iframe :src="fileUrl" width="100%" height="500px"></iframe>
      </div>
      <div v-else-if="file && file.type.startsWith('text/')">
        <pre>{{ fileContent }}</pre>
      </div>
      <div v-else>
        <p>Unsupported file type for preview.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps(['file', 'isVisible', 'fileUrl', 'fileContent']);
const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};
</script>

<style scoped>
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 15px;
  cursor: pointer;
}
</style>