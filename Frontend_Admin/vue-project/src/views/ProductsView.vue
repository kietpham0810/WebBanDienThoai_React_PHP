<script setup>
import { ref, onMounted } from 'vue'
import { productService } from '../api/productService'
import { categoryService } from '../api/categoryService'

const products = ref([])
const categories = ref([])
const loading = ref(false)
const errorMsg = ref('')
const saving = ref(false)

const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  name: '',
  price: '',
  description: '',
  image: '',
  category_id: '',
})

const formatPrice = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)

const fetchProducts = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const data = await productService.getAll()
    products.value = Array.isArray(data) ? data : data?.data || []
  } catch (error) {
    errorMsg.value = `Failed to load products: ${error.message}`
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const data = await categoryService.getAll()
    categories.value = Array.isArray(data) ? data : data?.data || []
  } catch (error) {
    errorMsg.value = `Failed to load categories: ${error.message}`
  }
}

const resetForm = () => {
  form.value = { name: '', price: '', description: '', image: '', category_id: '' }
  isEditing.value = false
  editingId.value = null
}

const startEdit = (product) => {
  isEditing.value = true
  editingId.value = product.id
  form.value = {
    name: product.name || '',
    price: product.price || '',
    description: product.description || '',
    image: product.image || '',
    category_id: product.category_id || '',
  }
}

const submitForm = async () => {
  errorMsg.value = ''
  if (!form.value.name.trim() || !form.value.price || !form.value.category_id) {
    errorMsg.value = 'Name, price, and category are required.'
    return
  }

  saving.value = true
  try {
    const payload = {
      name: form.value.name.trim(),
      price: Number(form.value.price),
      description: form.value.description?.trim() || null,
      image: form.value.image?.trim() || null,
      category_id: Number(form.value.category_id),
    }

    if (isEditing.value && editingId.value != null) {
      await productService.update(editingId.value, payload)
    } else {
      await productService.create(payload)
    }

    resetForm()
    await fetchProducts()
  } catch (error) {
    errorMsg.value = `Failed to save product: ${error.message}`
  } finally {
    saving.value = false
  }
}

const deleteProduct = async (product) => {
  if (!product?.id) return
  if (!window.confirm(`Delete product #${product.id}?`)) return
  saving.value = true
  errorMsg.value = ''
  try {
    await productService.remove(product.id)
    if (editingId.value === product.id) resetForm()
    await fetchProducts()
  } catch (error) {
    errorMsg.value = `Failed to delete product: ${error.message}`
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await fetchCategories()
  await fetchProducts()
})
</script>

<template>
  <div class="page-grid">
    <div class="card">
      <div class="card-header">
        <h3 class="section-title">{{ isEditing ? 'Edit Product' : 'Add Product' }}</h3>
        <span class="badge badge-info">Catalog</span>
      </div>
      <form class="form-grid" @submit.prevent="submitForm">
        <div class="form-group">
          <label class="label" for="product-name">Name</label>
          <input id="product-name" v-model="form.name" class="input" type="text" required />
        </div>
        <div class="form-group">
          <label class="label" for="product-price">Price</label>
          <input id="product-price" v-model="form.price" class="input" type="number" min="0" required />
        </div>
        <div class="form-group">
          <label class="label" for="product-category">Category</label>
          <select id="product-category" v-model="form.category_id" class="select" required>
            <option disabled value="">Select category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="label" for="product-image">Image</label>
          <input id="product-image" v-model="form.image" class="input" type="text" placeholder="iphone15.jpg" />
        </div>
        <div class="form-group" style="grid-column: 1 / -1">
          <label class="label" for="product-description">Description</label>
          <textarea id="product-description" v-model="form.description" class="textarea" rows="3"></textarea>
        </div>
        <div>
          <button class="btn btn-primary" type="submit" :disabled="saving">
            {{ isEditing ? 'Update Product' : 'Add Product' }}
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
        <h3 class="section-title">Product List</h3>
        <span class="badge badge-muted">{{ products.length }} items</span>
      </div>
      <div v-if="loading" class="notice">Loading products...</div>
      <div v-else class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="products.length === 0">
              <td colspan="6">No products found.</td>
            </tr>
            <tr v-for="product in products" :key="product.id">
              <td>#{{ product.id }}</td>
              <td>{{ product.name }}</td>
              <td>{{ product.category_name || 'N/A' }}</td>
              <td>{{ formatPrice(product.price) }}</td>
              <td>{{ product.image || '-' }}</td>
              <td>
                <button class="btn btn-ghost" @click="startEdit(product)" :disabled="saving">Edit</button>
                <button class="btn btn-danger" @click="deleteProduct(product)" :disabled="saving">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
