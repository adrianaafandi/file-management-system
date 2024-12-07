<template>
  <div id="app" class="container">
    <header>
      <h1>File Management System</h1>
    </header>
    
    <main>
      <section class="file-upload-section">
        <h2>Upload New File</h2>
        <FileUpload @file-uploaded="refreshFileList" />
      </section>
      
      <section class="file-list-section">
        <FileList ref="fileListRef" />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FileUpload from './components/FileUpload.vue';
import FileList from './components/FileList.vue';

const fileListRef = ref(null)

const refreshFileList = () => {
  // If you want to implement a method to refresh files after upload
  if (fileListRef.value) {
    fileListRef.value.fetchFiles()
  }
}
</script>

<style>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.file-upload-section, 
.file-list-section {
  background-color: #f4f4f4;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}
</style>