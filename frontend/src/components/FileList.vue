<template>
    <div class="file-list">
      <div v-if="loading" class="loading-spinner">
        Loading files...
      </div>
  
      <div v-else-if="error" class="error-message">
        {{ error }}
        <button @click="fetchFiles" class="retry-btn">Retry</button>
      </div>
  
      <template v-else>
        <table v-if="files.length" class="files-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Type</th>
              <th>Uploaded At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="file in files" :key="file.id">
              <td>
                <div class="file-name-container">
                  <span class="file-icon">{{ getFileIcon(file.type) }}</span>
                  <span>{{ file.name }}</span>
                </div>
              </td>
              <td>{{ formatFileSize(file.size) }}</td>
              <td>{{ file.type }}</td>
              <td>{{ formatDate(file.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button
                      v-if="isPreviewable(file.type)"
                      @click="viewFileContent(file.name)"
                      class="preview-btn"
                    >
                      View
                    </button>
                    <button
                      v-else
                      @click="downloadFile(file.name)"
                      class="download-btn"
                    >
                      Download
                    </button>
                  <button @click="deleteFile(file.id)" class="delete-btn"> Delete</button>
                  <button @click="editFile(file)" class="edit-btn">Edit</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="no-files-message">No files found.</p>
      </template>
  
      <div v-if="isEditModalVisible" class="modal">
      <div class="modal-content">
        <h3>Edit File</h3>
        <form @submit.prevent="updateFile">
          <label for="name">File Name:</label>
          <input v-model="editFileData.name" type="text" id="name" />

          <label for="name">File Path:</label>
          <input v-model="editFileData.path" type="text" id="path" />

          <div class="modal-actions">
            <button type="submit" class="save-btn">Save</button>
            <button type="button" @click="closeEditModal" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
    <div v-if="isFileContentModalVisible" class="modal">
      <div class="modal-content">
        <button @click="isFileContentModalVisible = false" class="close-btn">×</button>
        <FileContentViewer 
          v-if="selectedFile" 
          :fileName="selectedFile"
          @error="handleContentError"
        />
      </div>
    </div>
    </div>
  </template>
  
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import FileContentViewer from './FileContentViewer.vue';
  
  const files = ref([]);
  const loading = ref(true);
  const error = ref(null);
  const isEditModalVisible = ref(false);
  const editFileData = ref({ name: '', path: ''});
  const selectedFile = ref(null);
  const isFileContentModalVisible = ref(false);
  
  // Fetch files method
  const fetchFiles = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await axios.get('/files');
      files.value = response.data.data || [];
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch files. Please try again.';
      console.error('Fetch files error:', err);
    } finally {
      loading.value = false;
    }
  };

      const viewFileContent = (fileName) => {
      console.log("Selected file name:", fileName);
      selectedFile.value = fileName;
      isFileContentModalVisible.value = true;
    };

    const handleContentError = (error) => {
      console.error('File content error:', error);
    };

    const editFile = (file) => {
    editFileData.value = { ...file }; 
    isEditModalVisible.value = true;
    };

    const closeEditModal = () => {
      isEditModalVisible.value = false;
    };

    const updateFile = async () => {
      try {
        const response = await axios.put(`/files/${editFileData.value.id}`, editFileData.value);
        const updatedFile = response.data.data;
        const index = files.value.findIndex(file => file.id === updatedFile.id);
        if (index !== -1) {
          files.value[index] = updatedFile;
        }
        closeEditModal();
      } catch (err) {
        error.value = 'Failed to update file';
        console.error('Update file error:', err);
      }
    };

    const downloadFile = async (fileName) => {
    try {
      const response = await axios.get(`/files/download/${fileName}`, {
        responseType: 'blob',
      });

    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
      } catch (err) {
        console.error('File download error:', err);
        alert('Failed to download file.');
      }
    };

  const deleteFile = async (fileId) => {
    try {
      await axios.delete(`/files/${fileId}`);
      files.value = files.value.filter(file => file.id !== fileId);
    } catch (err) {
      error.value = 'Failed to delete file';
      console.error('Delete file error:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (fileType) => {
    const iconMap = {
      'image/': '📷',
      'video/': '🎥',
      'audio/': '🎵',
      'application/pdf': '📄',
      'text/': '📝',
      'application/': '📁'
    };
    
    for (const [type, icon] of Object.entries(iconMap)) {
      if (fileType.startsWith(type)) return icon;
    }
    return '📄'; // default icon
  };
  
  const isPreviewable = (fileType) => {
  // Define previewable file types
  return fileType.startsWith('image/') || fileType.startsWith('text/');
  };


  onMounted(fetchFiles);

  defineExpose({ fetchFiles });
  </script>
  
  <style scoped>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 80%;
  max-height: 80%;
  overflow: auto;
  position: relative;
}


.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}


  .modal h3 {
    text-align: center;
    margin-bottom: 20px;
  }

  /* Form Inputs */
  .modal-content form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .modal-content label {
    font-size: 14px;
    font-weight: bold;
  }

  .modal-content input {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }

  .modal-actions {
    display: flex;
    justify-content: space-between;
  }

  .file-list-controls {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .search-input, .sort-select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .files-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .files-table th, 
  .files-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  
  .file-name-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .file-icon {
    font-size: 1.2em;
  }
  
  .action-buttons {
    display: flex;
    gap: 10px;
  }

  .download-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px;
  cursor: pointer;
}

.download-btn:hover {
  background-color: #45a049;
}
  .delete-btn,
  .edit-btn,
  .save-btn,
  .cancel-btn {
    padding: 10px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .preview-btn {
    padding: 10px 30px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  
  .preview-btn,
  .save-btn {
    background-color: #4CAF50;
    color: white;
  }
  
  .preview-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .delete-btn,
  .cancel-btn {
    background-color: #ff4d4d;
    color: white;
  }

  .edit-btn {
    background-color: #4d8eff;
    color: white;
  }
  
  .loading-spinner, 
  .error-message, 
  .no-files-message {
    text-align: center;
    padding: 20px;
    color: #666;
  }
  
  .error-message {
    color: #d32f2f;
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