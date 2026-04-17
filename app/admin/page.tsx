"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 12,
    orders: 8,
    users: 5,
  });

  return (
    <div className="admin-container">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <a className="active">Dashboard</a>
          <a>Products</a>
          <a>Orders</a>
          <a>Users</a>
          <a>Logout</a>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="admin-main">
        <h1>Dashboard Overview</h1>

        {/* STATS */}
        <div className="admin-stats">
          <div className="card">
            <h3>Total Products</h3>
            <p>{stats.products}</p>
          </div>
          <div className="card">
            <h3>Total Orders</h3>
            <p>{stats.orders}</p>
          </div>
          <div className="card">
            <h3>Users</h3>
            <p>{stats.users}</p>
          </div>
        </div>

        {/* TABLE */}
        <div className="admin-table">
          <h2>Recent Orders</h2>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Joy</td>
                <td>Flower Bouquet</td>
                <td>₱250</td>
                <td className="status done">Completed</td>
              </tr>
              <tr>
                <td>Ana</td>
                <td>Keychain</td>
                <td>₱150</td>
                <td className="status pending">Pending</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

    </div>
  );
}