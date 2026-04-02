<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink, RouterView } from 'vue-router'

const route = useRoute()

const titleMap = {
  users: 'User Management',
  products: 'Product Catalog',
  categories: 'Category Management',
  orders: 'Order Management',
}

const pageTitle = computed(() => titleMap[route.name] || 'Admin Console')
</script>

<template>
  <div class="admin-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">WH</div>
        <div class="brand-text">
          <h1>WebThayHung</h1>
          <p>Admin Console</p>
        </div>
      </div>
      <nav class="nav">
        <RouterLink to="/users" class="nav-link">Users</RouterLink>
        <RouterLink to="/products" class="nav-link">Products</RouterLink>
        <RouterLink to="/categories" class="nav-link">Categories</RouterLink>
        <RouterLink to="/orders" class="nav-link">Orders</RouterLink>
      </nav>
      <div class="sidebar-footer">
        <p>DB: web_ban_dien_thoai</p>
      </div>
    </aside>

    <main class="content">
      <header class="topbar">
        <div>
          <p class="eyebrow">Admin Area</p>
          <h2>{{ pageTitle }}</h2>
        </div>
        <div class="topbar-actions">
          <div class="status-pill">
            <span class="dot"></span>
            Live
          </div>
        </div>
      </header>

      <section class="page">
        <RouterView />
      </section>
    </main>
  </div>
</template>

<style scoped>
.admin-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 260px 1fr;
  background: var(--app-bg);
  color: var(--text-primary);
}

.sidebar {
  display: flex;
  flex-direction: column;
  padding: 2rem 1.5rem;
  background: var(--panel-bg);
  border-right: 1px solid var(--panel-border);
  position: sticky;
  top: 0;
  height: 100vh;
}

.brand {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 2rem;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-weight: 700;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #ff7a59, #ffb347);
  color: #1b1b1b;
}

.brand-text h1 {
  font-family: var(--font-display);
  font-size: 1.1rem;
  margin: 0;
}

.brand-text p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.nav {
  display: grid;
  gap: 0.4rem;
}

.nav-link {
  padding: 0.7rem 0.9rem;
  border-radius: 12px;
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 600;
  background: transparent;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: rgba(255, 122, 89, 0.12);
}

.nav-link.router-link-active {
  background: rgba(255, 122, 89, 0.2);
  color: #ff7a59;
}

.sidebar-footer {
  margin-top: auto;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.content {
  padding: 2.5rem 3rem 3rem;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.7rem;
  color: var(--text-muted);
  margin: 0 0 0.4rem 0;
}

.topbar h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  background: rgba(39, 174, 96, 0.15);
  color: #27ae60;
  font-weight: 600;
  font-size: 0.85rem;
}

.status-pill .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #27ae60;
}

.page {
  animation: fade-up 0.4s ease;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: relative;
    height: auto;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .nav {
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    overflow-x: auto;
  }

  .content {
    padding: 2rem 1.5rem 3rem;
  }
}

@media (max-width: 720px) {
  .sidebar {
    flex-direction: column;
    align-items: flex-start;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
