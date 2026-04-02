<script setup>
import { ref, onMounted } from 'vue'
import { userService } from '../api/userService'

const users = ref([])
const loading = ref(false)
const errorMsg = ref('')
const saving = ref(false)

const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  name: '',
  email: '',
  password: '',
  role: 'user',
})

const fetchUsers = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const data = await userService.getAll()
    users.value = Array.isArray(data) ? data : data?.data || []
  } catch (error) {
    errorMsg.value = `Failed to load users: ${error.message}`
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = { name: '', email: '', password: '', role: 'user' }
  isEditing.value = false
  editingId.value = null
}

const startEdit = (user) => {
  isEditing.value = true
  editingId.value = user.id
  form.value = {
    name: user.name || '',
    email: user.email || '',
    password: '',
    role: user.role || 'user',
  }
}

const submitForm = async () => {
  errorMsg.value = ''
  if (!form.value.name.trim() || !form.value.email.trim()) {
    errorMsg.value = 'Name and email are required.'
    return
  }
  if (!isEditing.value && !form.value.password.trim()) {
    errorMsg.value = 'Password is required for new users.'
    return
  }

  saving.value = true
  try {
    const payload = {
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      role: form.value.role,
    }
    if (!isEditing.value) {
      payload.password = form.value.password.trim()
    }

    if (isEditing.value && editingId.value != null) {
      await userService.update(editingId.value, payload)
    } else {
      await userService.create(payload)
    }

    resetForm()
    await fetchUsers()
  } catch (error) {
    errorMsg.value = `Failed to save user: ${error.message}`
  } finally {
    saving.value = false
  }
}

const deleteUser = async (user) => {
  if (!user?.id) return
  if (!window.confirm(`Delete user #${user.id}?`)) return
  saving.value = true
  errorMsg.value = ''
  try {
    await userService.remove(user.id)
    if (editingId.value === user.id) resetForm()
    await fetchUsers()
  } catch (error) {
    errorMsg.value = `Failed to delete user: ${error.message}`
  } finally {
    saving.value = false
  }
}

onMounted(fetchUsers)
</script>

<template>
  <div class="page-grid">
    <div class="card">
      <div class="card-header">
        <h3 class="section-title">{{ isEditing ? 'Edit User' : 'Add User' }}</h3>
        <span class="badge badge-info">Role-based Access</span>
      </div>
      <p class="notice">Password is required only when creating a new user.</p>
      <form class="form-grid" @submit.prevent="submitForm">
        <div class="form-group">
          <label class="label" for="user-name">Name</label>
          <input id="user-name" v-model="form.name" class="input" type="text" required />
        </div>
        <div class="form-group">
          <label class="label" for="user-email">Email</label>
          <input id="user-email" v-model="form.email" class="input" type="email" required />
        </div>
        <div class="form-group" v-if="!isEditing">
          <label class="label" for="user-password">Password</label>
          <input id="user-password" v-model="form.password" class="input" type="password" required />
        </div>
        <div class="form-group">
          <label class="label" for="user-role">Role</label>
          <select id="user-role" v-model="form.role" class="select">
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div>
          <button class="btn btn-primary" type="submit" :disabled="saving">
            {{ isEditing ? 'Update User' : 'Add User' }}
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
        <h3 class="section-title">User List</h3>
        <span class="badge badge-muted">{{ users.length }} records</span>
      </div>

      <div v-if="loading" class="notice">Loading users...</div>
      <div v-else class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="users.length === 0">
              <td colspan="5">No users found.</td>
            </tr>
            <tr v-for="user in users" :key="user.id">
              <td>#{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="badge" :class="user.role === 'admin' ? 'badge-info' : 'badge-muted'">
                  {{ user.role }}
                </span>
              </td>
              <td>
                <button class="btn btn-ghost" @click="startEdit(user)" :disabled="saving">Edit</button>
                <button class="btn btn-danger" @click="deleteUser(user)" :disabled="saving">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
