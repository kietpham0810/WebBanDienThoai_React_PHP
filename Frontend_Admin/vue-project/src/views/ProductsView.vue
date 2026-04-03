<script setup>
import { ref, onMounted, computed } from 'vue'
import { productService, PRODUCT_IMAGE_BASE_URL } from '../api/productService'
import { categoryService } from '../api/categoryService'

const products = ref([])
const categories = ref([])
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const saving = ref(false)

const isEditing = ref(false)
const editingId = ref(null)

// Trạng thái tìm kiếm / lọc
const searchQuery = ref('')
const filterStatus = ref('')

const form = ref({
  name: '',
  price: '',
  description: '',
  category_id: '',
  stock: 0,
  status: 0,
  imageFile: null,     // File object thực sự để upload
  imagePreview: null,  // URL preview cục bộ
  imageCurrent: '',    // Tên file ảnh hiện tại (khi edit)
})

// Lọc danh sách sản phẩm
const filteredProducts = computed(() => {
  return products.value.filter((p) => {
    const matchSearch = !searchQuery.value || p.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchStatus = filterStatus.value === '' || String(p.status) === String(filterStatus.value)
    return matchSearch && matchStatus
  })
})

const formatPrice = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)

// Lấy URL ảnh đầy đủ
const getImageUrl = (image) => {
  if (!image) return null
  // Nếu là URL tuyệt đối hoặc data URL
  if (image.startsWith('http') || image.startsWith('data:')) return image
  // Nếu là tên file do hệ thống upload
  if (image.startsWith('product_')) return PRODUCT_IMAGE_BASE_URL + image
  // File ảnh cũ (tên đơn giản như iphone15.jpg)
  return PRODUCT_IMAGE_BASE_URL + image
}

const fetchProducts = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const data = await productService.getAll()
    products.value = Array.isArray(data) ? data : data?.data || []
  } catch (error) {
    errorMsg.value = `Lỗi tải danh sách sản phẩm: ${error.message}`
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const data = await categoryService.getAll()
    categories.value = Array.isArray(data) ? data : data?.data || []
  } catch (error) {
    errorMsg.value = `Lỗi tải danh mục: ${error.message}`
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    price: '',
    description: '',
    category_id: '',
    stock: 0,
    status: 0,
    imageFile: null,
    imagePreview: null,
    imageCurrent: '',
  }
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
    category_id: product.category_id || '',
    stock: product.stock ?? 0,
    status: product.status ?? 0,
    imageFile: null,
    imagePreview: null,
    imageCurrent: product.image || '',
  }
  // Scroll lên form
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Khi người dùng chọn file ảnh
const onImageChange = (event) => {
  const file = event.target.files[0]
  if (!file) {
    form.value.imageFile = null
    form.value.imagePreview = null
    return
  }
  form.value.imageFile = file
  form.value.imagePreview = URL.createObjectURL(file)
}

const removeImage = () => {
  form.value.imageFile = null
  form.value.imagePreview = null
  form.value.imageCurrent = ''
  // Reset input file
  const fileInput = document.getElementById('product-image')
  if (fileInput) fileInput.value = ''
}

