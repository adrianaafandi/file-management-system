<template>
  <div class="file-upload">
    <input 
      type="file" 
      @change="handleFileUpload"
      class="file-input"
    />
    <button 
      @click="uploadFile" 
      :disabled="!selectedFile"
      class="upload-button"
    >
      Upload File
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const selectedFile = ref(null)
const uploadError = ref(null)

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

const uploadFile = async () => {
  if (!selectedFile.value) return

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    const response = await axios.post('/files', {
      name: selectedFile.value.name,
      path: `/uploads/${selectedFile.value.name}`,
      size: selectedFile.value.size,
      type: selectedFile.value.type
    })

    console.log('File uploaded successfully:', response.data)
    selectedFile.value = null
    uploadError.value = null
  } catch (error) {
    console.error('File upload failed:', error)
    uploadError.value = error.message
  }
}
</script>

<style scoped>
.file-upload {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.file-input {
  flex-grow: 1;
}

.upload-button {
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

.upload-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>