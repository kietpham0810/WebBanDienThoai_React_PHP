<script setup>
import { ref, onMounted } from 'vue';
import { userService } from '../api/userService';

const users = ref([]);
const loading = ref(false);
const errorMsg = ref('');
const saving = ref(false);

const isEditing = ref(false);
const editingId = ref(null);
const form = ref({
  name: '',
  email: '',
  phone: '',
  role: 'user',
});

const fetchUsers = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    const data = await userService.getAll();
    // Assuming backend returns an array directly, or { data: [...] }
    users.value = Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    errorMsg.value = 'Failed to load users: ' + error.message;
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = { name: '', email: '', phone: '', role: 'user' };
  isEditing.value = false;
  editingId.value = null;
};

const startEdit = (user) => {
  if (!user) return;
  isEditing.value = true;
  editingId.value = user.id;
  form.value = {
    name: user.name || user.username || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'user',
  };
};

const submitForm = async () => {
  errorMsg.value = '';
  saving.value = true;
  try {
    const payload = {
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      phone: form.value.phone.trim(),
      role: form.value.role,
    };

    if (isEditing.value && editingId.value != null) {
      await userService.update(editingId.value, payload);
    } else {
      await userService.create(payload);
    }

    resetForm();
    await fetchUsers();
  } catch (error) {
    errorMsg.value = 'Failed to save user: ' + error.message;
    console.error(error);
  } finally {
    saving.value = false;
  }
};

const deleteUser = async (user) => {
  if (!user || user.id == null) return;
  const ok = window.confirm(`Delete user #${user.id}?`);
  if (!ok) return;
  errorMsg.value = '';
  saving.value = true;
  try {
    await userService.remove(user.id);
    if (isEditing.value && editingId.value === user.id) {
      resetForm();
    }
    await fetchUsers();
  } catch (error) {
    errorMsg.value = 'Failed to delete user: ' + error.message;
    console.error(error);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="admin-container">
    <div class="header">
      <h2>User Management</h2>
    </div>

    <div class="form-card">
      <h3 class="section-title">{{ isEditing ? 'Edit User' : 'Add User' }}</h3>
      <form class="user-form" @submit.prevent="submitForm">
        <div class="form-grid">
          <div class="form-group">
            <label for="name">Name</label>
            <input id="name" v-model="form.name" type="text" required />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" v-model="form.email" type="email" required />
          </div>
          <div class="form-group">
            <label for="phone">Phone</label>
            <input id="phone" v-model="form.phone" type="text" />
          </div>
          <div class="form-group">
            <label for="role">Role</label>
            <select id="role" v-model="form.role">
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-primary" type="submit" :disabled="saving">
            {{ isEditing ? 'Update User' : 'Add User' }}
          </button>
          <button
            v-if="isEditing"
            class="btn-secondary"
            type="button"
            :disabled="saving"
            @click="resetForm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <div v-if="errorMsg" class="error-alert">
      {{ errorMsg }}
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading users...</p>
    </div>

    <div v-else class="table-card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th class="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="users.length === 0">
              <td colspan="6" class="empty-state">No users found.</td>
            </tr>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td class="fw-bold">{{ user.name || user.username || 'N/A' }}</td>
              <td>{{ user.email || 'N/A' }}</td>
              <td>{{ user.phone || 'N/A' }}</td>
              <td>
                <span class="badge" :class="user.role === 'admin' ? 'badge-admin' : 'badge-user'">
                  {{ user.role || 'user' }}
                </span>
              </td>
              <td class="actions-col">
                <button class="btn-icon edit" :disabled="saving" @click="startEdit(user)">Edit</button>
                <button class="btn-icon delete" :disabled="saving" @click="deleteUser(user)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.admin-container {
  font-family: 'Inter', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: #333;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.read-only-note {
  margin-bottom: 1rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
}

.form-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);
}

.btn-primary:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.table-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th,
.data-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.data-table th {
  background-color: #f9fafb;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.data-table tbody tr:hover {
  background-color: #f9fafb;
}

.fw-bold {
  font-weight: 600;
  color: #111827;
}

.actions-col {
  text-align: right;
  white-space: nowrap;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.badge-admin {
  background-color: #fee2e2;
  color: #991b1b;
}

.badge-user {
  background-color: #e0e7ff;
  color: #3730a3;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
  margin-left: 0.5rem;
}

.btn-icon:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon.edit {
  color: #4f46e5;
}
.btn-icon.edit:hover {
  background-color: #e0e7ff;
}

.btn-icon.delete {
  color: #ef4444;
}
.btn-icon.delete:hover {
  background-color: #fee2e2;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  backdrop-filter: blur(4px);
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: modal-fade-in 0.3s ease-out;
}

@keyframes modal-fade-in {
  from { opacity: 0; transform: translateY(1rem); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: #9ca3af;
  cursor: pointer;
}

.close-btn:hover {
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.spinner {
  border: 4px solid #f3f4f6;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-alert {
  background-color: #fef2f2;
  border-left: 4px solid #ef4444;
  color: #b91c1c;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 0.25rem;
}

.empty-state {
  text-align: center;
  padding: 3rem !important;
  color: #6b7280;
  font-style: italic;
}
</style>
