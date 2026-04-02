<script setup>
import { ref, onMounted } from 'vue'
import { orderService } from '../api/orderService'

const orders = ref([])
const loading = ref(false)
const errorMsg = ref('')
const saving = ref(false)
const statusDrafts = ref({})

const detailOpen = ref(false)
const selectedOrder = ref(null)
const orderItems = ref([])

const statusOptions = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled']

const formatPrice = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('vi-VN')
}

const fetchOrders = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const data = await orderService.getAll()
    orders.value = Array.isArray(data) ? data : data?.data || []
    const draft = {}
    orders.value.forEach((order) => {
      draft[order.id] = order.status || 'pending'
    })
    statusDrafts.value = draft
  } catch (error) {
    errorMsg.value = `Failed to load orders: ${error.message}`
  } finally {
    loading.value = false
  }
}

const updateStatus = async (order) => {
  saving.value = true
  errorMsg.value = ''
  try {
    await orderService.updateStatus(order.id, statusDrafts.value[order.id])
    await fetchOrders()
  } catch (error) {
    errorMsg.value = `Failed to update status: ${error.message}`
  } finally {
    saving.value = false
  }
}

const viewDetails = async (order) => {
  detailOpen.value = true
  selectedOrder.value = null
  orderItems.value = []
  try {
    const data = await orderService.getById(order.id)
    selectedOrder.value = data.order
    orderItems.value = data.items || []
  } catch (error) {
    errorMsg.value = `Failed to load order details: ${error.message}`
  }
}

const closeDetails = () => {
  detailOpen.value = false
  selectedOrder.value = null
  orderItems.value = []
}

onMounted(fetchOrders)
</script>

<template>
  <div class="page-grid">
    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>

    <div class="card">
      <div class="card-header">
        <h3 class="section-title">Orders</h3>
        <span class="badge badge-muted">{{ orders.length }} orders</span>
      </div>

      <div v-if="loading" class="notice">Loading orders...</div>
      <div v-else class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="orders.length === 0">
              <td colspan="6">No orders found.</td>
            </tr>
            <tr v-for="order in orders" :key="order.id">
              <td>#{{ order.id }}</td>
              <td>{{ order.customer_name || 'N/A' }}</td>
              <td>{{ formatDate(order.order_date) }}</td>
              <td>{{ formatPrice(order.total) }}</td>
              <td>
                <select v-model="statusDrafts[order.id]" class="select">
                  <option v-for="status in statusOptions" :key="status" :value="status">
                    {{ status }}
                  </option>
                  <option v-if="!statusOptions.includes(order.status)" :value="order.status">
                    {{ order.status }}
                  </option>
                </select>
              </td>
              <td>
                <button class="btn btn-ghost" @click="viewDetails(order)">View</button>
                <button class="btn btn-primary" @click="updateStatus(order)" :disabled="saving">
                  Save
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="detailOpen" class="modal">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <p class="label">Order Details</p>
            <h3 class="section-title">Order #{{ selectedOrder?.id || '-' }}</h3>
          </div>
          <button class="btn btn-ghost" @click="closeDetails">Close</button>
        </div>
        <div v-if="selectedOrder" class="modal-body">
          <div class="detail-grid">
            <div>
              <p class="label">Customer</p>
              <p>{{ selectedOrder.customer_name }}</p>
            </div>
            <div>
              <p class="label">Date</p>
              <p>{{ formatDate(selectedOrder.order_date) }}</p>
            </div>
            <div>
              <p class="label">Status</p>
              <p>{{ selectedOrder.status }}</p>
            </div>
            <div>
              <p class="label">Total</p>
              <p>{{ formatPrice(selectedOrder.total) }}</p>
            </div>
          </div>

          <div class="table-wrapper" style="margin-top: 1rem">
            <table class="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="orderItems.length === 0">
                  <td colspan="3">No items.</td>
                </tr>
                <tr v-for="item in orderItems" :key="item.id">
                  <td>{{ item.product_name || 'N/A' }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatPrice(item.price || item.product_price) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="notice">Loading details...</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(20, 20, 20, 0.4);
  display: grid;
  place-items: center;
  padding: 1.5rem;
  z-index: 30;
}

.modal-card {
  width: min(780px, 100%);
  background: var(--panel-bg);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: var(--shadow-lg);
  animation: fade-in 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  background: #fff6ef;
  padding: 1rem;
  border-radius: 14px;
}
</style>
