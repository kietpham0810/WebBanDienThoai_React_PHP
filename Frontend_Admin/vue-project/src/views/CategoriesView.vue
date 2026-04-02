<script setup>
import { ref, onMounted } from 'vue'
import { categoryService } from '../api/categoryService'

const categories = ref([])
const loading = ref(false)
const errorMsg = ref('')
const saving = ref(false)

const isEditing = ref(false)
const editingId = ref(null)
const form = ref({ name: '' })

const fetchCategories = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const data = await categoryService.getAll()
    categories.value = Array.isArray(data) ? data : data?.data || []
  } catch (error) {
    errorMsg.value = `Failed to load categories: ${error.message}`
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = { name: '' }
  isEditing.value = false
  editingId.value = null
}

const startEdit = (category) => {
  isEditing.value = true
  editingId.value = category.id
  form.value = { name: category.name || '' }
}

const submitForm = async () => {
  errorMsg.value = ''
  if (!form.value.name.trim()) {
    errorMsg.value = 'Category name is required.'
    return
  }

  saving.value = true
  try {
    const payload = { name: form.value.name.trim() }
    if (isEditing.value && editingId.value != null) {
      await categoryService.update(editingId.value, payload)
    } else {
      await categoryService.create(payload)
    }

    resetForm()
    await fetchCategories()
  } catch (error) {
    errorMsg.value = `Failed to save category: ${error.message}`
  } finally {
    saving.value = false
  }
}

const deleteCategory = async (category) => {
  if (!category?.id) return
  if (!window.confirm(`Delete category #${category.id}?`)) return
  saving.value = true
  errorMsg.value = ''
  try {
    await categoryService.remove(category.id)
    if (editingId.value === category.id) resetForm()
    await fetchCategories()
  } catch (error) {
    errorMsg.value = `Failed to delete category: ${error.message}`
  } finally {
    saving.value = false
  }
}

onMounted(fetchCategories)
</script>

<template>
  <div class="page-grid">
    <div class="card">
      <div class="card-header">
        <h3 class="section-title">{{ isEditing ? 'Edit Category' : 'Add Category' }}</h3>
        <span class="badge badge-info">Catalog</span>
      </div>
      <form class="form-grid" @submit.prevent="submitForm">
        <div class="form-group" style="grid-column: 1 / -1">
          <label class="label" for="category-name">Category Name</label>
          <input id="category-name" v-model="form.name" class="input" type="text" required />
        </div>
        <div>
          <button class="btn btn-primary" type="submit" :disabled="saving">
            {{ isEditing ? 'Update Category' : 'Add Category' }}
          </button>
          <button v-if="isEditing" class="btn btn-ghost" type="button" @click="resetForm" :disabled="saving">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>

    <div class="card">
      <div class="card-header">
        <h3 class="section-title">Category List</h3>
        <span class="badge badge-muted">{{ categories.length }} items</span>
      </div>
      <div v-if="loading" class="notice">Loading categories...</div>
      <div v-else class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="categories.length === 0">
              <td colspan="3">No categories found.</td>
            </tr>
            <tr v-for="category in categories" :key="category.id">
              <td>#{{ category.id }}</td>
              <td>{{ category.name }}</td>
              <td>
                <button class="btn btn-ghost" @click="startEdit(category)" :disabled="saving">Edit</button>
                <button class="btn btn-danger" @click="deleteCategory(category)" :disabled="saving">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