const submitForm = async () => {
  errorMsg.value = ''
  successMsg.value = ''

  if (!form.value.name.trim() || !form.value.price || !form.value.category_id) {
    errorMsg.value = 'Vui lòng nhập đầy đủ: Tên sản phẩm, Giá và Danh mục!'
    return
  }
  if (Number(form.value.price) < 0) {
    errorMsg.value = 'Giá không được âm!'
    return
  }

  saving.value = true
  try {
    const payload = {
      name: form.value.name.trim(),
      price: Number(form.value.price),
      description: form.value.description?.trim() || '',
      category_id: Number(form.value.category_id),
      stock: Number(form.value.stock) || 0,
      status: Number(form.value.status),
    }

    // Đính kèm file ảnh nếu có
    if (form.value.imageFile) {
      payload.image = form.value.imageFile
    } else if (form.value.imageCurrent) {
      payload.image = form.value.imageCurrent
    }

    if (isEditing.value && editingId.value != null) {
      await productService.update(editingId.value, payload)
      successMsg.value = 'Cập nhật sản phẩm thành công!'
    } else {
      await productService.create(payload)
      successMsg.value = 'Thêm sản phẩm thành công!'
    }

    resetForm()
    await fetchProducts()

    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (error) {
    errorMsg.value = `Lỗi lưu sản phẩm: ${error.response?.data?.message || error.message}`
  } finally {
    saving.value = false
  }
}

const deleteProduct = async (product) => {
  if (!product?.id) return
  if (!window.confirm(`Bạn chắc chắn muốn xóa sản phẩm "${product.name}"?`)) return
  saving.value = true
  errorMsg.value = ''
  try {
    await productService.remove(product.id)
    if (editingId.value === product.id) resetForm()
    await fetchProducts()
    successMsg.value = 'Xóa sản phẩm thành công!'
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (error) {
    errorMsg.value = error.response?.data?.message || `Lỗi xóa sản phẩm: ${error.message}`
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (product) => {
  const newStatus = product.status === 1 ? 0 : 1
  try {
    await productService.update(product.id, { status: newStatus })
    product.status = newStatus
  } catch (error) {
    errorMsg.value = `Lỗi đổi trạng thái: ${error.message}`
  }
}

onMounted(async () => {
  await fetchCategories()
  await fetchProducts()
})
</script>

<template>
  <div class="page-grid">
    <!-- FORM THÊM / SỬA SẢN PHẨM -->
    <div class="card">
      <div class="card-header">
        <h3 class="section-title">
          <span class="title-icon">{{ isEditing ? '✏️' : '➕' }}</span>
          {{ isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới' }}
        </h3>
        <span class="badge badge-info">Danh mục sản phẩm</span>
      </div>

      <form class="form-grid" @submit.prevent="submitForm" enctype="multipart/form-data">
        <!-- Tên sản phẩm -->
        <div class="form-group">
          <label class="label" for="product-name">
            Tên sản phẩm <span class="required">*</span>
          </label>
          <input
            id="product-name"
            v-model="form.name"
            class="input"
            type="text"
            placeholder="VD: iPhone 15 Pro Max"
            required
          />
        </div>

        <!-- Giá -->
        <div class="form-group">
          <label class="label" for="product-price">
            Giá (VNĐ) <span class="required">*</span>
          </label>
          <input
            id="product-price"
            v-model="form.price"
            class="input"
            type="number"
            min="0"
            placeholder="VD: 33990000"
            required
          />
        </div>

        <!-- Danh mục -->
        <div class="form-group">
          <label class="label" for="product-category">
            Danh mục <span class="required">*</span>
          </label>
          <select id="product-category" v-model="form.category_id" class="select" required>
            <option disabled value="">-- Chọn danh mục --</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- Tồn kho -->
        <div class="form-group">
          <label class="label" for="product-stock">Số lượng tồn kho</label>
          <input
            id="product-stock"
            v-model="form.stock"
            class="input"
            type="number"
            min="0"
            placeholder="0"
          />
        </div>

        <!-- Trạng thái -->
        <div class="form-group">
          <label class="label" for="product-status">Trạng thái hiển thị</label>
          <select id="product-status" v-model="form.status" class="select">
            <option :value="1">✅ Đang bán</option>
            <option :value="0">🔴 Tạm ẩn</option>
          </select>
        </div>

        <!-- Upload ảnh -->
        <div class="form-group image-upload-group">
          <label class="label" for="product-image">Ảnh sản phẩm</label>

          <!-- Preview ảnh -->
          <div class="image-preview-wrapper">
            <div v-if="form.imagePreview || form.imageCurrent" class="image-preview">
              <img
                :src="form.imagePreview || getImageUrl(form.imageCurrent)"
                alt="Preview ảnh sản phẩm"
                class="preview-img"
                @error="$event.target.style.display='none'"
              />
              <button type="button" class="remove-image-btn" @click="removeImage" title="Xoá ảnh">✕</button>
            </div>
            <label v-else for="product-image" class="upload-placeholder">
              <span class="upload-icon">📷</span>
              <span>Nhấn để chọn ảnh</span>
              <span class="upload-hint">JPG, PNG, GIF, WEBP · Tối đa 5MB</span>
            </label>
          </div>

          <input
            id="product-image"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            class="file-input"
            @change="onImageChange"
          />
          <label for="product-image" class="btn btn-outline-sm" style="margin-top: 8px; cursor: pointer; display: inline-block;">
            {{ form.imageCurrent || form.imagePreview ? '🔄 Đổi ảnh' : '📁 Chọn ảnh' }}
          </label>
        </div>

        <!-- Mô tả -->
        <div class="form-group" style="grid-column: 1 / -1">
          <label class="label" for="product-description">Mô tả sản phẩm</label>
          <textarea
            id="product-description"
            v-model="form.description"
            class="textarea"
            rows="3"
            placeholder="Nhập mô tả chi tiết sản phẩm..."
          ></textarea>
        </div>

        <!-- Buttons -->
        <div class="form-actions" style="grid-column: 1 / -1">
          <button class="btn btn-primary" type="submit" :disabled="saving">
            <span v-if="saving">⏳ Đang lưu...</span>
            <span v-else>{{ isEditing ? '💾 Cập nhật sản phẩm' : '➕ Thêm sản phẩm' }}</span>
          </button>
          <button
            v-if="isEditing"
            class="btn btn-ghost"
            type="button"
            @click="resetForm"
            :disabled="saving"
          >
            ✕ Hủy
          </button>
        </div>
      </form>
    </div>

    <!-- THÔNG BÁO -->
    <div v-if="successMsg" class="alert alert-success">✅ {{ successMsg }}</div>
    <div v-if="errorMsg" class="alert alert-error">❌ {{ errorMsg }}</div>

    <!-- DANH SÁCH SẢN PHẨM -->
    <div class="card">
      <div class="card-header">
        <h3 class="section-title">📦 Danh sách sản phẩm</h3>
        <span class="badge badge-muted">{{ filteredProducts.length }} / {{ products.length }} sản phẩm</span>
      </div>

      <!-- Bộ lọc & tìm kiếm -->
      <div class="filter-bar">
        <input
          v-model="searchQuery"
          class="input search-input"
          type="text"
          placeholder="🔍 Tìm theo tên sản phẩm..."
        />
        <select v-model="filterStatus" class="select filter-select">
          <option value="">Tất cả trạng thái</option>
          <option value="1">✅ Đang bán</option>
          <option value="0">🔴 Tạm ẩn</option>
        </select>
      </div>

      <div v-if="loading" class="notice">⏳ Đang tải danh sách sản phẩm...</div>
      <div v-else class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredProducts.length === 0">
              <td colspan="8" style="text-align: center; color: #888; padding: 32px;">
                Không tìm thấy sản phẩm nào.
              </td>
            </tr>
            <tr v-for="product in filteredProducts" :key="product.id" class="product-row">
              <td class="td-id">#{{ product.id }}</td>
              <td class="td-image">
                <div class="product-thumb-wrapper">
                  <img
                    v-if="product.image"
                    :src="getImageUrl(product.image)"
                    :alt="product.name"
                    class="product-thumb"
                    @error="$event.target.style.display='none'"
                  />
                  <div v-else class="product-thumb-placeholder">📦</div>
                </div>
              </td>
              <td class="td-name">
                <span class="product-name">{{ product.name }}</span>
              </td>
              <td>
                <span class="badge badge-category">{{ product.category_name || 'N/A' }}</span>
              </td>
              <td class="td-price">{{ formatPrice(product.price) }}</td>
              <td>
                <span :class="['badge', product.stock > 0 ? 'badge-stock' : 'badge-out']">
                  {{ product.stock > 0 ? product.stock : 'Hết hàng' }}
                </span>
              </td>
              <td>
                <button
                  class="status-toggle"
                  :class="product.status == 1 ? 'status-active' : 'status-hidden'"
                  @click="toggleStatus(product)"
                  :title="product.status == 1 ? 'Đang bán - Nhấn để ẩn' : 'Đang ẩn - Nhấn để bật'"
                >
                  {{ product.status == 1 ? '✅ Đang bán' : '🔴 Tạm ẩn' }}
                </button>
              </td>
              <td class="td-actions">
                <button class="btn btn-ghost btn-sm" @click="startEdit(product)" :disabled="saving">
                  ✏️ Sửa
                </button>
                <button class="btn btn-danger btn-sm" @click="deleteProduct(product)" :disabled="saving">
                  🗑️ Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== Layout ===== */
.page-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ===== Required mark ===== */
.required {
  color: #ef4444;
}

/* ===== Alert messages ===== */
.alert {
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
}
.alert-success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}
.alert-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

/* ===== Filter bar ===== */
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.search-input {
  flex: 1;
  min-width: 200px;
}
.filter-select {
  min-width: 180px;
}

/* ===== Image upload ===== */
.image-upload-group {
  grid-column: 1 / -1;
}
.image-preview-wrapper {
  margin-bottom: 6px;
}
.image-preview {
  position: relative;
  display: inline-block;
}
.preview-img {
  width: 140px;
  height: 140px;
  object-fit: cover;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
}
.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  transition: background 0.2s;
}
.remove-image-btn:hover {
  background: #b91c1c;
}
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: 140px;
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  color: #9ca3af;
  cursor: pointer;
  gap: 6px;
  font-size: 13px;
  transition: border-color 0.2s, background 0.2s;
}
.upload-placeholder:hover {
  border-color: #6366f1;
  background: #f5f3ff;
  color: #6366f1;
}
.upload-icon {
  font-size: 32px;
}
.upload-hint {
  font-size: 11px;
  color: #b0b7c3;
}
.file-input {
  display: none;
}
.btn-outline-sm {
  padding: 6px 14px;
  font-size: 13px;
  border-radius: 8px;
  border: 1.5px solid #6366f1;
  color: #6366f1;
  background: transparent;
  transition: all 0.2s;
}
.btn-outline-sm:hover {
  background: #6366f1;
  color: white;
}

/* ===== Form actions ===== */
.form-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

/* ===== Table ===== */
.td-id {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 600;
}
.td-image {
  width: 72px;
}
.product-thumb-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
}
.product-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}
.product-row:hover .product-thumb {
  transform: scale(1.08);
}
.product-thumb-placeholder {
  font-size: 26px;
  opacity: 0.5;
}
.td-name {
  max-width: 220px;
}
.product-name {
  font-weight: 600;
  color: #1f2937;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.td-price {
  font-weight: 700;
  color: #059669;
  white-space: nowrap;
}
.td-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* ===== Badges ===== */
.badge-category {
  background: #ede9fe;
  color: #7c3aed;
  font-size: 12px;
  white-space: nowrap;
}
.badge-stock {
  background: #d1fae5;
  color: #065f46;
  font-size: 12px;
}
.badge-out {
  background: #fee2e2;
  color: #b91c1c;
  font-size: 12px;
}

/* ===== Status toggle button ===== */
.status-toggle {
  border: none;
  cursor: pointer;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
}
.status-active {
  background: #d1fae5;
  color: #065f46;
}
.status-active:hover {
  background: #a7f3d0;
}
.status-hidden {
  background: #fee2e2;
  color: #b91c1c;
}
.status-hidden:hover {
  background: #fecaca;
}

/* ===== Small buttons ===== */
.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}

/* ===== Title icon ===== */
.title-icon {
  margin-right: 6px;
}
</style>
